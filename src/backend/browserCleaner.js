const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

const BROWSER_PATHS = {
  chrome: {
    name: 'Google Chrome',
    process: 'chrome',
    cache: path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Cache')
  },
  edge: {
    name: 'Microsoft Edge',
    process: 'msedge',
    cache: path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache')
  },
  firefox: {
    name: 'Mozilla Firefox',
    process: 'firefox',
    cache: path.join(os.homedir(), 'AppData', 'Local', 'Mozilla', 'Firefox', 'Profiles')
  }
};

async function isBrowserRunning(processName) {
  try {
    const { stdout } = await execAsync(`powershell -Command "Get-Process ${processName} -ErrorAction SilentlyContinue | Select-Object -First 1"`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

async function getBrowserCacheSize(cachePath) {
  let totalSize = 0;
  
  try {
    if (!await fs.pathExists(cachePath)) {
      return 0;
    }

    const entries = await fs.readdir(cachePath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(cachePath, entry.name);
      
      try {
        if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        } else if (entry.isDirectory()) {
          totalSize += await getBrowserCacheSize(fullPath);
        }
      } catch (err) {
        continue;
      }
    }
  } catch (error) {
    // Skip
  }

  return totalSize;
}

async function scanBrowsers(browsers = ['chrome', 'edge', 'firefox']) {
  const result = {
    success: true,
    browsers: [],
    totalSize: 0,
    message: 'Browser scan complete'
  };

  for (const browserKey of browsers) {
    const browser = BROWSER_PATHS[browserKey];
    if (!browser) continue;

    const isRunning = await isBrowserRunning(browser.process);
    const cacheSize = await getBrowserCacheSize(browser.cache);

    result.browsers.push({
      name: browser.name,
      key: browserKey,
      isRunning,
      cachePath: browser.cache,
      cacheSize,
      cacheSizeFormatted: formatBytes(cacheSize),
      canClean: !isRunning && cacheSize > 0
    });

    result.totalSize += cacheSize;
  }

  result.totalSizeFormatted = formatBytes(result.totalSize);
  return result;
}

async function cleanBrowsers(browsers, dryRun = true) {
  const result = {
    success: true,
    dryRun,
    cleaned: [],
    failed: [],
    totalSizeFreed: 0,
    message: dryRun ? 'Dry run complete' : 'Browser cleaning complete'
  };

  for (const browserKey of browsers) {
    const browser = BROWSER_PATHS[browserKey];
    if (!browser) continue;

    const isRunning = await isBrowserRunning(browser.process);
    
    if (isRunning) {
      result.failed.push({
        browser: browser.name,
        reason: 'Browser is running. Please close it first.'
      });
      continue;
    }

    try {
      const cacheSize = await getBrowserCacheSize(browser.cache);
      
      if (!dryRun && cacheSize > 0) {
        await fs.emptyDir(browser.cache);
      }

      result.cleaned.push({
        browser: browser.name,
        sizeFreed: cacheSize,
        sizeFreedFormatted: formatBytes(cacheSize)
      });

      result.totalSizeFreed += cacheSize;
    } catch (error) {
      result.failed.push({
        browser: browser.name,
        reason: error.message
      });
    }
  }

  result.totalSizeFreedFormatted = formatBytes(result.totalSizeFreed);
  return result;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
  scanBrowsers,
  cleanBrowsers,
  isBrowserRunning
};
