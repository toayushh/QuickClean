const os = require('os');
const si = require('systeminformation');

// Get CPU usage percentage using systeminformation
async function getCPUUsage() {
  try {
    const cpu = await si.currentLoad();
    return Math.round(cpu.currentLoad);
  } catch (error) {
    // Fallback to basic calculation
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return Math.min(100, Math.max(0, usage));
  }
}

// Get RAM usage percentage using systeminformation
async function getRAMUsage() {
  try {
    const mem = await si.mem();
    const usage = (mem.active / mem.total) * 100;

    return {
      usage: Math.round(usage),
      total: Math.round(mem.total / (1024 * 1024 * 1024)), // GB
      used: Math.round(mem.active / (1024 * 1024 * 1024)), // GB
      free: Math.round((mem.total - mem.active) / (1024 * 1024 * 1024)) // GB
    };
  } catch (error) {
    // Fallback to os module
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = (usedMem / totalMem) * 100;

    return {
      usage: Math.round(usage),
      total: Math.round(totalMem / (1024 * 1024 * 1024)), // GB
      used: Math.round(usedMem / (1024 * 1024 * 1024)), // GB
      free: Math.round(freeMem / (1024 * 1024 * 1024)) // GB
    };
  }
}

// Get Disk usage using systeminformation
async function getDiskUsage() {
  try {
    const disk = await si.fsSize();
    // Get primary disk (usually C: on Windows)
    const primaryDisk = disk.find(d => d.mount === 'C:') || disk[0];
    
    if (primaryDisk) {
      return {
        usage: Math.round(primaryDisk.use),
        total: Math.round(primaryDisk.size / (1024 * 1024 * 1024)), // GB
        used: Math.round(primaryDisk.used / (1024 * 1024 * 1024)), // GB
        free: Math.round(primaryDisk.available / (1024 * 1024 * 1024)) // GB
      };
    }
  } catch (error) {
    console.error('Error getting disk usage:', error);
  }

  // Fallback to simulated data
  return {
    usage: 65,
    total: 500,
    used: 325,
    free: 175
  };
}

// Get temperature using systeminformation
async function getTemperature() {
  try {
    const temp = await si.cpuTemperature();
    if (temp.main && temp.main > 0) {
      return Math.round(temp.main);
    }
  } catch (error) {
    // Temperature sensors may not be available
  }

  // Simulate temperature based on CPU usage
  try {
    const cpuUsage = await getCPUUsage();
    const baseTemp = 35; // Base temperature
    const tempVariation = (cpuUsage / 100) * 30; // Up to 30°C variation
    const randomNoise = Math.random() * 5 - 2.5; // ±2.5°C noise
    
    const temp = baseTemp + tempVariation + randomNoise;
    return Math.round(temp);
  } catch (error) {
    return 45; // Safe default
  }
}

// Get all system stats
async function getSystemStats(testMode = false) {
  if (testMode) {
    // Return simulated data for test mode
    return {
      cpu: Math.round(30 + Math.random() * 40), // 30-70%
      ram: {
        usage: Math.round(40 + Math.random() * 30), // 40-70%
        total: 16,
        used: 8,
        free: 8
      },
      disk: {
        usage: Math.round(50 + Math.random() * 20), // 50-70%
        total: 500,
        used: 325,
        free: 175
      },
      temperature: Math.round(40 + Math.random() * 20) // 40-60°C
    };
  }

  try {
    const [cpu, ram, disk, temperature] = await Promise.all([
      getCPUUsage(),
      getRAMUsage(),
      getDiskUsage(),
      getTemperature()
    ]);

    return {
      cpu,
      ram,
      disk,
      temperature
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    // Return safe defaults on error
    return {
      cpu: 0,
      ram: { usage: 0, total: 0, used: 0, free: 0 },
      disk: { usage: 0, total: 0, used: 0, free: 0 },
      temperature: 0
    };
  }
}

module.exports = {
  getSystemStats,
  getCPUUsage,
  getRAMUsage,
  getDiskUsage,
  getTemperature
};
