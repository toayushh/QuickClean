const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

const backend = require('../backend');
const { registerSystemStatsHandler } = require('./systemMonitor');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: true,
    backgroundColor: '#ffffff'
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../../build/index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  // Register system stats IPC handler
  registerSystemStatsHandler();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('scan-system', async (event, options) => {
  try {
    return await backend.scanSystem(options);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clean-items', async (event, items, dryRun) => {
  try {
    return await backend.cleanItems(items, dryRun);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-browser', async (event, browsers) => {
  try {
    return await backend.scanBrowser(browsers);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clean-browser', async (event, browsers, dryRun) => {
  try {
    return await backend.cleanBrowser(browsers, dryRun);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-installed-apps', async () => {
  try {
    return await backend.listInstalledApps();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('uninstall-app', async (event, appName) => {
  try {
    return await backend.uninstallApp(appName);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-registry', async () => {
  try {
    return await backend.scanRegistry();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-report', async (event, data) => {
  try {
    return await backend.exportReport(data);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-system-stats', async (event, testMode) => {
  try {
    return await backend.getSystemStats(testMode);
  } catch (error) {
    return { cpu: 0, ram: { usage: 0 }, disk: { usage: 0 }, temperature: 0 };
  }
});

ipcMain.handle('scan-duplicates', async (event, folders, scanType, testMode) => {
  try {
    return await backend.scanDuplicates(folders, scanType, testMode);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-duplicates', async (event, files, safeMode, dryRun) => {
  try {
    return await backend.deleteDuplicates(files, safeMode, dryRun);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-system-health', async (event, testMode) => {
  try {
    return await backend.getSystemHealth(testMode);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-startup-programs', async () => {
  try {
    return await backend.listStartupPrograms();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('disable-startup-program', async (event, programName) => {
  try {
    return await backend.disableStartupProgram(programName);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('enable-startup-program', async (event, programName, programPath) => {
  try {
    return await backend.enableStartupProgram(programName, programPath);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Performance Optimizer IPC Handlers
ipcMain.handle('optimizer:getProcesses', async () => {
  try {
    return await backend.getProcessList();
  } catch (error) {
    return { success: false, error: error.message, processes: [] };
  }
});

ipcMain.handle('optimizer:endProcess', async (event, pid) => {
  try {
    return await backend.endProcess(pid);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:endMultipleProcesses', async (event, pids) => {
  try {
    return await backend.endMultipleProcesses(pids);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:boostMemory', async () => {
  try {
    return await backend.boostMemory();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:getStartupApps', async () => {
  try {
    return await backend.getStartupApps();
  } catch (error) {
    return { success: false, error: error.message, apps: [] };
  }
});

ipcMain.handle('optimizer:disableStartupApp', async (event, appName, location) => {
  try {
    return await backend.disableStartupApp(appName, location);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:enableStartupApp', async (event, appName, appPath, location) => {
  try {
    return await backend.enableStartupApp(appName, appPath, location);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:getOptimizationStats', async () => {
  try {
    return await backend.getOptimizationStats();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:getPerformanceMetrics', async () => {
  try {
    return await backend.getPerformanceMetrics();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:enablePerformanceMode', async () => {
  try {
    return await backend.enablePerformanceMode();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('optimizer:disablePerformanceMode', async () => {
  try {
    return await backend.disablePerformanceMode();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Disk Analyzer IPC Handlers
ipcMain.handle('analyze-disk', async (event, targetPath, options) => {
  try {
    return await backend.analyzeDisk(targetPath, options);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-available-drives', async (event, testMode) => {
  try {
    return await backend.getAvailableDrives(testMode);
  } catch (error) {
    return [];
  }
});

ipcMain.handle('get-common-folders', async () => {
  try {
    return backend.getCommonFolders();
  } catch (error) {
    return [];
  }
});
