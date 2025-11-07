import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Shield, Zap, Settings as SettingsIcon, Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

function Settings({ settings, saveSettings }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isResetting, setIsResetting] = useState(false);
  const { theme, changeTheme } = useTheme();

  const handleToggle = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    saveSettings(localSettings);
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    setIsResetting(true);
    const defaultSettings = {
      dryRun: false, // Changed to false for production use
      browserCleaning: true,
      testMode: false, // Changed to false for real data
      customFolders: []
    };
    
    setTimeout(() => {
      setLocalSettings(defaultSettings);
      saveSettings(defaultSettings);
      toast.success('Settings reset to defaults');
      setIsResetting(false);
    }, 500);
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Settings
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Configure QuickClean preferences
        </motion.p>
      </div>

      <motion.div 
        className="card settings-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-header">
          <Shield className="section-icon" size={24} />
          <h3 className="section-title">Safety Settings</h3>
        </div>
        
        <motion.div 
          className="setting-item"
          whileHover={{ x: 4 }}
        >
          <div className="setting-info">
            <div className="setting-label">Dry Run Mode</div>
            <div className="setting-description">
              Simulate cleaning without actually deleting files (recommended for first use)
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.dryRun}
              onChange={() => handleToggle('dryRun')}
            />
            <span className="toggle-slider"></span>
          </label>
        </motion.div>

        <motion.div 
          className="setting-item"
          whileHover={{ x: 4 }}
        >
          <div className="setting-info">
            <div className="setting-label">Test Mode</div>
            <div className="setting-description">
              Use simulated data for safe testing (no real file scanning)
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.testMode}
              onChange={() => handleToggle('testMode')}
            />
            <span className="toggle-slider"></span>
          </label>
        </motion.div>
      </motion.div>

      <motion.div 
        className="card settings-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="section-header">
          <Sun className="section-icon" size={24} />
          <h3 className="section-title">Appearance</h3>
        </div>
        
        <motion.div 
          className="setting-item theme-selector"
          whileHover={{ x: 4 }}
        >
          <div className="setting-info">
            <div className="setting-label">Theme</div>
            <div className="setting-description">
              Choose your preferred color scheme
            </div>
          </div>
          <div className="theme-options">
            <motion.button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => changeTheme('light')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sun size={18} />
              Light
            </motion.button>
            <motion.button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => changeTheme('dark')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Moon size={18} />
              Dark
            </motion.button>
            <motion.button
              className={`theme-btn ${theme === 'auto' ? 'active' : ''}`}
              onClick={() => changeTheme('auto')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Monitor size={18} />
              Auto
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="card settings-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-header">
          <Zap className="section-icon" size={24} />
          <h3 className="section-title">Feature Settings</h3>
        </div>
        
        <motion.div 
          className="setting-item"
          whileHover={{ x: 4 }}
        >
          <div className="setting-info">
            <div className="setting-label">Browser Cleaning</div>
            <div className="setting-description">
              Enable cleaning of browser cache and temporary files
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.browserCleaning}
              onChange={() => handleToggle('browserCleaning')}
            />
            <span className="toggle-slider"></span>
          </label>
        </motion.div>
      </motion.div>

      <motion.div 
        className="card settings-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-header">
          <SettingsIcon className="section-icon" size={24} />
          <h3 className="section-title">Current Configuration</h3>
        </div>
        <motion.div 
          className="config-display"
          animate={isResetting ? { scale: [1, 0.95, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <pre>{JSON.stringify(localSettings, null, 2)}</pre>
        </motion.div>
      </motion.div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="settings-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={handleSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save size={18} />
            Save Settings
          </motion.button>
          <motion.button 
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isResetting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isResetting ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;
