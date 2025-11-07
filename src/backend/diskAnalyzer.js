const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Disk Analyzer Module
 * Analyzes disk space usage by scanning directories and categorizing files
 */

// File type categories
const FILE_CATEGORIES = {
  documents: {
    name: 'Documents',
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'],
    color: '#3b82f6'
  },
  images: {
    name: 'Images',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff'],
    color: '#10b981'
  },
  videos: {
    name: 'Videos',
    extensions: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
    color: '#8b5cf6'
  },
  audio: {
    name: 'Audio',
    extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
    color: '#f59e0b'
  },
  archives: {
    name: 'Archives',
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.iso'],
    color: '#ef4444'
  },
  executables: {
    name: 'Programs',
    extensions: ['.exe', '.msi', '.dll', '.sys', '.bat', '.cmd', '.ps1'],
    color: '#ec4899'
  },
  code: {
    name: 'Code',
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.html', '.css', '.json', '.xml'],
    color: '#06b6d4'
  },
  other: {
    name: 'Other',
    extensions: [],
    color: '#6b7280'
  }
};

// Protected directories that should not be scanned
const PROTECTED_PATHS = [
  'C:\\Windows',
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  'C:\\ProgramData\\Microsoft',
  'C:\\System Volume Information',
  '$Recycle.Bin',
  'node_modules',
  '.git'
];

/**
 * Check if a path is protected
 */
function isProtectedPath(filePath) {
  const normalized = path.normalize(filePath).toLowerCase();
  return PROTECTED_PATHS.some(protected => 
    normalized.includes(protected.toLowerCase())
  );
}

/**
 * Get file category based on extension
 */
function getFileCategory(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  for (const [key, category] of Object.entries(FILE_CATEGORIES)) {
    if (key !== 'other' && category.extensions.includes(ext)) {
      return key;
    }
  }
  
  return 'other';
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Scan a directory recursively
 */
async function scanDirectory(dirPath, options = {}) {
  const {
    maxDepth = 5,
    currentDepth = 0,
    onProgress = null,
    testMode = false
  } = options;

  const results = {
    totalSize: 0,
    totalFiles: 0,
    totalFolders: 0,
    categories: {},
    largestFiles: [],
    folders: []
  };

  // Initialize categories
  Object.keys(FILE_CATEGORIES).forEach(key => {
    results.categories[key] = {
      name: FILE_CATEGORIES[key].name,
      size: 0,
      count: 0,
      color: FILE_CATEGORIES[key].color
    };
  });

  // Test mode - return mock data
  if (testMode) {
    return generateMockData(dirPath);
  }

  // Check if path is protected
  if (isProtectedPath(dirPath)) {
    return results;
  }

  // Check if path exists and is accessible
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      return results;
    }
  } catch (error) {
    return results;
  }

  // Stop if max depth reached
  if (currentDepth >= maxDepth) {
    return results;
  }

  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      
      // Skip protected paths
      if (isProtectedPath(itemPath)) {
        continue;
      }

      try {
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          results.totalFolders++;
          
          // Recursively scan subdirectory
          const subResults = await scanDirectory(itemPath, {
            ...options,
            currentDepth: currentDepth + 1
          });
          
          // Merge results
          results.totalSize += subResults.totalSize;
          results.totalFiles += subResults.totalFiles;
          results.totalFolders += subResults.totalFolders;
          
          Object.keys(subResults.categories).forEach(key => {
            results.categories[key].size += subResults.categories[key].size;
            results.categories[key].count += subResults.categories[key].count;
          });
          
          // Add folder info
          if (subResults.totalSize > 0) {
            results.folders.push({
              path: itemPath,
              name: item,
              size: subResults.totalSize,
              sizeFormatted: formatBytes(subResults.totalSize),
              files: subResults.totalFiles,
              folders: subResults.totalFolders
            });
          }
          
        } else if (stats.isFile()) {
          results.totalFiles++;
          results.totalSize += stats.size;
          
          // Categorize file
          const category = getFileCategory(item);
          results.categories[category].size += stats.size;
          results.categories[category].count++;
          
          // Track largest files
          results.largestFiles.push({
            path: itemPath,
            name: item,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            category: FILE_CATEGORIES[category].name,
            modified: stats.mtime
          });
        }
        
        // Report progress
        if (onProgress) {
          onProgress({
            currentPath: itemPath,
            filesScanned: results.totalFiles,
            foldersScanned: results.totalFolders,
            totalSize: results.totalSize
          });
        }
        
      } catch (error) {
        // Skip files/folders we can't access
        continue;
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  // Sort largest files
  results.largestFiles.sort((a, b) => b.size - a.size);
  results.largestFiles = results.largestFiles.slice(0, 50); // Keep top 50

  // Sort folders by size
  results.folders.sort((a, b) => b.size - a.size);
  results.folders = results.folders.slice(0, 50); // Keep top 50

  return results;
}

/**
 * Generate mock data for testing
 */
