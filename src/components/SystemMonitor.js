import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, Activity, Thermometer, X, Maximize2, Minimize2 } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './SystemMonitor.css';

function SystemMonitor({ settings = {} }) {
  const [stats, setStats] = useState({
    cpu: 0,
    ram: { usage: 0, total: 0, used: 0, free: 0 },
    disk: { usage: 0, total: 0, used: 0, free: 0 },
    temperature: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isElectron, setIsElectron] = useState(false);

  // Check if running in Electron
  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && window.quickclean !== undefined);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try new systemAPI first (real hardware stats)
        if (window.systemAPI && window.systemAPI.getStats) {
          const data = await window.systemAPI.getStats();
          if (data) {
            // Convert to old format for compatibility
            setStats({
              cpu: parseFloat(data.cpuUsage),
              ram: {
                usage: parseFloat(data.memUsage),
                total: parseFloat(data.totalMem),
                used: parseFloat(data.usedMem),
                free: parseFloat(data.freeMem)
              },
              disk: {
                usage: parseFloat(data.diskUsed),
                total: parseFloat(data.diskTotal),
                used: parseFloat(data.diskUsedSpace),
                free: parseFloat(data.diskFreeSpace)
              },
              temperature: 45 // Default since temp may not be available
            });
            return;
          }
        }
        
        // Fallback to old API
        if (window.quickclean && window.quickclean.getSystemStats) {
          const data = await window.quickclean.getSystemStats(settings?.testMode || false);
          if (data) {
            setStats(data);
            return;
          }
        }
        
        // If not in Electron, use mock data for browser testing
        if (!isElectron) {
          setStats({
            cpu: Math.round(30 + Math.random() * 40),
            ram: {
              usage: Math.round(40 + Math.random() * 30),
              total: 16,
              used: 8,
              free: 8
            },
            disk: {
              usage: Math.round(50 + Math.random() * 20),
              total: 500,
              used: 325,
              free: 175
            },
            temperature: Math.round(40 + Math.random() * 20)
          });
        }
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
        // Fallback to mock data on error
        setStats({
          cpu: 0,
          ram: { usage: 0, total: 16, used: 0, free: 16 },
          disk: { usage: 0, total: 500, used: 0, free: 500 },
          temperature: 0
        });
      }
    };

    // Initial fetch
    fetchStats();

    // Update every 2 seconds
    const interval = setInterval(fetchStats, 2000);

    return () => clearInterval(interval);
  }, [settings, isElectron]);

  const getColor = (value) => {
    if (value < 50) return '#4caf50';
    if (value < 75) return '#ff9800';
    return '#ff3b3b';
  };

  const getTempColor = (temp) => {
    if (temp < 50) return '#4caf50';
    if (temp < 70) return '#ff9800';
    return '#ff3b3b';
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`system-monitor ${isMinimized ? 'minimized' : ''}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="monitor-header">
        <div className="monitor-title">
          <Activity size={16} />
          System Monitor
        </div>
        <div className="monitor-controls">
          <motion.button
            className="monitor-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </motion.button>
          <motion.button
            className="monitor-btn"
            onClick={() => setIsVisible(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={14} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="monitor-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="monitor-grid">
              <motion.div
                className="monitor-item"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="monitor-icon cpu">
                  <Cpu size={20} />
                </div>
                <div className="monitor-gauge">
                  <CircularProgressbar
                    value={stats.cpu}
                    text={`${stats.cpu}%`}
                    styles={buildStyles({
                      pathColor: getColor(stats.cpu),
                      textColor: getColor(stats.cpu),
                      trailColor: 'rgba(0, 0, 0, 0.05)',
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
                <div className="monitor-label">CPU</div>
              </motion.div>

              <motion.div
                className="monitor-item"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="monitor-icon ram">
                  <Activity size={20} />
                </div>
                <div className="monitor-gauge">
                  <CircularProgressbar
                    value={stats.ram.usage}
                    text={`${stats.ram.usage}%`}
                    styles={buildStyles({
                      pathColor: getColor(stats.ram.usage),
                      textColor: getColor(stats.ram.usage),
                      trailColor: 'rgba(0, 0, 0, 0.05)',
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
                <div className="monitor-label">
                  RAM
                  {stats.ram.total > 0 && (
                    <span className="monitor-detail">
                      {stats.ram.used}/{stats.ram.total} GB
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="monitor-item"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="monitor-icon disk">
                  <HardDrive size={20} />
                </div>
                <div className="monitor-gauge">
                  <CircularProgressbar
                    value={stats.disk.usage}
                    text={`${stats.disk.usage}%`}
                    styles={buildStyles({
                      pathColor: getColor(stats.disk.usage),
                      textColor: getColor(stats.disk.usage),
                      trailColor: 'rgba(0, 0, 0, 0.05)',
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
                <div className="monitor-label">
                  Disk
                  {stats.disk.total > 0 && (
                    <span className="monitor-detail">
                      {stats.disk.used}/{stats.disk.total} GB
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="monitor-item"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="monitor-icon temp">
                  <Thermometer size={20} />
                </div>
                <div className="monitor-gauge">
                  <CircularProgressbar
                    value={stats.temperature}
                    maxValue={100}
                    text={`${stats.temperature}°C`}
                    styles={buildStyles({
                      pathColor: getTempColor(stats.temperature),
                      textColor: getTempColor(stats.temperature),
                      trailColor: 'rgba(0, 0, 0, 0.05)',
                      pathTransitionDuration: 0.5,
                    })}
                  />
                </div>
                <div className="monitor-label">Temp</div>
              </motion.div>
            </div>

            <div className="monitor-footer">
              <div className="monitor-status">
                <span className="status-dot"></span>
                Live • Updates every 2s
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SystemMonitor;
