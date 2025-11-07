const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Calculate file checksum (MD5)
async function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}

// Get file info
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      modified: stats.mtime,
      isFile: stats.isFile()
    };
  } catch (error) {
    return null;
  }
}

// Scan directory recursively
async function scanDirectory(dirPath, maxDepth = 5, currentDepth = 0, onProgress = null) {
  const files = [];
  
  if (currentDepth >= maxDepth) return files;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      try {
        if (entry.isFile()) {
          const fileInfo = await getFileInfo(fullPath);
          if (fileInfo) {
            files.push(fileInfo);
            if (onProgress) onProgress(files.length);
          }
        } else if (entry.isDirectory()) {
          const subFiles = await scanDirectory(fullPath, maxDepth, currentDepth + 1, onProgress);
          files.push(...subFiles);
        }
      } catch (err) {
        // Skip files/folders we can't access
        continue;
      }
    }
  } catch (error) {
    // Skip directories we can't access
  }

  return files;
}

// Find duplicates by name
function findDuplicatesByName(files) {
  const nameMap = new Map();
  
  files.forEach(file => {
    const name = file.name.toLowerCase();
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name).push(file);
  });

  const duplicates = [];
  nameMap.forEach((fileList, name) => {
    if (fileList.length > 1) {
      duplicates.push({
        type: 'name',
        key: name,
        files: fileList,
        count: fileList.length,
        totalSize: fileList.reduce((sum, f) => sum + f.size, 0)
      });
    }
  });

  return duplicates;
}

// Find duplicates by size
function findDuplicatesBySize(files) {
  const sizeMap = new Map();
  
  files.forEach(file => {
    const size = file.size;
    if (!sizeMap.has(size)) {
      sizeMap.set(size, []);
    }
    sizeMap.get(size).push(file);
  });

  const duplicates = [];
  sizeMap.forEach((fileList, size) => {
    if (fileList.length > 1 && size > 0) {
      duplicates.push({
        type: 'size',
        key: size,
        files: fileList,
        count: fileList.length,
        totalSize: fileList.reduce((sum, f) => sum + f.size, 0)
      });
    }
  });

  return duplicates;
}

// Find duplicates by checksum (exact duplicates)
async function findDuplicatesByChecksum(files, onProgress = null) {
  const checksumMap = new Map();
  let processed = 0;

  for (const file of files) {
    try {
      const checksum = await calculateChecksum(file.path);
      if (!checksumMap.has(checksum)) {
        checksumMap.set(checksum, []);
      }
      checksumMap.get(checksum).push({ ...file, checksum });
      
      processed++;
      if (onProgress) onProgress(processed, files.length);
    } catch (error) {
      // Skip files we can't read
      continue;
    }
  }

  const duplicates = [];
  checksumMap.forEach((fileList, checksum) => {
    if (fileList.length > 1) {
      duplicates.push({
        type: 'checksum',
        key: checksum,
        files: fileList,
        count: fileList.length,
        totalSize: fileList.reduce((sum, f) => sum + f.size, 0)
      });
    }
  });

  return duplicates;
}

// Main scan function
async function scanForDuplicates(folders, scanType = 'checksum', testMode = false, onProgress = null) {
  if (testMode) {
    // Return simulated data for test mode
    return {
      success: true,
      scanType,
      duplicates: [
        {
          type: scanType,
          key: 'test-duplicate-1',
          files: [
            { path: 'C:\\Users\\Demo\\Documents\\photo.jpg', name: 'photo.jpg', size: 2048000, sizeFormatted: '2 MB' },
            { path: 'C:\\Users\\Demo\\Pictures\\photo.jpg', name: 'photo.jpg', size: 2048000, sizeFormatted: '2 MB' }
          ],
          count: 2,
          totalSize: 4096000
        },
        {
          type: scanType,
          key: 'test-duplicate-2',
          files: [
            { path: 'C:\\Users\\Demo\\Downloads\\document.pdf', name: 'document.pdf', size: 1024000, sizeFormatted: '1 MB' },
            { path: 'C:\\Users\\Demo\\Desktop\\document.pdf', name: 'document.pdf', size: 1024000, sizeFormatted: '1 MB' },
            { path: 'C:\\Users\\Demo\\Backup\\document.pdf', name: 'document.pdf', size: 1024000, sizeFormatted: '1 MB' }
          ],
          count: 3,
          totalSize: 3072000
        }
      ],
      totalDuplicates: 2,
      totalFiles: 5,
      totalWastedSpace: 7168000,
      totalWastedSpaceFormatted: '7 MB'
    };
  }

  try {
    // Scan all folders
    let allFiles = [];
    for (const folder of folders) {
      if (await fs.pathExists(folder)) {
        const files = await scanDirectory(folder, 5, 0, onProgress);
        allFiles.push(...files);
      }
    }

    if (allFiles.length === 0) {
      return {
        success: true,
        scanType,
        duplicates: [],
        totalDuplicates: 0,
        totalFiles: 0,
        totalWastedSpace: 0,
        totalWastedSpaceFormatted: '0 Bytes'
      };
    }

    // Find duplicates based on scan type
    let duplicates = [];
    if (scanType === 'name') {
      duplicates = findDuplicatesByName(allFiles);
    } else if (scanType === 'size') {
      duplicates = findDuplicatesBySize(allFiles);
    } else if (scanType === 'checksum') {
      duplicates = await findDuplicatesByChecksum(allFiles, onProgress);
    }

    // Calculate total wasted space (keep one copy, count rest as waste)
    const totalWastedSpace = duplicates.reduce((sum, dup) => {
      const wastePerGroup = dup.files.slice(1).reduce((s, f) => s + f.size, 0);
      return sum + wastePerGroup;
    }, 0);

    return {
      success: true,
      scanType,
      duplicates,
      totalDuplicates: duplicates.length,
      totalFiles: duplicates.reduce((sum, dup) => sum + dup.count, 0),
      totalWastedSpace,
      totalWastedSpaceFormatted: formatBytes(totalWastedSpace)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duplicates: [],
      totalDuplicates: 0,
      totalFiles: 0,
      totalWastedSpace: 0
    };
  }
}

// Delete duplicate files
async function deleteDuplicates(filesToDelete, safeMode = true, dryRun = true) {
  const result = {
    success: true,
    dryRun,
    safeMode,
    deleted: 0,
    failed: 0,
    spaceFreed: 0,
    errors: []
  };

  for (const filePath of filesToDelete) {
    try {
      if (!dryRun) {
        if (await fs.pathExists(filePath)) {
          const stats = await fs.stat(filePath);
          await fs.remove(filePath);
          result.spaceFreed += stats.size;
          result.deleted++;
        }
      } else {
        // Dry run - just calculate space
        if (await fs.pathExists(filePath)) {
          const stats = await fs.stat(filePath);
          result.spaceFreed += stats.size;
          result.deleted++;
        }
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Failed to delete ${filePath}: ${error.message}`);
    }
  }

  result.spaceFreedFormatted = formatBytes(result.spaceFreed);
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
  scanForDuplicates,
  deleteDuplicates
};
