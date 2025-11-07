const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Get CPU usage percentage using native Node.js
async function getCPUUsage() {
  try {
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
  } catch (error) {
    return 50; // Default fallback
  }
}

// Get RAM usage percentage using native Node.js
async function getRAMUsage() {
  try {
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
  } catch (error) {
    return {
      usage: 60,
      total: 16,
      used: 10,
      free: 6
    };
  }
}

// Get Disk usage using Windows command
async function getDiskUsage() {
  try {
    if (os.platform() === 'win32') {
      // Use PowerShell for faster response
      const { stdout } = await execAsync(
        'powershell -Command "Get-PSDrive C | Select-Object Used,Free | ConvertTo-Json"',
        { timeout: 2000 }
      );
      
      if (stdout.trim()) {
        const diskInfo = JSON.parse(stdout);
        const used = diskInfo.Used || 0;
        const free = diskInfo.Free || 0;
        const total = used + free;
        
        if (total > 0) {
          const usage = (used / total) * 100;
          
          return {
            usage: Math.round(usage),
            total: Math.round(total / (1024 * 1024 * 1024)),
            used: Math.round(used / (1024 * 1024 * 1024)),
            free: Math.round(free / (1024 * 1024 * 1024))
          };
        }
      }
    }
  } catch (error) {
    // Fallback on error
  }

  // Fallback to default data
  return {
    usage: 65,
    total: 500,
    used: 325,
    free: 175
  };
}

// Get temperature (simulated - safe for all systems)
async function getTemperature() {
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
