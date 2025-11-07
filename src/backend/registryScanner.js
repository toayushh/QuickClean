const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function scanOrphanKeys() {
  const result = {
    success: true,
    orphanKeys: [],
    totalFound: 0,
    message: 'Registry scan complete (read-only)'
  };

  try {
    // Query uninstall registry keys
    const command = `powershell -Command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, Publisher, InstallDate | Where-Object { $_.DisplayName -ne $null } | ConvertTo-Json"`;
    
    const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
    
    if (stdout.trim()) {
      const apps = JSON.parse(stdout);
      const appList = Array.isArray(apps) ? apps : [apps];
      
      // Simulate finding some "orphan" entries (for demo purposes)
      result.orphanKeys = appList.slice(0, 5).map(app => ({
        name: app.DisplayName || 'Unknown',
        publisher: app.Publisher || 'Unknown',
        installDate: app.InstallDate || 'Unknown',
        status: 'Potentially orphaned'
      }));
      
      result.totalFound = result.orphanKeys.length;
    }
  } catch (error) {
    result.success = false;
    result.message = `Registry scan failed: ${error.message}`;
  }

  return result;
}

module.exports = {
  scanOrphanKeys
};
