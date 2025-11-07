import React, { useState, useEffect } from 'react';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cleaner from './components/Cleaner';
import Browser from './components/Browser';
import Duplicates from './components/Duplicates';
import Uninstaller from './components/Uninstaller';
import Settings from './components/Settings';
import Logs from './components/Logs';
import HealthCheck from './components/HealthCheck';
import PerformanceOptimizer from './components/PerformanceOptimizer';
import DiskAnalyzer from './components/DiskAnalyzer';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [settings, setSettings] = useState({
    dryRun: true,
    browserCleaning: true,
    testMode: true,
    customFolders: []
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('quickclean-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('quickclean-settings', JSON.stringify(newSettings));
  };

  const renderPage = () => {
    const pageProps = { settings, saveSettings };
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard key="dashboard" {...pageProps} />;
      case 'cleaner':
        return <Cleaner key="cleaner" {...pageProps} />;
      case 'browser':
        return <Browser key="browser" {...pageProps} />;
      case 'duplicates':
        return <Duplicates key="duplicates" {...pageProps} />;
      case 'diskanalyzer':
        return <DiskAnalyzer key="diskanalyzer" {...pageProps} />;
      case 'uninstaller':
        return <Uninstaller key="uninstaller" />;
      case 'healthcheck':
        return <HealthCheck key="healthcheck" />;
      case 'performance':
        return <PerformanceOptimizer key="performance" />;
      case 'settings':
        return <Settings key="settings" {...pageProps} />;
      case 'logs':
        return <Logs key="logs" />;
      default:
        return <Dashboard key="dashboard" {...pageProps} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app theme-transition">
        <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#ff3b3b',
              secondary: '#fff',
            },
          },
        }}
      />
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
