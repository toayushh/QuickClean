const os = require('os');
const si = require('systeminformation');
const { ipcMain } = require('electron');

// Register IPC handler for real-time system stats
function registerSystemStatsHandler() {
  ipcMain.handle('system:getStats', async () => {
    try {
      const [cpu, mem, disk, battery, processes] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.battery().catch(() => null),
        si.processes().catch(() => ({ list: [] }))
      ]);

      // Get primary disk (usually C: on Windows)
      const primaryDisk = disk.find(d => d.mount === 'C:') || disk[0] || {};

      // Get top 5 memory-hungry processes
      const topProcesses = processes.list
        .filter(p => p.mem > 0)
        .sort((a, b) => b.mem - a)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          mem: p.mem.toFixed(1),
          cpu: p.cpu ? p.cpu.toFixed(1) : '0.0'
        }));

      return {
        cpuUsage: cpu.currentLoad.toFixed(1),
        cpuCores: os.cpus().length,
        memUsage: ((mem.active / mem.total) * 100).toFixed(1),
        totalMem: (mem.total / 1e9).toFixed(2),
        usedMem: (mem.active / 1e9).toFixed(2),
        freeMem: ((mem.total - mem.active) / 1e9).toFixed(2),
        diskUsed: primaryDisk.use ? primaryDisk.use.toFixed(1) : '0',
        diskTotal: primaryDisk.size ? (primaryDisk.size / 1e9).toFixed(0) : '0',
        diskUsedSpace: primaryDisk.used ? (primaryDisk.used / 1e9).toFixed(0) : '0',
        diskFreeSpace: primaryDisk.available ? (primaryDisk.available / 1e9).toFixed(0) : '0',
        battery: battery && battery.hasBattery ? battery.percent : null,
        batteryCharging: battery && battery.hasBattery ? battery.isCharging : null,
        uptime: os.uptime(),
        platform: os.platform(),
        hostname: os.hostname(),
        topProcesses
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      // Return safe defaults on error
      return {
        cpuUsage: '0',
        cpuCores: os.cpus().length,
        memUsage: '0',
        totalMem: (os.totalmem() / 1e9).toFixed(2),
        usedMem: '0',
        freeMem: (os.freemem() / 1e9).toFixed(2),
        diskUsed: '0',
        diskTotal: '0',
        diskUsedSpace: '0',
        diskFreeSpace: '0',
        battery: null,
        batteryCharging: null,
        uptime: os.uptime(),
        platform: os.platform(),
        hostname: os.hostname(),
        topProcesses: []
      };
    }
  });
}

module.exports = {
  registerSystemStatsHandler
};
