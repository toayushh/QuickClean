import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Cpu, Activity, HardDrive, Battery, Clock, 
  AlertCircle, CheckCircle, Rocket, Power, X,
  PlayCircle, StopCircle, Loader, RefreshCw, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import './PerformanceOptimizer.css';

function PerformanceOptimizer() {
  const [stats, setStats] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [startupApps, setStartupApps] = useState([]);
  const [optimizationStats, setOptimizationStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [boostResult, setBoostResult] = useState(null);
  const [selectedProcesses, setSelectedProcesses] = useState([]);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadStats();
      if (activeTab === 'processes') {
        loadProcesses();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadAllData = async () => {
    await Promise.all([
      loadStats(),
      loadProcesses(),
      loadStartupApps(),
      loadOptimizationStats()
    ]);
  };

  const loadStats = async () => {
    try {
      if (window.systemAPI && window.systemAPI.getStats) {
        const data = await window.systemAPI.getStats();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch system stats', err);
    }
  };

  const loadProcesses = async () => {
    try {
      if (window.optimizerAPI && window.optimizerAPI.getProcesses) {
        const result = await window.optimizerAPI.getProcesses();
        if (result.success) {
          setProcesses(result.processes || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch processes', err);
    }
  };

  const loadStartupApps = async () => {
    try {
      if (window.optimizerAPI && window.optimizerAPI.getStartupApps) {
        const result = await window.optimizerAPI.getStartupApps();
        if (result.success) {
          setStartupApps(result.apps || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch startup apps', err);
    }
  };

  const loadOptimizationStats = async () => {
    try {
      if (window.optimizerAPI && window.optimizerAPI.getOptimizationStats) {
        const result = await window.optimizerAPI.getOptimizationStats();
        if (result.success) {
          setOptimizationStats(result.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch optimization stats', err);
    }
  };

  const handleBoostMemory = async () => {
    setBoosting(true);
    setBoostResult(null);
    
    try {
      const result = await window.optimizerAPI.boostMemory();
      setBoostResult(result);
      
      if (result.success) {
        toast.success(result.message);
        await loadStats();
        await loadOptimizationStats();
      } else {
        toast.error(result.message || 'Memory boost failed');
      }
    } catch (err) {
      toast.error('Error boosting memory');
    } finally {
      setBoosting(false);
    }
  };

  const getStatusColor = (value) => {
    const num = parseFloat(value);
    if (num < 60) return 'status-good';
    if (num < 80) return 'status-warning';
    return 'status-critical';
  };

  const getStatusText = (value) => {
    const num = parseFloat(value);
    if (num < 60) return 'Good';
    if (num < 80) return 'Warning';
    return 'Critical';
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!stats) {
    return (
      <div className="page performance-page">
        <div className="loading-state">
          <TrendingUp className="spin" size={48} />
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page performance-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Performance Optimizer
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Monitor, optimize, and boost your system performance
        </motion.p>
      </div>

      <motion.div 
        className="tab-navigation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={18} />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          <Activity size={18} />
          Processes ({processes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'startup' ? 'active' : ''}`}
          onClick={() => setActiveTab('startup')}
        >
          <Rocket size={18} />
          Startup Apps ({startupApps.length})
        </button>
      </motion.div>

      {activeTab === 'overview' && (
        <motion.div 
          className="system-overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overview-title">
            <TrendingUp size={28} />
            System Overview
          </div>
          
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={18} />
                    CPU Load
                  </div>
                </td>
                <td>{stats.cpuUsage}%</td>
                <td>
                  <span className={`status-badge ${getStatusColor(stats.cpuUsage)}`}>
                    {getStatusText(stats.cpuUsage)}
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} />
                    Memory Usage
                  </div>
                </td>
                <td>{stats.memUsage}% ({stats.usedMem}/{stats.totalMem} GB)</td>
                <td>
                  <span className={`status-badge ${getStatusColor(stats.memUsage)}`}>
                    {getStatusText(stats.memUsage)}
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HardDrive size={18} />
                    Disk Usage
                  </div>
                </td>
                <td>{stats.diskUsed}% ({stats.diskUsedSpace}/{stats.diskTotal} GB)</td>
                <td>
                  <span className={`status-badge ${getStatusColor(stats.diskUsed)}`}>
                    {getStatusText(stats.diskUsed)}
                  </span>
                </td>
              </tr>
              {stats.battery !== null && (
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Battery size={18} />
                      Battery
                    </div>
                  </td>
                  <td>{stats.battery}%</td>
                  <td>
                    <span className={`status-badge ${stats.battery > 20 ? 'status-good' : 'status-critical'}`}>
                      {stats.batteryCharging ? 'Charging' : 'On Battery'}
                    </span>
                  </td>
                </tr>
              )}
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} />
                    Uptime
                  </div>
                </td>
                <td>{formatUptime(stats.uptime)}</td>
                <td>
                  <span className="status-badge status-good">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              className="action-card boost-card" 
              onClick={handleBoostMemory}
              disabled={boosting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 2rem', cursor: 'pointer' }}
            >
              <div className="action-icon">
                {boosting ? <Loader className="spin" size={32} /> : <Rocket size={32} />}
              </div>
              <div className="action-content">
                <h3>Boost Memory</h3>
                <p>Clear caches and free up RAM</p>
              </div>
            </button>
          </div>

          {boostResult && (
            <div className="boost-result-card" style={{ marginTop: '2rem' }}>
              <div className="boost-header">
                <CheckCircle size={24} className="success-icon" />
                <h3>Memory Boost Complete</h3>
                <button onClick={() => setBoostResult(null)} className="close-btn">
                  <X size={18} />
                </button>
              </div>
              <div className="boost-stats">
                <div className="boost-stat">
                  <span className="label">RAM Before:</span>
                  <span className="value">{boostResult.ramBefore}%</span>
                </div>
                <div className="boost-stat">
                  <span className="label">RAM After:</span>
                  <span className="value">{boostResult.ramAfter}%</span>
                </div>
                <div className="boost-stat highlight">
                  <span className="label">RAM Freed:</span>
                  <span className="value">{boostResult.ramFreed}%</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'processes' && (
        <div className="processes-tab">
          <h3>Process Management Coming Soon</h3>
          <p>Full process management features will be available here.</p>
        </div>
      )}

      {activeTab === 'startup' && (
        <div className="startup-tab">
          <h3>Startup Manager Coming Soon</h3>
          <p>Startup application management features will be available here.</p>
        </div>
      )}
    </div>
  );
}

export default PerformanceOptimizer;
