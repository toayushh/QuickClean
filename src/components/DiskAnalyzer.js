import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Folder, File, Search, TrendingUp, PieChart, BarChart3, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import './DiskAnalyzer.css';

function DiskAnalyzer({ settings }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedPath, setSelectedPath] = useState('');
  const [commonFolders, setCommonFolders] = useState([]);
  const [availableDrives, setAvailableDrives] = useState([]);
  const [progress, setProgress] = useState({ filesScanned: 0, foldersScanned: 0, currentPath: '' });
  const [viewMode, setViewMode] = useState('categories'); // categories, files, folders

  useEffect(() => {
    loadInitialData();
  }, [settings.testMode]);

  const loadInitialData = async () => {
    try {
      const folders = await window.quickclean.getCommonFolders();
      setCommonFolders(folders);
      
      const drives = await window.quickclean.getAvailableDrives(settings.testMode);
      setAvailableDrives(drives);
      
      // Set default path
      if (folders.length > 0) {
        setSelectedPath(folders[0].path);
      }
    } catch (error) {
      toast.error('Failed to load folders: ' + error.message);
    }
  };

  const startAnalysis = async () => {
    if (!selectedPath) {
      toast.error('Please select a folder to analyze');
      return;
    }

    setAnalyzing(true);
    setResults(null);
    setProgress({ filesScanned: 0, foldersScanned: 0, currentPath: '' });

    try {
      const result = await window.quickclean.analyzeDisk(selectedPath, {
        testMode: settings.testMode,
        maxDepth: 5,
        onProgress: (prog) => {
          setProgress(prog);
        }
      });

      if (result.success) {
        setResults(result);
        toast.success(`Analysis complete! Found ${result.totalFiles} files`);
      } else {
        toast.error('Analysis failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="page disk-analyzer-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HardDrive size={32} />
          Disk Analyzer
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Analyze disk space usage and find large files
        </motion.p>
      </div>

      {/* Selection Panel */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="card-header">
          <h3 className="card-title">
            <Folder size={20} />
            Select Location
          </h3>
        </div>

        <div className="disk-analyzer-selection">
          {/* Available Drives */}
          {availableDrives.length > 0 && (
            <div className="selection-section">
              <h4 className="selection-title">Available Drives</h4>
              <div className="drives-grid">
                {availableDrives.map((drive, index) => (
                  <motion.button
                    key={index}
                    className={`drive-card ${selectedPath === drive.path ? 'selected' : ''}`}
                    onClick={() => setSelectedPath(drive.path)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <HardDrive size={24} />
                    <div className="drive-info">
                      <div className="drive-name">{drive.drive}</div>
                      <div className="drive-label">{drive.label}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Common Folders */}
          <div className="selection-section">
            <h4 className="selection-title">Quick Access</h4>
            <div className="folders-grid">
              {commonFolders.map((folder, index) => (
                <motion.button
                  key={index}
                  className={`folder-card ${selectedPath === folder.path ? 'selected' : ''}`}
                  onClick={() => setSelectedPath(folder.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="folder-icon">{folder.icon}</span>
                  <span className="folder-name">{folder.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected Path Display */}
          <div className="selected-path">
            <FolderOpen size={20} />
            <span>{selectedPath || 'No folder selected'}</span>
          </div>

          {/* Analyze Button */}
          <motion.button
            className="btn btn-primary btn-large"
            onClick={startAnalysis}
            disabled={analyzing || !selectedPath}
            whileHover={{ scale: analyzing ? 1 : 1.05 }}
            whileTap={{ scale: analyzing ? 1 : 0.95 }}
          >
            {analyzing ? (
              <>
                <span className="loading-spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                <Search size={20} />
                Start Analysis
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Progress Display */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="progress-info">
              <div className="progress-stats">
                <div className="progress-stat">
                  <File size={20} />
                  <span>{progress.filesScanned} files</span>
                </div>
                <div className="progress-stat">
                  <Folder size={20} />
                  <span>{progress.foldersScanned} folders</span>
                </div>
              </div>
              <div className="progress-path">
                Scanning: {progress.currentPath || 'Starting...'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Display */}
      <AnimatePresence>
        {results && (
          <>
            {/* Summary Stats */}
            <motion.div
              className="stats-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div className="stat-card" whileHover={{ scale: 1.03 }}>
                <HardDrive className="stat-icon" size={24} />
                <div className="stat-label">Total Size</div>
                <div className="stat-value">{results.totalSizeFormatted}</div>
              </motion.div>

              <motion.div className="stat-card" whileHover={{ scale: 1.03 }}>
                <File className="stat-icon" size={24} />
                <div className="stat-label">Files</div>
                <div className="stat-value">{results.totalFiles.toLocaleString()}</div>
              </motion.div>

              <motion.div className="stat-card" whileHover={{ scale: 1.03 }}>
                <Folder className="stat-icon" size={24} />
                <div className="stat-label">Folders</div>
                <div className="stat-value">{results.totalFolders.toLocaleString()}</div>
              </motion.div>
            </motion.div>

            {/* View Mode Tabs */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="view-tabs">
                <button
                  className={`view-tab ${viewMode === 'categories' ? 'active' : ''}`}
                  onClick={() => setViewMode('categories')}
                >
                  <PieChart size={18} />
                  By Type
                </button>
                <button
                  className={`view-tab ${viewMode === 'files' ? 'active' : ''}`}
                  onClick={() => setViewMode('files')}
                >
                  <File size={18} />
                  Largest Files
                </button>
                <button
                  className={`view-tab ${viewMode === 'folders' ? 'active' : ''}`}
                  onClick={() => setViewMode('folders')}
                >
                  <Folder size={18} />
                  Largest Folders
                </button>
              </div>

              {/* Categories View */}
              {viewMode === 'categories' && (
                <div className="categories-view">
                  {results.categoriesArray && results.categoriesArray.map((category, index) => (
                    <motion.div
                      key={category.id}
                      className="category-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="category-header">
                        <div className="category-info">
                          <div 
                            className="category-color" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="category-name">{category.name}</div>
                          <div className="category-count">{category.count} files</div>
                        </div>
                        <div className="category-size">
                          <div className="category-percentage">{category.percentage}%</div>
                          <div className="category-bytes">{category.sizeFormatted}</div>
                        </div>
                      </div>
                      <div className="category-bar">
                        <motion.div
                          className="category-bar-fill"
                          style={{ backgroundColor: category.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                        ></motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Largest Files View */}
              {viewMode === 'files' && (
                <div className="files-view">
                  <div className="files-list">
                    {results.largestFiles && results.largestFiles.map((file, index) => (
                      <motion.div
                        key={index}
                        className="file-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <File size={20} className="file-icon" />
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-path">{file.path}</div>
                        </div>
                        <div className="file-details">
                          <div className="file-category">{file.category}</div>
                          <div className="file-size">{file.sizeFormatted}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Largest Folders View */}
              {viewMode === 'folders' && (
                <div className="folders-view">
                  <div className="folders-list">
                    {results.folders && results.folders.map((folder, index) => (
                      <motion.div
                        key={index}
                        className="folder-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Folder size={20} className="folder-icon" />
                        <div className="folder-info">
                          <div className="folder-name">{folder.name}</div>
                          <div className="folder-path">{folder.path}</div>
                        </div>
                        <div className="folder-details">
                          <div className="folder-stats">
                            {folder.files} files • {folder.folders} folders
                          </div>
                          <div className="folder-size">{folder.sizeFormatted}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!results && !analyzing && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Select a location and start analysis to see disk usage</div>
        </motion.div>
      )}
    </div>
  );
}

export default DiskAnalyzer;
