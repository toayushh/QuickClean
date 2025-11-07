const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('quickclean', {
  scanSystem: (options) => ipcRenderer.invoke('scan-system', options),
  cleanItems: (items, dryRun) => ipcRenderer.invoke('clean-items', items, dryRun),
  scanBrowser: (browsers) => ipcRenderer.invoke('scan-browser', browsers),
  cleanBrowser: (browsers, dryRun) => ipcRenderer.invoke('clean-browser', browsers, dryRun),
  listInstalledApps: () => ipcRenderer.invoke('list-installed-apps'),
  uninstallApp: (appName) => ipcRenderer.invoke('uninstall-app', appName),
  scanRegistry: () => ipcRenderer.invoke('scan-registry'),
  exportReport: (data) => ipcRenderer.invoke('export-report', data),
  getSystemStats: (testMode) => ipcRenderer.invoke('get-system-stats', testMode),
  scanDuplicates: (folders, scanType, testMode) => ipcRenderer.invoke('scan-duplicates', folders, scanType, testMode),
  deleteDuplicates: (files, safeMode, dryRun) => ipcRenderer.invoke('delete-duplicates', files, safeMode, dryRun),
  getSystemHealth: (testMode) => ipcRenderer.invoke('get-system-health', testMode),
  listStartupPrograms: () => ipcRenderer.invoke('list-startup-programs'),
  disableStartupProgram: (programName) => ipcRenderer.invoke('disable-startup-program', programName),
  enableStartupProgram: (programName, programPath) => ipcRenderer.invoke('enable-startup-program', programName, programPath),
  // Disk Analyzer
  analyzeDisk: (targetPath, options) => ipcRenderer.invoke('analyze-disk', targetPath, options),
  getAvailableDrives: (testMode) => ipcRenderer.invoke('get-available-drives', testMode),
  getCommonFolders: () => ipcRenderer.invoke('get-common-folders')
});

// Expose system API for real-time hardware stats
contextBridge.exposeInMainWorld('systemAPI', {
  getStats: () => ipcRenderer.invoke('system:getStats')
});

// Expose optimizer API for performance optimization
contextBridge.exposeInMainWorld('optimizerAPI', {
  getProcesses: () => ipcRenderer.invoke('optimizer:getProcesses'),
  endProcess: (pid) => ipcRenderer.invoke('optimizer:endProcess', pid),
  endMultipleProcesses: (pids) => ipcRenderer.invoke('optimizer:endMultipleProcesses', pids),
  boostMemory: () => ipcRenderer.invoke('optimizer:boostMemory'),
  getStartupApps: () => ipcRenderer.invoke('optimizer:getStartupApps'),
  disableStartupApp: (appName, location) => ipcRenderer.invoke('optimizer:disableStartupApp', appName, location),
  enableStartupApp: (appName, appPath, location) => ipcRenderer.invoke('optimizer:enableStartupApp', appName, appPath, location),
  getOptimizationStats: () => ipcRenderer.invoke('optimizer:getOptimizationStats'),
  getPerformanceMetrics: () => ipcRenderer.invoke('optimizer:getPerformanceMetrics'),
  enablePerformanceMode: () => ipcRenderer.invoke('optimizer:enablePerformanceMode'),
  disablePerformanceMode: () => ipcRenderer.invoke('optimizer:disablePerformanceMode')
});
