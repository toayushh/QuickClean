import React, { useState } from 'react';
import { Home, Trash2, Globe, Package, Settings, FileText, Zap, Copy, HelpCircle, Activity, TrendingUp, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import HelpModal from './HelpModal';
import './Sidebar.css';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'healthcheck', label: 'Health Check', icon: Activity },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'cleaner', label: 'Cleaner', icon: Trash2 },
  { id: 'browser', label: 'Browser', icon: Globe },
  { id: 'duplicates', label: 'Duplicates', icon: Copy },
  { id: 'diskanalyzer', label: 'Disk Analyzer', icon: HardDrive },
  { id: 'uninstaller', label: 'Uninstaller', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'logs', label: 'Logs', icon: FileText }
];

function Sidebar({ currentPage, setCurrentPage }) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <motion.div 
          className="logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-icon">
            <Zap size={28} strokeWidth={2.5} />
          </div>
          <div className="logo-content">
            <span className="logo-text">QuickClean</span>
            <span className="logo-tagline">Clean. Fast. Secure.</span>
          </div>
        </motion.div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="nav-icon" size={20} strokeWidth={2} />
              <span className="nav-label">{item.label}</span>
              {isActive && (
                <motion.div
                  className="active-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <motion.button
          className="help-button"
          onClick={() => setShowHelp(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HelpCircle size={20} strokeWidth={2} />
          <span>Help & About</span>
        </motion.button>
        
        <div className="version">
          <span className="version-label">Version</span>
          <span className="version-number">1.0.0</span>
        </div>
        <div className="copyright">
          © 2024 QuickClean
        </div>
      </div>
      
      {showHelp && <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default Sidebar;
