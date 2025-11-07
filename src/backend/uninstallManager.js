const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function listApps() {
  const result = {
    success: true,
    apps: [],
    totalApps: 0,
    message: 'Apps listed successfully'
  };

  try {
    const command = `powershell -Command "Get-WmiObject -Class Win32_Product | Select-Object Name, Vendor, Version, InstallDate | ConvertTo-Json"`;
    
    const { stdout } = await execAsync(command, { 
      maxBuffer: 1024 * 1024 * 10,
      timeout: 30000 
    });
    
    if (stdout.trim()) {
      const apps = JSON.parse(stdout);
      result.apps = Array.isArray(apps) ? apps : [apps];
      result.apps = result.apps.map(app => ({
        name: app.Name || 'Unknown',
        vendor: app.Vendor || 'Unknown',
        version: app.Version || 'Unknown',
        installDate: app.InstallDate || 'Unknown'
      }));
      
      result.totalApps = result.apps.length;
    }
  } catch (error) {
    result.success = false;
    result.message = `Failed to list apps: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

async function uninstall(appName) {
  const result = {
    success: false,
    message: ''
  };

  try {
    const command = `wmic product where name="${appName}" call uninstall`;
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 60000 
    });
    
    if (stdout.includes('ReturnValue = 0')) {
      result.success = true;
      result.message = `${appName} uninstalled successfully`;
    } else {
      result.message = `Failed to uninstall ${appName}`;
    }
  } catch (error) {
    result.message = `Uninstall error: ${error.message}`;
  }

  return result;
}

module.exports = {
  listApps,
  uninstall
};