function generateMockData(dirPath) {
  const mockData = {
    totalSize: 15678234567,
    totalFiles: 12543,
    totalFolders: 876,
    categories: {
      documents: { name: 'Documents', size: 2345678901, count: 1234, color: '#3b82f6' },
      images: { name: 'Images', size: 4567890123, count: 3456, color: '#10b981' },
      videos: { name: 'Videos', size: 5678901234, count: 234, color: '#8b5cf6' },
      audio: { name: 'Audio', size: 1234567890, count: 567, color: '#f59e0b' },
      archives: { name: 'Archives', size: 890123456, count: 123, color: '#ef4444' },
      executables: { name: 'Programs', size: 456789012, count: 345, color: '#ec4899' },
      code: { name: 'Code', size: 234567890, count: 2345, color: '#06b6d4' },
      other: { name: 'Other', size: 270716061, count: 4239, color: '#6b7280' }
    },
    largestFiles: [
      { name: 'video_project.mp4', size: 1234567890, sizeFormatted: '1.15 GB', category: 'Videos', path: path.join(dirPath, 'video_project.mp4') },
      { name: 'backup.zip', size: 987654321, sizeFormatted: '941.9 MB', category: 'Archives', path: path.join(dirPath, 'backup.zip') },
      { name: 'presentation.pptx', size: 456789012, sizeFormatted: '435.6 MB', category: 'Documents', path: path.join(dirPath, 'presentation.pptx') },
      { name: 'photo_album.zip', size: 345678901, sizeFormatted: '329.7 MB', category: 'Archives', path: path.join(dirPath, 'photo_album.zip') },
      { name: 'game_installer.exe', size: 234567890, sizeFormatted: '223.7 MB', category: 'Programs', path: path.join(dirPath, 'game_installer.exe') }
    ],
    folders: [
      { name: 'Videos', size: 5678901234, sizeFormatted: '5.29 GB', files: 234, folders: 12, path: path.join(dirPath, 'Videos') },
      { name: 'Pictures', size: 4567890123, sizeFormatted: '4.25 GB', files: 3456, folders: 45, path: path.join(dirPath, 'Pictures') },
      { name: 'Documents', size: 2345678901, sizeFormatted: '2.18 GB', files: 1234, folders: 67, path: path.join(dirPath, 'Documents') },
      { name: 'Music', size: 1234567890, sizeFormatted: '1.15 GB', files: 567, folders: 23, path: path.join(dirPath, 'Music') },
      { name: 'Downloads', size: 890123456, sizeFormatted: '848.9 MB', files: 456, folders: 34, path: path.join(dirPath, 'Downloads') }
    ]
  };

  return mockData;
}

/**
 * Get available drives (Windows)
 */
async function getAvailableDrives(testMode = false) {
  if (testMode) {
    return [
      { drive: 'C:', label: 'Local Disk', type: 'FIXED', total: 500000000000, free: 150000000000, used: 350000000000 },
      { drive: 'D:', label: 'Data', type: 'FIXED', total: 1000000000000, free: 600000000000, used: 400000000000 }
    ];
  }

  const drives = [];
  
  if (os.platform() === 'win32') {
    // Windows - check common drive letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    for (const letter of letters) {
      const drivePath = `${letter}:\\`;
      try {
        const stats = await fs.stat(drivePath);
        if (stats.isDirectory()) {
          // Try to get drive info
          drives.push({
            drive: `${letter}:`,
            label: `Drive ${letter}`,
            type: 'FIXED',
            path: drivePath
          });
        }
      } catch (error) {
        // Drive doesn't exist or not accessible
      }
    }
  } else {
    // macOS/Linux - common mount points
    const mountPoints = [
      { path: os.homedir(), label: 'Home' },
      { path: '/', label: 'Root' }
    ];
    
    for (const mount of mountPoints) {
      try {
        const stats = await fs.stat(mount.path);
        if (stats.isDirectory()) {
          drives.push({
            drive: mount.path,
            label: mount.label,
            type: 'FIXED',
            path: mount.path
          });
        }
      } catch (error) {
        // Not accessible
      }
    }
  }

  return drives;
}

/**
 * Get common user folders
 */
function getCommonFolders() {
  const homeDir = os.homedir();
  
  return [
    { name: 'Desktop', path: path.join(homeDir, 'Desktop'), icon: '🖥️' },
    { name: 'Documents', path: path.join(homeDir, 'Documents'), icon: '📄' },
    { name: 'Downloads', path: path.join(homeDir, 'Downloads'), icon: '⬇️' },
    { name: 'Pictures', path: path.join(homeDir, 'Pictures'), icon: '🖼️' },
    { name: 'Videos', path: path.join(homeDir, 'Videos'), icon: '🎬' },
    { name: 'Music', path: path.join(homeDir, 'Music'), icon: '🎵' }
  ];
}

/**
 * Main analyze function
 */
async function analyzeDisk(targetPath, options = {}) {
  const startTime = Date.now();
  
  try {
    const results = await scanDirectory(targetPath, options);
    
    results.path = targetPath;
    results.totalSizeFormatted = formatBytes(results.totalSize);
    results.scanDuration = Date.now() - startTime;
    results.success = true;
    
    // Convert categories to array for easier rendering
    results.categoriesArray = Object.entries(results.categories)
      .map(([key, data]) => ({
        id: key,
        ...data,
        sizeFormatted: formatBytes(data.size),
        percentage: results.totalSize > 0 ? (data.size / results.totalSize * 100).toFixed(1) : 0
      }))
      .filter(cat => cat.size > 0)
      .sort((a, b) => b.size - a.size);
    
    return results;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      path: targetPath
    };
  }
}

module.exports = {
  analyzeDisk,
  getAvailableDrives,
  getCommonFolders,
  formatBytes
};
