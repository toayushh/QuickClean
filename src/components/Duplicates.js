import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Copy, FolderPlus, Shield, CheckSquare, Square, File, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Duplicates.css';

function Duplicates({ settings }) {
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [scanType, setScanType] = useState('checksum');
  const [safeMode, setSafeMode] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const addFolder = () => {
    // In a real app, this would open a folder picker dialog
    // For now, we'll use common folders
    const commonFolders = [
      'C:\\Users\\Public\\Documents',
      'C:\\Users\\Public\\Downloads',
      'C:\\Users\\Public\\Pictures'
    ];
    
    const folder = commonFolders[selectedFolders.length % commonFolders.length];
    if (!selectedFolders.includes(folder)) {
      setSelectedFolders([...selectedFolders, folder]);
    }
  };

  const removeFolder = (folder) => {
    setSelectedFolders(selectedFolders.filter(f => f !== folder));
  };

  const scanForDuplicates = async () => {
    if (selectedFolders.length === 0) {
      toast.error('Please select at least one folder to scan');
      return;
    }

    setScanning(true);
    setProgress(0);
    setScanResults(null);
    setSelectedFiles([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const results = await window.quickclean.scanDuplicates(
        selectedFolders,
        scanType,
        settings.testMode
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (results.success) {
        setScanResults(results);
        toast.success(`Found ${results.totalDuplicates} duplicate groups!`);
      } else {
        toast.error('Scan failed: ' + results.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setScanning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const toggleFile = (filePath) => {
    setSelectedFiles(prev =>
      prev.includes(filePath)
        ? prev.filter(f => f !== filePath)
        : [...prev, filePath]
    );
  };

  const toggleGroup = (group) => {
    // Keep first file, select rest for deletion (safe mode)
    const filesToSelect = safeMode ? group.files.slice(1) : group.files;
    const paths = filesToSelect.map(f => f.path);
    
    const allSelected = paths.every(p => selectedFiles.includes(p));
    
    if (allSelected) {
      setSelectedFiles(prev => prev.filter(p => !paths.includes(p)));
    } else {
      setSelectedFiles(prev => [...new Set([...prev, ...paths])]);
    }
  };

  const deleteDuplicates = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to delete');
      return;
    }

    setDeleting(true);

    try {
      const result = await window.quickclean.deleteDuplicates(
        selectedFiles,
        safeMode,
        settings.dryRun
      );

      if (result.success) {
        const message = settings.dryRun
          ? `Dry run: Would delete ${result.deleted} files and free ${result.spaceFreedFormatted}`
          : `Deleted ${result.deleted} files and freed ${result.spaceFreedFormatted}`;
        toast.success(message);

        if (!settings.dryRun) {
          scanForDuplicates(); // Rescan
        }
      } else {
        toast.error('Delete failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page duplicates-page">
      <div className="page-header">
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Duplicate Finder
        </motion.h1>
        <motion.p
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Find and remove duplicate files to free up space
        </motion.p>
      </div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="card-title">Scan Configuration</h3>

        <div className="config-section">
          <div className="config-label">Folders to Scan</div>
          <div className="folders-list">
            {selectedFolders.map((folder, index) => (
              <motion.div
                key={index}
                className="folder-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="folder-path">{folder}</span>
                <motion.button
                  className="remove-folder-btn"
                  onClick={() => removeFolder(folder)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="btn btn-secondary"
            onClick={addFolder}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FolderPlus size={18} />
            Add Folder
          </motion.button>
        </div>

        <div className="config-section">
          <div className="config-label">Scan Method</div>
          <div className="scan-type-options">
            {[
              { value: 'name', label: 'By Name', desc: 'Find files with same name' },
              { value: 'size', label: 'By Size', desc: 'Find files with same size' },
              { value: 'checksum', label: 'By Content', desc: 'Find exact duplicates (recommended)' }
            ].map((option) => (
              <motion.label
                key={option.value}
                className={`scan-type-option ${scanType === option.value ? 'active' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="scanType"
                  value={option.value}
                  checked={scanType === option.value}
                  onChange={(e) => setScanType(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-label">{option.label}</div>
                  <div className="option-desc">{option.desc}</div>
                </div>
              </motion.label>
            ))}
          </div>
        </div>

        <div className="config-section">
          <label className="safe-mode-toggle">
            <input
              type="checkbox"
              checked={safeMode}
              onChange={(e) => setSafeMode(e.target.checked)}
            />
            <Shield size={18} />
            <span>Safe Mode (Keep one copy of each duplicate)</span>
          </label>
        </div>

        <div className="scan-actions">
          <motion.button
            className="btn btn-primary"
            onClick={scanForDuplicates}
            disabled={scanning || selectedFolders.length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {scanning ? (
              <>
                <span className="loading-spinner"></span>
                Scanning...
              </>
            ) : (
              <>
                <Search size={18} />
                Scan for Duplicates
              </>
            )}
          </motion.button>

          {scanResults && selectedFiles.length > 0 && (
            <motion.button
              className="btn btn-danger"
              onClick={deleteDuplicates}
              disabled={deleting}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {deleting ? (
                <>
                  <span className="loading-spinner"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete Selected ({selectedFiles.length})
                </>
              )}
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {progress > 0 && (
            <motion.div
              className="progress-bar"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </motion.div>
          )}
        </AnimatePresence>

        {settings.dryRun && (
          <motion.div
            className="warning-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠️ Dry Run Mode: No files will be deleted. Go to Settings to enable real deletion.
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {scanResults && scanResults.duplicates.length > 0 && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="results-header">
              <h3 className="card-title">
                Found {scanResults.totalDuplicates} Duplicate Groups
              </h3>
              <div className="results-stats">
                <span className="stat-item">
                  {scanResults.totalFiles} files
                </span>
                <span className="stat-item">
                  {scanResults.totalWastedSpaceFormatted} wasted
                </span>
              </div>
            </div>

            <div className="duplicates-list">
              {scanResults.duplicates.map((group, groupIndex) => (
                <motion.div
                  key={groupIndex}
                  className="duplicate-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + groupIndex * 0.05 }}
                >
                  <div className="group-header">
                    <motion.button
                      className="select-group-btn"
                      onClick={() => toggleGroup(group)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {(safeMode ? group.files.slice(1) : group.files).every(f =>
                        selectedFiles.includes(f.path)
                      ) ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                      Select {safeMode ? 'Duplicates' : 'All'}
                    </motion.button>
                    <div className="group-info">
                      <Copy size={16} />
                      {group.count} copies • {formatBytes(group.totalSize)} total
                    </div>
                  </div>

                  <div className="files-table">
                    {group.files.map((file, fileIndex) => {
                      const isOriginal = safeMode && fileIndex === 0;
                      return (
                        <motion.label
                          key={fileIndex}
                          className={`file-row ${isOriginal ? 'original' : ''} ${
                            selectedFiles.includes(file.path) ? 'selected' : ''
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.path)}
                            onChange={() => toggleFile(file.path)}
                            disabled={isOriginal}
                          />
                          <File size={16} className="file-icon" />
                          <div className="file-info">
                            <div className="file-path">{file.path}</div>
                            <div className="file-meta">
                              {file.sizeFormatted}
                              {isOriginal && (
                                <span className="original-badge">
                                  <Shield size={12} />
                                  Original (kept)
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scanResults && scanResults.duplicates.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-text">No duplicates found! Your files are clean.</div>
        </motion.div>
      )}

      {!scanResults && !scanning && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">
            Select folders and click "Scan for Duplicates" to begin
          </div>
        </motion.div>
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default Duplicates;
