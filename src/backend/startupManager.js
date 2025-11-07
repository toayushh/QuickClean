const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Get list of startup programs
async function listStartupPrograms() {
  const result = {
    success: true,
    programs: [],
    totalPrograms: 0,
    message: 'Startup programs listed successfully'
  };

  try {
    // Query HKCU Run registry key
    const command = `powershell -Command "Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' | Select-Object * -ExcludeProperty PS* | ConvertTo-Json"`;
    
    const { stdout } = await execAsync(command, { maxBuffer: 1024 * 1024 * 5 });
    
    if (stdout.trim()) {
      const data = JSON.parse(stdout);
      
      // Convert registry data to array of programs
      const programs = [];
      for (const [key, value] of Object.entries(data)) {
        if (key && value && typeof value === 'string') {
          programs.push({
            name: key,
            path: value,
            enabled: true,
            location: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
          });
        }
      }
      
      result.programs = programs;
      result.totalPrograms = programs.length;
    }
  } catch (error) {
    result.success = false;
    result.message = `Failed to list startup programs: ${error.message}`;
    result.error = error.message;
  }

  return result;
}

// Disable startup program (requires admin)
async function disableStartupProgram(programName) {
  const result = {
    success: false,
    message: ''
  };

  try {
    const command = `powershell -Command "Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${programName}' -ErrorAction Stop"`;
    
    await execAsync(command);
    
    result.success = true;
    result.message = `${programName} disabled from startup`;
  } catch (error) {
    result.message = `Failed to disable ${programName}: ${error.message}`;
  }

  return result;
}

// Enable startup program
async function enableStartupProgram(programName, programPath) {
  const result = {
    success: false,
    message: ''
  };

  try {
    const command = `powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${programName}' -Value '${programPath}' -ErrorAction Stop"`;
    
    await execAsync(command);
    
    result.success = true;
    result.message = `${programName} enabled for startup`;
  } catch (error) {
    result.message = `Failed to enable ${programName}: ${error.message}`;
  }

  return result;
}

module.exports = {
  listStartupPrograms,
  disableStartupProgram,
  enableStartupProgram
};
