const fs = require('fs-extra');
const path = require('path');

const SAFE_PATHS = [
  'Temp',
  'Cache',
  'tmp',
  'cache'
];

function isSafePath(filePath) {
  const normalized = filePath.toLowerCase();
  return SAFE_PATHS.some(safePath => normalized.includes(safePath.toLowerCase()));
}

async function cleanFiles(items, dryRun = true) {
  const result = {
    success: true,
    dryRun,
    cleaned: 0,
    failed: 0,
    totalSizeFreed: 0,
    errors: [],
    message: dryRun ? 'Dry run complete - no files deleted' : 'Cleaning complete'
  };

  for (const item of items) {
    if (!isSafePath(item.path)) {
      result.failed++;
      result.errors.push(`Unsafe path skipped: ${item.path}`);
      continue;
    }

    try {
      if (!dryRun) {
        if (await fs.pathExists(item.path)) {
          const stats = await fs.stat(item.path);
          
          if (stats.isDirectory()) {
            await fs.emptyDir(item.path);
          } else {
            await fs.remove(item.path);
          }
          
          result.totalSizeFreed += item.sizeBytes || 0;
          result.cleaned++;
        }
      } else {
        // Dry run - just count
        result.totalSizeFreed += item.sizeBytes || 0;
        result.cleaned++;
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Failed to clean ${item.path}: ${error.message}`);
    }
  }

  result.totalSizeFreedFormatted = formatBytes(result.totalSizeFreed);
  return result;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
  cleanFiles,
  isSafePath
};
