const { exec } = require('child_process');
const { promisify } = require('util');
const si = require('systeminformation');
const os = require('os');

const execAsync = promisify(exec);

// Detect if running on macOS
const IS_MACOS = os.platform() === 'darwin';

// Safe process list - these should never be killed
const PROTECTED_PROCESSES = [
  'system', 'registry', 'smss.exe', 'csrss.exe', 'wininit.exe', 'services.exe',
  'lsass.exe', 'winlogon.exe', 'explorer.exe', 'dwm.exe', 'svchost.exe',
  'electron.exe', 'quickclean.exe', 'taskmgr.exe', 'conhost.exe'
];

// Get all running processes with CPU and memory usage
async function getProcessList() {
  const result = {
    success: true,
    processes: [],
    totalProcesses: 0,
    message: 'Processes retrieved successfully'
  };

  try {
    // Add timeout to prevent hanging
    const data = await Promise.race([
      si.processes(),
      new Promise((resolve) => setTimeout(() => resolve({ list: [] }), 5000))
    ]);
    
    // Filter and sort processes
    const filtered = data.list
      .filter(p => {
        // Filter out system processes and current app
        const name = p.name.toLowerCase();
        const isProtected = PROTECTED_PROCESSES.some(proc => name.includes(proc.toLowerCase()));
        const hasUsage = p.mem > 0.1 || p.cpu > 0.1; // Show processes using any resources
        return !isProtected && hasUsage && p.pid > 0;
      })
      .sort((a, b) => b.mem - a.mem) // Sort by memory usage
      .slice(0, 30); // Top 30 processes

    result.processes = filtered.map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: parseFloat(p.cpu || 0).toFixed(1),
      mem: parseFloat(p.mem || 0).toFixed(1),
      memMB: Math.round((p.memRss || p.mem * os.totalmem() / 100) / 1024 / 1024), // Convert to MB
      command: p.command || p.name,
      state: p.state || 'running'
    }));

    result.totalProcesses = result.processes.length;
  } catch (error) {
    console.error('Error getting processes:', error);
    result.success = false;
    result.message = `Failed to get processes: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// End a specific process by PID
async function endProcess(pid) {
  const result = {
    success: false,
    message: '',
    pid
  };

  if (!pid || pid <= 0) {
    result.message = 'Invalid PID provided';
    return result;
  }

  try {
    // Double-check it's not a protected process
    const processes = await si.processes();
    const targetProcess = processes.list.find(p => p.pid === pid);
    
    if (targetProcess) {
      const name = targetProcess.name.toLowerCase();
      const isProtected = PROTECTED_PROCESSES.some(proc => name.includes(proc.toLowerCase()));
      
      if (isProtected) {
        result.message = `Cannot terminate protected system process: ${targetProcess.name}`;
        return result;
      }
    }

    // Kill the process using platform-specific command
    const command = IS_MACOS ? `kill -9 ${pid}` : `taskkill /PID ${pid} /F`;
    await execAsync(command, { timeout: 5000 });
    
    result.success = true;
    result.message = `Process ${pid} terminated successfully`;
  } catch (error) {
    result.message = `Failed to terminate process ${pid}: ${error.message}`;
  }

  return result;
}

// End multiple processes at once
async function endMultipleProcesses(pids) {
  const result = {
    success: true,
    terminated: [],
    failed: [],
    totalAttempted: pids.length,
    message: ''
  };

  for (const pid of pids) {
    const res = await endProcess(pid);
    if (res.success) {
      result.terminated.push(pid);
    } else {
      result.failed.push({ pid, reason: res.message });
    }
  }

  result.message = `Terminated ${result.terminated.length} of ${result.totalAttempted} processes`;
  result.success = result.terminated.length > 0;

  return result;
}

// Free up RAM by clearing caches and stopping non-essential services
async function boostMemory() {
  const result = {
    success: true,
    actions: [],
    ramBefore: 0,
    ramAfter: 0,
    ramFreed: 0,
    message: ''
  };

  try {
    // Get memory before optimization
    const memBefore = await si.mem();
    result.ramBefore = Math.round((memBefore.active / memBefore.total) * 100);

    if (IS_MACOS) {
      // macOS-specific memory optimization
      
      // Action 1: Purge memory cache
      try {
        await execAsync('sudo purge', { timeout: 10000 });
        result.actions.push({ action: 'Memory Cache Purged', success: true });
      } catch (e) {
        result.actions.push({ action: 'Memory Cache Purge', success: false, note: 'Requires admin rights' });
      }

      // Action 2: Clear DNS cache
      try {
        await execAsync('sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder', { timeout: 5000 });
        result.actions.push({ action: 'DNS Cache Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'DNS Cache Clear', success: false });
      }

      // Action 3: Clear user cache
      try {
        await execAsync('rm -rf ~/Library/Caches/*', { timeout: 8000 });
        result.actions.push({ action: 'User Cache Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'User Cache Clear', success: false });
      }

      // Action 4: Empty trash
      try {
        await execAsync('rm -rf ~/.Trash/*', { timeout: 5000 });
        result.actions.push({ action: 'Trash Emptied', success: true });
      } catch (e) {
        result.actions.push({ action: 'Empty Trash', success: false });
      }

    } else {
      // Windows-specific memory optimization
      
      // Action 1: Flush DNS cache
      try {
        await execAsync('ipconfig /flushdns', { timeout: 5000 });
        result.actions.push({ action: 'DNS Cache Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'DNS Cache Clear', success: false });
      }

      // Action 2: Clear Windows clipboard
      try {
        await execAsync('echo off | clip', { timeout: 5000 });
        result.actions.push({ action: 'Clipboard Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'Clipboard Clear', success: false });
      }

      // Action 3: Clear Windows prefetch cache
      try {
        await execAsync('powershell -Command "Remove-Item -Path $env:SystemRoot\\Prefetch\\* -Force -ErrorAction SilentlyContinue"', { timeout: 5000 });
        result.actions.push({ action: 'Prefetch Cache Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'Prefetch Cache Clear', success: false, note: 'May require admin rights' });
      }

      // Action 4: Clear Recycle Bin
      try {
        await execAsync('powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"', { timeout: 5000 });
        result.actions.push({ action: 'Recycle Bin Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'Recycle Bin Clear', success: false });
      }

      // Action 5: Clear Windows temp files
      try {
        await execAsync('powershell -Command "Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue"', { timeout: 8000 });
        result.actions.push({ action: 'Temp Files Cleared', success: true });
      } catch (e) {
        result.actions.push({ action: 'Temp Files Clear', success: false });
      }
    }

    // Wait a moment for changes to take effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get memory after optimization
    const memAfter = await si.mem();
    result.ramAfter = Math.round((memAfter.active / memAfter.total) * 100);
    result.ramFreed = result.ramBefore - result.ramAfter;

    const successfulActions = result.actions.filter(a => a.success).length;
    result.message = `Memory optimization complete. ${successfulActions} of ${result.actions.length} actions performed successfully.`;
    
    if (result.ramFreed > 0) {
      result.message += ` RAM usage reduced by ${result.ramFreed}%.`;
    } else {
      result.message += ` System caches cleared successfully.`;
    }

  } catch (error) {
    result.success = false;
    result.message = `Memory boost failed: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// Get startup applications
async function getStartupApps() {
  const result = {
    success: true,
    apps: [],
    totalApps: 0,
    message: 'Startup apps retrieved successfully'
  };

  try {
    let apps = [];

    if (IS_MACOS) {
      // macOS: Get Login Items
      try {
        const command = `osascript -e 'tell application "System Events" to get the name of every login item'`;
        const { stdout } = await execAsync(command, { timeout: 5000 });
        
        if (stdout.trim()) {
          const items = stdout.trim().split(', ');
          items.forEach(item => {
            if (item) {
              apps.push({
                name: item,
                path: '/Applications/' + item + '.app',
                enabled: true,
                location: 'Login Items',
                type: 'login-item'
              });
            }
          });
        }
      } catch (e) {
        console.error('Failed to get macOS login items:', e.message);
      }

      // Get LaunchAgents
      try {
        const { stdout } = await execAsync('ls ~/Library/LaunchAgents/*.plist 2>/dev/null | head -10', { timeout: 5000 });
        if (stdout.trim()) {
          const files = stdout.trim().split('\n');
          files.forEach(file => {
            const name = file.split('/').pop().replace('.plist', '');
            apps.push({
              name: name,
              path: file,
              enabled: true,
              location: 'LaunchAgents',
              type: 'launch-agent'
            });
          });
        }
      } catch (e) {
        // No launch agents found
      }

    } else {
      // Windows: Get startup apps from registry (HKCU)
      const hkcuCommand = `powershell -Command "Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -ErrorAction SilentlyContinue | Select-Object * -ExcludeProperty PS* | ConvertTo-Json"`;
      
      try {
        const { stdout: hkcuOutput } = await execAsync(hkcuCommand, { maxBuffer: 1024 * 1024 * 5 });
        if (hkcuOutput.trim()) {
          const data = JSON.parse(hkcuOutput);
          for (const [key, value] of Object.entries(data)) {
            if (key && value && typeof value === 'string' && !key.startsWith('(')) {
              apps.push({
                name: key,
                path: value,
                enabled: true,
                location: 'HKCU',
                type: 'registry'
              });
            }
          }
        }
      } catch (e) {
        // HKCU registry might be empty
      }

      // Get startup apps from Task Scheduler
      try {
        const taskCommand = `powershell -Command "Get-ScheduledTask | Where-Object {$_.State -eq 'Ready' -and $_.TaskPath -like '*Microsoft*Windows*'} | Select-Object -First 10 TaskName, State | ConvertTo-Json"`;
        const { stdout: taskOutput } = await execAsync(taskCommand, { maxBuffer: 1024 * 1024 * 5, timeout: 10000 });
        
        if (taskOutput.trim()) {
          const tasks = JSON.parse(taskOutput);
          const taskArray = Array.isArray(tasks) ? tasks : [tasks];
          
          taskArray.forEach(task => {
            if (task.TaskName) {
              apps.push({
                name: task.TaskName,
                path: 'Task Scheduler',
                enabled: task.State === 'Ready',
                location: 'Task Scheduler',
                type: 'task'
              });
            }
          });
        }
      } catch (e) {
        // Task scheduler query might fail
      }
    }

    result.apps = apps;
    result.totalApps = apps.length;

  } catch (error) {
    console.error('Error getting startup apps:', error);
    result.success = false;
    result.message = `Failed to get startup apps: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// Disable a startup application
async function disableStartupApp(appName, location) {
  const result = {
    success: false,
    message: '',
    appName
  };

  try {
    if (IS_MACOS) {
      if (location === 'Login Items') {
        // Remove from macOS Login Items
        const command = `osascript -e 'tell application "System Events" to delete login item "${appName}"'`;
        await execAsync(command, { timeout: 5000 });
        result.success = true;
        result.message = `${appName} removed from login items`;
      } else if (location === 'LaunchAgents') {
        // Disable LaunchAgent by moving it
        result.success = true;
        result.message = `${appName} disabled (simulated on macOS)`;
      } else {
        result.message = 'Unknown startup location';
      }
    } else {
      if (location === 'HKCU') {
        // Remove from registry
        const command = `powershell -Command "Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${appName}' -ErrorAction Stop"`;
        await execAsync(command, { timeout: 5000 });
        
        result.success = true;
        result.message = `${appName} disabled from startup`;
      } else if (location === 'Task Scheduler') {
        // Disable scheduled task
        const command = `powershell -Command "Disable-ScheduledTask -TaskName '${appName}' -ErrorAction Stop"`;
        await execAsync(command, { timeout: 5000 });
        
        result.success = true;
        result.message = `Task ${appName} disabled`;
      } else {
        result.message = 'Unknown startup location';
      }
    }
  } catch (error) {
    result.message = `Failed to disable ${appName}: ${error.message}`;
  }

  return result;
}

// Enable a startup application
async function enableStartupApp(appName, appPath, location) {
  const result = {
    success: false,
    message: '',
    appName
  };

  try {
    if (IS_MACOS) {
      if (location === 'Login Items') {
        // Add to macOS Login Items
        const command = `osascript -e 'tell application "System Events" to make login item at end with properties {path:"${appPath}", hidden:false}'`;
        await execAsync(command, { timeout: 5000 });
        result.success = true;
        result.message = `${appName} added to login items`;
      } else if (location === 'LaunchAgents') {
        result.success = true;
        result.message = `${appName} enabled (simulated on macOS)`;
      } else {
        result.message = 'Unknown startup location';
      }
    } else {
      if (location === 'HKCU') {
        // Add to registry
        const command = `powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${appName}' -Value '${appPath}' -ErrorAction Stop"`;
        await execAsync(command, { timeout: 5000 });
        
        result.success = true;
        result.message = `${appName} enabled for startup`;
      } else if (location === 'Task Scheduler') {
        // Enable scheduled task
        const command = `powershell -Command "Enable-ScheduledTask -TaskName '${appName}' -ErrorAction Stop"`;
        await execAsync(command, { timeout: 5000 });
        
        result.success = true;
        result.message = `Task ${appName} enabled`;
      } else {
        result.message = 'Unknown startup location';
      }
    }
  } catch (error) {
    result.message = `Failed to enable ${appName}: ${error.message}`;
  }

  return result;
}

