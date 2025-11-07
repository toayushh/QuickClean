import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Battery, Clock, RefreshCw } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import toast from 'react-hot-toast';
import 'react-circular-progressbar/dist/styles.css';
import './HealthCheck.css';

function HealthCheck() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const analyzeHealth = async () => {
    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (stats) {
        const issues = [];
        if (parseFloat(stats.cpuUsage) > 80) issues.push('High CPU usage detected');
        if (parseFloat(stats.memUsage) > 85) issues.push('High memory usage detected');
        if (parseFloat(stats.diskUsed) > 90) issues.push('Disk space running low');
        
        if (issues.length === 0) {
          toast.success('System health is excellent!');
        } else {
          toast.error(`Found ${issues.length} issue(s): ${issues.join(', ')}`);
        }
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const getColor = (value) => {
    const num = parseFloat(value);
    if (num < 60) return '#4caf50';
    if (num < 80) return '#ff9800';
    return '#ff3b3b';
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
      <div className="page health-check-page">
        <div className="loading-state">
          <RefreshCw className="spin" size={48} />
          <p>Loading system health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page health-check-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Health Check
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Real-time system health monitoring
        </motion.p>
      </div>

      <motion.div 
        className="health-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="health-card"
          whileHover={{ scale: 1.02 }}
        >
          <div className="health-card-header">
            <Cpu size={24} />
            <span>CPU Usage</span>
          </div>
          <div className="health-gauge">
            <CircularProgressbar
              value={parseFloat(stats.cpuUsage)}
              text={`${stats.cpuUsage}%`}
              styles={buildStyles({
                pathColor: getColor(stats.cpuUsage),
                textColor: getColor(stats.cpuUsage),
                trailColor: 'rgba(0, 0, 0, 0.05)',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="health-info">
            {stats.cpuCores} cores
          </div>
        </motion.div>

        <motion.div 
          className="health-card"
          whileHover={{ scale: 1.02 }}
        >
          <div className="health-card-header">
            <Activity size={24} />
            <span>Memory Usage</span>
          </div>
          <div className="health-gauge">
            <CircularProgressbar
              value={parseFloat(stats.memUsage)}
              text={`${stats.memUsage}%`}
              styles={buildStyles({
                pathColor: getColor(stats.memUsage),
                textColor: getColor(stats.memUsage),
                trailColor: 'rgba(0, 0, 0, 0.05)',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="health-info">
            {stats.usedMem} / {stats.totalMem} GB
          </div>
        </motion.div>

        <motion.div 
          className="health-card"
          whileHover={{ scale: 1.02 }}
        >
          <div className="health-card-header">
            <HardDrive size={24} />
            <span>Disk Usage</span>
          </div>
          <div className="health-gauge">
            <CircularProgressbar
              value={parseFloat(stats.diskUsed)}
              text={`${stats.diskUsed}%`}
              styles={buildStyles({
                pathColor: getColor(stats.diskUsed),
                textColor: getColor(stats.diskUsed),
                trailColor: 'rgba(0, 0, 0, 0.05)',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="health-info">
            {stats.diskUsedSpace} / {stats.diskTotal} GB
          </div>
        </motion.div>

        {stats.battery !== null && (
          <motion.div 
            className="health-card"
            whileHover={{ scale: 1.02 }}
          >
            <div className="health-card-header">
              <Battery size={24} />
              <span>Battery</span>
            </div>
            <div className="health-gauge">
              <CircularProgressbar
                value={stats.battery}
                text={`${stats.battery}%`}
                styles={buildStyles({
                  pathColor: stats.battery > 20 ? '#4caf50' : '#ff3b3b',
                  textColor: stats.battery > 20 ? '#4caf50' : '#ff3b3b',
                  trailColor: 'rgba(0, 0, 0, 0.05)',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            <div className="health-info">
              {stats.batteryCharging ? 'Charging' : 'On Battery'}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="card-header">
          <h3 className="card-title">System Information</h3>
        </div>
        <div className="system-info-grid">
          <div className="info-item">
            <Clock size={20} />
            <div>
              <div className="info-label">Uptime</div>
              <div className="info-value">{formatUptime(stats.uptime)}</div>
            </div>
          </div>
          <div className="info-item">
            <Activity size={20} />
            <div>
              <div className="info-label">Platform</div>
              <div className="info-value">{stats.platform}</div>
            </div>
          </div>
          <div className="info-item">
            <HardDrive size={20} />
            <div>
              <div className="info-label">Hostname</div>
              <div className="info-value">{stats.hostname}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="health-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button 
          className="btn btn-primary btn-large"
          onClick={analyzeHealth}
          disabled={analyzing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {analyzing ? (
            <>
              <span className="loading-spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <Activity size={20} />
              Analyze System Health
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default HealthCheck;
