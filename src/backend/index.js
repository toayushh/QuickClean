const fileScanner = require('./fileScanner');
const safeDelete = require('./safeDelete');
const browserCleaner = require('./browserCleaner');
const registryScanner = require('./registryScanner');
const uninstallManager = require('./uninstallManager');
const systemMonitor = require('./systemMonitor');
const duplicateFinder = require('./duplicateFinder');
const healthMonitor = require('./healthMonitor');
const startupManager = require('./startupManager');
const performanceManager = require('./performanceManager');
const diskAnalyzer = require('./diskAnalyzer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

async function scanSystem(options = {}) {
  const testMode = options.testMode || false;
  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    categories: [],
    totalSize: 0,
    totalFiles: 0
  };

  try {
    // Scan temp files
    const tempScan = await fileScanner.scanTempFiles(testMode);
    results.categories.push(tempScan);
    results.totalSize += tempScan.totalSizeBytes;
    results.totalFiles += tempScan.filesFound;

    // Scan app data
    const appScan = await fileScanner.scanAppData(testMode);
    results.categories.push(appScan);
    results.totalSize += appScan.totalSizeBytes;
    results.totalFiles += appScan.filesFound;

    results.totalSizeFormatted = formatBytes(results.totalSize);
    results.message = 'System scan complete';
  } catch (error) {
    results.success = false;
    results.error = error.message;
  }

  return results;
}

async function cleanItems(items, dryRun = true) {
  return await safeDelete.cleanFiles(items, dryRun);
}

async function scanBrowser(browsers = ['chrome', 'edge', 'firefox']) {
  return await browserCleaner.scanBrowsers(browsers);
}

async function cleanBrowser(browsers, dryRun = true) {
  return await browserCleaner.cleanBrowsers(browsers, dryRun);
}

async function listInstalledApps() {
  return await uninstallManager.listApps();
}

async function uninstallApp(appName) {
  return await uninstallManager.uninstall(appName);
}

async function scanRegistry() {
  return await registryScanner.scanOrphanKeys();
}

async function exportReport(data) {
  try {
    const reportsDir = path.join(os.homedir(), 'QuickClean', 'Reports');
    await fs.ensureDir(reportsDir);
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `QuickClean_Report_${timestamp}.json`;
    const filepath = path.join(reportsDir, filename);
    
    await fs.writeJson(filepath, data, { spaces: 2 });
    
    return {
      success: true,
      filepath,
      message: 'Report exported successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function getSystemStats(testMode = false) {
  return await systemMonitor.getSystemStats(testMode);
}

async function scanDuplicates(folders, scanType, testMode) {
  return await duplicateFinder.scanForDuplicates(folders, scanType, testMode);
}

async function deleteDuplicates(files, safeMode, dryRun) {
  return await duplicateFinder.deleteDuplicates(files, safeMode, dryRun);
}

async function getSystemHealth(testMode) {
  return await healthMonitor.getSystemHealth(testMode);
}

async function listStartupPrograms() {
  return await startupManager.listStartupPrograms();
}

async function disableStartupProgram(programName) {
  return await startupManager.disableStartupProgram(programName);
}

async function enableStartupProgram(programName, programPath) {
  return await startupManager.enableStartupProgram(programName, programPath);
}

// Performance Optimizer functions
async function getProcessList() {
  return await performanceManager.getProcessList();
}

async function endProcess(pid) {
  return await performanceManager.endProcess(pid);
}

async function endMultipleProcesses(pids) {
  return await performanceManager.endMultipleProcesses(pids);
}

async function boostMemory() {
  return await performanceManager.boostMemory();
}

async function getStartupApps() {
  return await performanceManager.getStartupApps();
}

async function disableStartupApp(appName, location) {
  return await performanceManager.disableStartupApp(appName, location);
}

async function enableStartupApp(appName, appPath, location) {
  return await performanceManager.enableStartupApp(appName, appPath, location);
}

async function getOptimizationStats() {
  return await performanceManager.getOptimizationStats();
}

async function getPerformanceMetrics() {
  return await performanceManager.getPerformanceMetrics();
}

async function enablePerformanceMode() {
  return await performanceManager.enablePerformanceMode();
}

async function disablePerformanceMode() {
  return await performanceManager.disablePerformanceMode();
}

// Disk Analyzer functions
async function analyzeDisk(targetPath, options) {
  return await diskAnalyzer.analyzeDisk(targetPath, options);
}

async function getAvailableDrives(testMode) {
  return await diskAnalyzer.getAvailableDrives(testMode);
}

async function getCommonFolders() {
  return diskAnalyzer.getCommonFolders();
}

module.exports = {
  scanSystem,
  cleanItems,
  scanBrowser,
  cleanBrowser,
  listInstalledApps,
  uninstallApp,
  scanRegistry,
  exportReport,
  getSystemStats,
  scanDuplicates,
  deleteDuplicates,
  getSystemHealth,
  listStartupPrograms,
  disableStartupProgram,
  enableStartupProgram,
  // Performance Optimizer
  getProcessList,
  endProcess,
  endMultipleProcesses,
  boostMemory,
  getStartupApps,
  disableStartupApp,
  enableStartupApp,
  getOptimizationStats,
  getPerformanceMetrics,
  enablePerformanceMode,
  disablePerformanceMode,
  // Disk Analyzer
  analyzeDisk,
  getAvailableDrives,
  getCommonFolders
};