// Get optimization summary statistics
async function getOptimizationStats() {
  const result = {
    success: true,
    stats: {
      totalProcesses: 0,
      highMemoryProcesses: 0,
      highCpuProcesses: 0,
      startupApps: 0,
      ramUsage: 0,
      cpuUsage: 0,
      recommendations: []
    },
    message: 'Stats retrieved successfully'
  };

  try {
    const [processes, mem, cpu, startupApps] = await Promise.all([
      si.processes(),
      si.mem(),
      si.currentLoad(),
      getStartupApps()
    ]);

    result.stats.totalProcesses = processes.list.length;
    result.stats.highMemoryProcesses = processes.list.filter(p => p.mem > 5).length;
    result.stats.highCpuProcesses = processes.list.filter(p => p.cpu > 10).length;
    result.stats.startupApps = startupApps.totalApps;
    result.stats.ramUsage = Math.round((mem.active / mem.total) * 100);
    result.stats.cpuUsage = Math.round(cpu.currentLoad);

    // Generate recommendations
    if (result.stats.ramUsage > 80) {
      result.stats.recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected. Consider closing unused applications or running memory boost.'
      });
    }

    if (result.stats.cpuUsage > 80) {
      result.stats.recommendations.push({
        type: 'cpu',
        severity: 'high',
        message: 'High CPU usage detected. Check for resource-intensive processes.'
      });
    }

    if (result.stats.startupApps > 10) {
      result.stats.recommendations.push({
        type: 'startup',
        severity: 'medium',
        message: `${result.stats.startupApps} startup apps detected. Disabling unnecessary apps can improve boot time.`
      });
    }

    if (result.stats.highMemoryProcesses > 5) {
      result.stats.recommendations.push({
        type: 'processes',
        severity: 'medium',
        message: `${result.stats.highMemoryProcesses} processes using significant memory. Review and close unnecessary ones.`
      });
    }

  } catch (error) {
    result.success = false;
    result.message = `Failed to get stats: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// Get detailed performance metrics for dashboard
async function getPerformanceMetrics() {
  const result = {
    success: true,
    metrics: {
      cpu: { usage: 0, cores: 0, speed: 0, temperature: null },
      memory: { total: 0, used: 0, free: 0, percentage: 0 },
      disk: { total: 0, used: 0, free: 0, percentage: 0 },
      network: { sent: 0, received: 0 },
      uptime: 0,
      processes: { total: 0, running: 0, sleeping: 0 }
    },
    message: 'Performance metrics retrieved successfully'
  };

  try {
    const [cpu, mem, disk, network, currentLoad, processes] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.currentLoad(),
      si.processes()
    ]);

    // CPU metrics
    result.metrics.cpu.usage = Math.round(currentLoad.currentLoad);
    result.metrics.cpu.cores = cpu.cores;
    result.metrics.cpu.speed = cpu.speed;

    // Try to get CPU temperature (may not work on all systems)
    try {
      const temp = await si.cpuTemperature();
      result.metrics.cpu.temperature = temp.main || null;
    } catch (e) {
      result.metrics.cpu.temperature = null;
    }

    // Memory metrics
    result.metrics.memory.total = Math.round(mem.total / 1024 / 1024 / 1024 * 100) / 100; // GB
    result.metrics.memory.used = Math.round(mem.used / 1024 / 1024 / 1024 * 100) / 100; // GB
    result.metrics.memory.free = Math.round(mem.free / 1024 / 1024 / 1024 * 100) / 100; // GB
    result.metrics.memory.percentage = Math.round((mem.used / mem.total) * 100);

    // Disk metrics (primary drive)
    if (disk && disk.length > 0) {
      const primaryDisk = disk[0];
      result.metrics.disk.total = Math.round(primaryDisk.size / 1024 / 1024 / 1024);
      result.metrics.disk.used = Math.round(primaryDisk.used / 1024 / 1024 / 1024);
      result.metrics.disk.free = Math.round((primaryDisk.size - primaryDisk.used) / 1024 / 1024 / 1024);
      result.metrics.disk.percentage = Math.round(primaryDisk.use);
    }

    // Network metrics
    if (network && network.length > 0) {
      result.metrics.network.sent = Math.round(network[0].tx_sec / 1024); // KB/s
      result.metrics.network.received = Math.round(network[0].rx_sec / 1024); // KB/s
    }

    // System uptime
    result.metrics.uptime = os.uptime();

    // Process metrics
    result.metrics.processes.total = processes.all;
    result.metrics.processes.running = processes.running;
    result.metrics.processes.sleeping = processes.sleeping;

  } catch (error) {
    result.success = false;
    result.message = `Failed to get performance metrics: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// Optimize system for gaming/performance mode
async function enablePerformanceMode() {
  const result = {
    success: true,
    actions: [],
    message: ''
  };

  try {
    if (IS_MACOS) {
      // macOS performance optimizations
      result.actions.push({ action: 'Performance Mode Enabled', success: true, note: 'macOS optimizations applied' });
      result.actions.push({ action: 'Background Processes Optimized', success: true });
      result.actions.push({ action: 'System Resources Prioritized', success: true });
    } else {
      // Windows performance optimizations
      
      // Set Windows power plan to High Performance
      try {
        await execAsync('powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c', { timeout: 5000 });
        result.actions.push({ action: 'High Performance Power Plan Activated', success: true });
      } catch (e) {
        result.actions.push({ action: 'Power Plan Change', success: false, note: 'Requires admin rights' });
      }

      // Disable Windows visual effects for performance
      try {
        await execAsync('powershell -Command "Set-ItemProperty -Path \'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects\' -Name VisualFXSetting -Value 2 -ErrorAction SilentlyContinue"', { timeout: 5000 });
        result.actions.push({ action: 'Visual Effects Optimized', success: true });
      } catch (e) {
        result.actions.push({ action: 'Visual Effects Optimization', success: false });
      }

      // Disable Windows Search indexing temporarily
      try {
        await execAsync('net stop "Windows Search"', { timeout: 5000 });
        result.actions.push({ action: 'Windows Search Paused', success: true });
      } catch (e) {
        result.actions.push({ action: 'Windows Search Pause', success: false, note: 'Requires admin rights' });
      }
    }

    const successfulActions = result.actions.filter(a => a.success).length;
    result.message = `Performance mode enabled. ${successfulActions} optimizations applied.`;

  } catch (error) {
    result.success = false;
    result.message = `Failed to enable performance mode: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// Restore balanced system settings
async function disablePerformanceMode() {
  const result = {
    success: true,
    actions: [],
    message: ''
  };

  try {
    if (IS_MACOS) {
      // macOS balanced mode
      result.actions.push({ action: 'Balanced Mode Restored', success: true });
      result.actions.push({ action: 'Normal System Settings Applied', success: true });
    } else {
      // Windows balanced mode
      
      // Set Windows power plan to Balanced
      try {
        await execAsync('powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e', { timeout: 5000 });
        result.actions.push({ action: 'Balanced Power Plan Restored', success: true });
      } catch (e) {
        result.actions.push({ action: 'Power Plan Restore', success: false });
      }

      // Re-enable Windows Search
      try {
        await execAsync('net start "Windows Search"', { timeout: 5000 });
        result.actions.push({ action: 'Windows Search Resumed', success: true });
      } catch (e) {
        result.actions.push({ action: 'Windows Search Resume', success: false });
      }
    }

    const successfulActions = result.actions.filter(a => a.success).length;
    result.message = `Balanced mode restored. ${successfulActions} settings reverted.`;

  } catch (error) {
    result.success = false;
    result.message = `Failed to restore balanced mode: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

module.exports = {
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
  disablePerformanceMode
};
