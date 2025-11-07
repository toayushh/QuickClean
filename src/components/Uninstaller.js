import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import './Uninstaller.css';

function Uninstaller() {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [uninstalling, setUninstalling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadApps = async () => {
    setLoading(true);
    setApps([]);

    try {
      const result = await window.quickclean.listInstalledApps();
      
      if (result.success) {
        setApps(result.apps);
        toast.success(`Found ${result.totalApps} installed applications`);
      } else {
        toast.error('Failed to load apps: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (appName) => {
    setSelectedApps(prev =>
      prev.includes(appName)
        ? prev.filter(name => name !== appName)
        : [...prev, appName]
    );
  };

  const uninstallApps = () => {
    if (selectedApps.length === 0) {
      toast.error('Please select apps to uninstall');
      return;
    }
    setShowModal(true);
  };

  const confirmUninstall = async () => {
    setShowModal(false);
    setUninstalling(true);

    try {
      for (const appName of selectedApps) {
        const result = await window.quickclean.uninstallApp(appName);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(`Failed to uninstall ${appName}`);
        }
      }
      setSelectedApps([]);
      loadApps();
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setUninstalling(false);
    }
  };

  return (
    <div className="page uninstaller-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Program Uninstaller
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Manage and remove installed applications
        </motion.p>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="uninstaller-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={loadApps}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Loading...
              </>
            ) : (
              <>
                <Search size={18} />
                List Installed Programs
              </>
            )}
          </motion.button>

          {selectedApps.length > 0 && (
            <motion.button 
              className="btn btn-danger"
              onClick={uninstallApps}
              disabled={uninstalling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {uninstalling ? (
                <>
                  <span className="loading-spinner"></span>
                  Uninstalling...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Uninstall Selected ({selectedApps.length})
                </>
              )}
            </motion.button>
          )}
        </div>

        <motion.div 
          className="warning-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ Warning: Uninstalling programs is permanent. Make sure you want to remove the selected application.
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {apps.length > 0 && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="card-title">Installed Programs ({apps.length})</h3>
            <div className="apps-grid">
              {apps.map((app, index) => (
                <motion.div 
                  key={index} 
                  className={`app-card ${selectedApps.includes(app.name) ? 'selected' : ''}`}
                  onClick={() => toggleApp(app.name)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="app-icon">
                    <Package size={32} />
                  </div>
                  <div className="app-info">
                    <div className="app-name">{app.name}</div>
                    <div className="app-details">
                      <span>{app.vendor}</span>
                      <span className="app-version">v{app.version}</span>
                    </div>
                  </div>
                  {selectedApps.includes(app.name) && (
                    <motion.div 
                      className="selected-indicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!apps.length && !loading && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">Click "List Installed Programs" to see applications</div>
          <div className="empty-state-note">Note: This may take a minute to load</div>
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
              <h3 className="modal-title">Confirm Uninstall</h3>
              <p className="modal-text">
                Are you sure you want to uninstall {selectedApps.length} application(s)? This action cannot be undone.
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
                  onClick={confirmUninstall}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Uninstall Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Uninstaller;
