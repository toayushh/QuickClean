import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Download, TrendingUp, HardDrive, Globe, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SystemMonitor from './SystemMonitor';
import './Dashboard.css';

function Dashboard({ settings }) {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [animatedSize, setAnimatedSize] = useState(0);
  const [animatedFiles, setAnimatedFiles] = useState(0);

  useEffect(() => {
    if (scanResults) {
      // Animate count-up for size
      const targetSize = scanResults.totalSize;
      const duration = 1500;
      const steps = 60;
      const increment = targetSize / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetSize) {
          setAnimatedSize(targetSize);
          clearInterval(timer);
        } else {
          setAnimatedSize(Math.floor(current));
        }
      }, duration / steps);

      // Animate count-up for files
      const targetFiles = scanResults.totalFiles;
      const fileIncrement = targetFiles / steps;
      let currentFiles = 0;

      const fileTimer = setInterval(() => {
        currentFiles += fileIncrement;
        if (currentFiles >= targetFiles) {
          setAnimatedFiles(targetFiles);
          clearInterval(fileTimer);
        } else {
          setAnimatedFiles(Math.floor(currentFiles));
        }
      }, duration / steps);

      return () => {
        clearInterval(timer);
        clearInterval(fileTimer);
      };
    }
  }, [scanResults]);

  const runHealthCheck = async () => {
    setScanning(true);
    setProgress(0);
    setScanResults(null);
    setAnimatedSize(0);
    setAnimatedFiles(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const results = await window.quickclean.scanSystem({ testMode: settings.testMode });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (results.success) {
        setScanResults(results);
        toast.success('Health check complete!');
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

  const exportReport = async () => {
    if (!scanResults) return;
    
    try {
      const result = await window.quickclean.exportReport(scanResults);
      if (result.success) {
        toast.success('Report exported successfully!');
      } else {
        toast.error('Export failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return (mb / 1024).toFixed(2) + ' GB';
    }
    return mb.toFixed(0) + ' MB';
  };

  const healthScore = scanResults ? Math.max(0, 100 - (scanResults.totalSize / (1024 * 1024 * 10))) : 100;

  return (
    <div className="page dashboard-page">
      <SystemMonitor settings={settings} />
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Dashboard
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          System health overview and quick actions
        </motion.p>
      </div>

      <motion.div 
        className="dashboard-hero"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="hero-content">
          <div className="health-meter-container">
            <svg className="health-meter" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff3b3b" />
                  <stop offset="100%" stopColor="#ff6b6b" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="12"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 85}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                animate={{ 
                  strokeDashoffset: scanResults 
                    ? 2 * Math.PI * 85 * (1 - healthScore / 100)
                    : 2 * Math.PI * 85 * 0.1
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
              />
              <text
                x="100"
                y="95"
                textAnchor="middle"
                fill="white"
                fontSize="48"
                fontWeight="800"
              >
                {scanResults ? Math.round(healthScore) : '--'}
              </text>
              <text
                x="100"
                y="115"
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.8)"
                fontSize="14"
                fontWeight="600"
              >
                HEALTH
              </text>
            </svg>
          </div>

          <h2 className="hero-title">PC Health Check</h2>
          <p className="hero-text">Scan your system for junk files, temporary data, and optimize performance</p>
          
          <motion.button 
            className="btn btn-primary btn-large"
            onClick={runHealthCheck}
            disabled={scanning}
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
                <Activity size={20} />
                Run Health Check
              </>
            )}
          </motion.button>

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
        </div>
      </motion.div>

      <AnimatePresence>
        {scanResults && (
          <>
            <motion.div 
              className="stats-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <HardDrive className="stat-icon" size={24} strokeWidth={2} />
                <div className="stat-label">Total Junk Found</div>
                <div className="stat-value">{formatBytes(animatedSize * 1024 * 1024)}</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="stat-icon" size={24} strokeWidth={2} />
                <div className="stat-label">Files Found</div>
                <div className="stat-value">{animatedFiles}</div>
              </motion.div>
              
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Globe className="stat-icon" size={24} strokeWidth={2} />
                <div className="stat-label">Categories</div>
                <div className="stat-value">{scanResults.categories.length}</div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card-header">
                <h3 className="card-title">Scan Results</h3>
                <motion.button 
                  className="btn btn-secondary" 
                  onClick={exportReport}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={20} strokeWidth={2} />
                  Export Report
                </motion.button>
              </div>
              
              <div className="results-list">
                {scanResults.categories.map((category, index) => (
                  <motion.div 
                    key={index} 
                    className="result-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="result-info">
                      <div className="result-category">
                        <AlertCircle size={20} strokeWidth={2} />
                        {category.category}
                      </div>
                      <div className="result-details">
                        {category.filesFound} items • {category.totalSize}
                      </div>
                    </div>
                    <div className={`result-status ${category.filesFound > 0 ? 'warning' : 'success'}`}>
                      {category.filesFound > 0 ? '⚠️ Needs cleaning' : '✅ Clean'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!scanResults && !scanning && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Run a health check to see your system status</div>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
