import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Chrome, Globe, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Browser.css';

function Browser({ settings }) {
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [browserData, setBrowserData] = useState(null);
  const [selectedBrowsers, setSelectedBrowsers] = useState(['chrome', 'edge', 'firefox']);
  const [showModal, setShowModal] = useState(false);

  const browserIcons = {
    chrome: '🌐',
    edge: '🔷',
    firefox: '🦊'
  };

  const scanBrowsers = async () => {
    setScanning(true);
    setBrowserData(null);

    try {
      const result = await window.quickclean.scanBrowser(selectedBrowsers);
      
      if (result.success) {
        setBrowserData(result);
        toast.success('Browser scan complete!');
      } else {
        toast.error('Scan failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  const cleanBrowsers = async () => {
    if (!browserData) return;

    const runningBrowsers = browserData.browsers.filter(b => b.isRunning);
    if (runningBrowsers.length > 0) {
      toast.error(`Please close: ${runningBrowsers.map(b => b.name).join(', ')}`);
      return;
    }

    setShowModal(true);
  };

  const confirmClean = async () => {
    setShowModal(false);
    setCleaning(true);

    try {
      const result = await window.quickclean.cleanBrowser(selectedBrowsers, settings.dryRun);
      
      if (result.success) {
        const message = settings.dryRun
          ? `Dry run: Would free ${result.totalSizeFreedFormatted}`
          : `Cleaned browser cache, freed ${result.totalSizeFreedFormatted}`;
        toast.success(message);
        
        if (!settings.dryRun) {
          scanBrowsers();
        }
      } else {
        toast.error('Cleaning failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setCleaning(false);
    }
  };

  const toggleBrowser = (browserKey) => {
    setSelectedBrowsers(prev =>
      prev.includes(browserKey)
        ? prev.filter(k => k !== browserKey)
        : [...prev, browserKey]
    );
  };

  return (
    <div className="page browser-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Browser Cleaner
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Clean browser cache and temporary data
        </motion.p>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="card-title">Select Browsers</h3>
        <div className="browser-selection">
          {['chrome', 'edge', 'firefox'].map((browser, index) => (
            <motion.label 
              key={browser} 
              className="browser-checkbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <input
                type="checkbox"
                checked={selectedBrowsers.includes(browser)}
                onChange={() => toggleBrowser(browser)}
              />
              <span className="browser-icon">{browserIcons[browser]}</span>
              <span className="browser-name">
                {browser === 'chrome' && 'Google Chrome'}
                {browser === 'edge' && 'Microsoft Edge'}
                {browser === 'firefox' && 'Mozilla Firefox'}
              </span>
            </motion.label>
          ))}
        </div>

        <div className="browser-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={scanBrowsers}
            disabled={scanning || selectedBrowsers.length === 0}
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
                Scan Browser Data
              </>
            )}
          </motion.button>

          {browserData && (
            <motion.button 
              className="btn btn-danger"
              onClick={cleanBrowsers}
              disabled={cleaning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cleaning ? (
                <>
                  <span className="loading-spinner"></span>
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Clean Browser Cache
                </>
              )}
            </motion.button>
          )}
        </div>

        {settings.dryRun && (
          <motion.div 
            className="warning-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠️ Dry Run Mode: No files will be deleted. Go to Settings to enable real cleaning.
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {browserData && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="card-title">Browser Cache Status</h3>
            <div className="browser-list">
              {browserData.browsers.map((browser, index) => (
                <motion.div 
                  key={index} 
                  className="browser-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="browser-item-icon">
                    {browserIcons[browser.key]}
                  </div>
                  <div className="browser-info">
                    <div className="browser-header">
                      <span className="browser-title">{browser.name}</span>
                      <motion.span 
                        className={`status-badge ${browser.isRunning ? 'running' : 'ready'}`}
                        animate={browser.isRunning ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {browser.isRunning ? '🔴 Running' : '✅ Ready'}
                      </motion.span>
                    </div>
                    <div className="browser-details">
                      Cache Size: <strong>{browser.cacheSizeFormatted}</strong>
                    </div>
                    {browser.isRunning && (
                      <motion.div 
                        className="browser-warning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <AlertCircle size={14} />
                        Please close this browser before cleaning
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="browser-summary">
              <strong>Total Cache:</strong> {browserData.totalSizeFormatted}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!browserData && !scanning && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state-icon">🌐</div>
          <div className="empty-state-text">Select browsers and click "Scan Browser Data"</div>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">Confirm Browser Cleaning</h3>
              <p className="modal-text">
                Are you sure you want to clean browser cache? This will remove temporary files and may log you out of some websites.
              </p>
              <div className="modal-actions">
                <motion.button 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  className="btn btn-danger"
                  onClick={confirmClean}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clean Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Browser;
