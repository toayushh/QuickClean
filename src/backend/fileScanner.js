const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const SAFE_TEMP_PATHS = [
  process.env.TEMP || path.join(os.tmpdir()),
  'C:\\Windows\\Temp',
  path.join(os.homedir(), 'AppData', 'Local', 'Temp')
];

const APP_CACHE_PATHS = {
  'VSCode': path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'Cache'),
  'Discord': path.join(os.homedir(), 'AppData', 'Roaming', 'discord', 'Cache'),
  'Slack': path.join(os.homedir(), 'AppData', 'Roaming', 'Slack', 'Cache'),
  'Spotify': path.join(os.homedir(), 'AppData', 'Local', 'Spotify', 'Data'),
  'Teams': path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Teams', 'Cache')
};

async function scanTempFiles(testMode = false) {
  const result = {
    category: 'Temporary Files',
    filesFound: 0,
    totalSizeBytes: 0,
    totalSize: '0 MB',
    items: [],
    message: 'Scan complete'
  };

  if (testMode) {
    // Simulate temp files for demo
    result.filesFound = 234;
    result.totalSizeBytes = 450 * 1024 * 1024; // 450 MB
    result.totalSize = '450 MB';
    result.items = [
      { path: 'C:\\Users\\Demo\\AppData\\Local\\Temp\\file1.tmp', size: '120 MB', sizeBytes: 120 * 1024 * 1024 },
      { path: 'C:\\Windows\\Temp\\cache.dat', size: '200 MB', sizeBytes: 200 * 1024 * 1024 },
      { path: 'C:\\Users\\Demo\\AppData\\Local\\Temp\\logs', size: '130 MB', sizeBytes: 130 * 1024 * 1024 }
    ];
    return result;
  }

  try {
    for (const tempPath of SAFE_TEMP_PATHS) {
      if (await fs.pathExists(tempPath)) {
        const files = await scanDirectory(tempPath, 2); // Max depth 2
        result.items.push(...files);
      }
    }

    result.filesFound = result.items.length;
    result.totalSizeBytes = result.items.reduce((sum, item) => sum + item.sizeBytes, 0);
    result.totalSize = formatBytes(result.totalSizeBytes);
  } catch (error) {
    result.message = `Error: ${error.message}`;
  }

  return result;
}

async function scanAppData(testMode = false) {
  const result = {
    category: 'Application Cache',
    filesFound: 0,
    totalSizeBytes: 0,
    totalSize: '0 MB',
    items: [],
    message: 'Scan complete'
  };

  if (testMode) {
    // Simulate app cache for demo
    result.filesFound = 89;
    result.totalSizeBytes = 320 * 1024 * 1024; // 320 MB
    result.totalSize = '320 MB';
    result.items = [
      { path: 'VSCode Cache', size: '150 MB', sizeBytes: 150 * 1024 * 1024, app: 'VSCode' },
      { path: 'Discord Cache', size: '100 MB', sizeBytes: 100 * 1024 * 1024, app: 'Discord' },
      { path: 'Slack Cache', size: '70 MB', sizeBytes: 70 * 1024 * 1024, app: 'Slack' }
    ];
    return result;
  }

  try {
    for (const [appName, appPath] of Object.entries(APP_CACHE_PATHS)) {
      if (await fs.pathExists(appPath)) {
        const size = await getDirectorySize(appPath);
        if (size > 0) {
          result.items.push({
            path: appPath,
            app: appName,
            size: formatBytes(size),
            sizeBytes: size
          });
        }
      }
    }

    result.filesFound = result.items.length;
    result.totalSizeBytes = result.items.reduce((sum, item) => sum + item.sizeBytes, 0);
    result.totalSize = formatBytes(result.totalSizeBytes);
  } catch (error) {
    result.message = `Error: ${error.message}`;
  }

  return result;
}

async function scanDirectory(dirPath, maxDepth = 1, currentDepth = 0) {
  const items = [];
  
  if (currentDepth >= maxDepth) return items;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      try {
        if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          items.push({
            path: fullPath,
            size: formatBytes(stats.size),
            sizeBytes: stats.size
          });
        } else if (entry.isDirectory() && currentDepth < maxDepth - 1) {
          const subItems = await scanDirectory(fullPath, maxDepth, currentDepth + 1);
          items.push(...subItems);
        }
      } catch (err) {
        // Skip files we can't access
        continue;
      }
    }
  } catch (error) {
    // Skip directories we can't access
  }

  return items;
}

async function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      try {
        if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        } else if (entry.isDirectory()) {
          totalSize += await getDirectorySize(fullPath);
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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
  scanTempFiles,
  scanAppData
};
