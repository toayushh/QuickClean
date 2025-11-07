import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Logs.css';

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('quickclean-logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      setLogs([]);
      localStorage.removeItem('quickclean-logs');
      toast.success('Logs cleared');
    }
  };

  const addSampleLog = () => {
    const sampleLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: 'System Scan',
      status: 'Success',
      details: 'Found 450 MB of junk files across 234 items',
      filesScanned: 234,
      sizeFound: '450 MB'
    };
    
    const newLogs = [sampleLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem('quickclean-logs', JSON.stringify(newLogs));
    toast.success('Sample log added');
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quickclean-logs-${Date.now()}.json`;
    link.click();
    toast.success('Logs exported');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page logs-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Activity Logs
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          History of scans and cleaning operations
        </motion.p>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="logs-actions">
          <motion.button 
            className="btn btn-secondary"
            onClick={addSampleLog}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add Sample Log
          </motion.button>
          {logs.length > 0 && (
            <>
              <motion.button 
                className="btn btn-secondary"
                onClick={exportLogs}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                Export Logs
              </motion.button>
              <motion.button 
                className="btn btn-danger"
                onClick={clearLogs}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 size={18} />
                Clear All Logs
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {logs.length > 0 ? (
          <div className="timeline">
            {logs.map((log, index) => (
              <motion.div 
                key={log.id} 
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="timeline-marker">
                  <motion.div 
                    className={`timeline-icon ${log.status.toLowerCase()}`}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {log.status === 'Success' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                  </motion.div>
                </div>
                
                <motion.div 
                  className="log-card"
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <div className="log-header">
                    <div className="log-action">{log.action}</div>
                    <div className={`log-status ${log.status.toLowerCase()}`}>
                      {log.status}
                    </div>
                  </div>
                  
                  <div className="log-timestamp">
                    <Clock size={14} />
                    {formatDate(log.timestamp)}
                  </div>
                  
                  <div className="log-details">{log.details}</div>
                  
                  {log.filesScanned && (
                    <div className="log-stats">
                      <span className="log-stat">
                        📁 {log.filesScanned} files
                      </span>
                      <span className="log-stat">
                        💾 {log.sizeFound}
                      </span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No activity logs yet</div>
            <div className="empty-state-note">Logs will appear here after scanning or cleaning</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Logs;
