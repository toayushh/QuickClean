import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, ChevronDown, CheckSquare, Square, Folder, File } from 'lucide-react';
import toast from 'react-hot-toast';
import './Cleaner.css';

function Cleaner({ settings }) {
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const scanFiles = async () => {
    setScanning(true);
    setScanData(null);
    setSelectedItems([]);

    try {
      const results = await window.quickclean.scanSystem({ testMode: settings.testMode });
      
      if (results.success) {
        setScanData(results);
        setExpandedCategories(results.categories.map((_, i) => i));
        toast.success('Scan complete!');
      } else {
        toast.error('Scan failed: ' + results.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setSelectedItems(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const toggleCategory = (categoryIndex) => {
    const category = scanData.categories[categoryIndex];
    const categoryKeys = category.items.map((_, itemIndex) => `${categoryIndex}-${itemIndex}`);
    
    const allSelected = categoryKeys.every(key => selectedItems.includes(key));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(key => !categoryKeys.includes(key)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...categoryKeys])]);
    }
  };

  const toggleExpand = (categoryIndex) => {
    setExpandedCategories(prev =>
      prev.includes(categoryIndex)
        ? prev.filter(i => i !== categoryIndex)
        : [...prev, categoryIndex]
    );
  };

  const cleanSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to clean');
      return;
    }

    setCleaning(true);

    try {
      const itemsToClean = [];
      selectedItems.forEach(key => {
        const [catIndex, itemIndex] = key.split('-').map(Number);
        const item = scanData.categories[catIndex].items[itemIndex];
        itemsToClean.push(item);
      });

      const result = await window.quickclean.cleanItems(itemsToClean, settings.dryRun);
      
      if (result.success) {
        const message = settings.dryRun 
          ? `Dry run: Would free ${result.totalSizeFreedFormatted}`
          : `Cleaned ${result.cleaned} items, freed ${result.totalSizeFreedFormatted}`;
        toast.success(message);
        
        if (!settings.dryRun) {
          scanFiles();
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

  return (
    <div className="page cleaner-page">
      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          System Cleaner
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Clean temporary files and application cache
        </motion.p>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="cleaner-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={scanFiles}
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
                <Search size={20} strokeWidth={2} />
                Scan System
              </>
            )}
          </motion.button>

          {scanData && (
            <motion.button 
              className="btn btn-danger clean-btn"
              onClick={cleanSelected}
              disabled={cleaning || selectedItems.length === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={selectedItems.length > 0 ? { boxShadow: ['0 4px 16px rgba(255, 59, 59, 0.3)', '0 8px 24px rgba(255, 59, 59, 0.5)', '0 4px 16px rgba(255, 59, 59, 0.3)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {cleaning ? (
                <>
                  <span className="loading-spinner"></span>
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 size={20} strokeWidth={2} />
                  Clean Selected ({selectedItems.length})
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
        {scanData && scanData.categories.map((category, catIndex) => (
          <motion.div 
            key={catIndex} 
            className="card accordion-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <div className="accordion-header" onClick={() => toggleExpand(catIndex)}>
              <div className="accordion-title-section">
                <motion.div
                  animate={{ rotate: expandedCategories.includes(catIndex) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} strokeWidth={2} />
                </motion.div>
                <Folder size={20} strokeWidth={2} className="category-icon" />
                <div>
                  <div className="category-name">{category.category}</div>
                  <div className="category-stats">
                    {category.filesFound} items • {category.totalSize}
                  </div>
                </div>
              </div>
              
              <motion.button
                className="select-all-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(catIndex);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.items.every((_, itemIndex) => 
                  selectedItems.includes(`${catIndex}-${itemIndex}`)
                ) ? (
                  <CheckSquare size={20} strokeWidth={2} />
                ) : (
                  <Square size={20} strokeWidth={2} />
                )}
                Select All
              </motion.button>
            </div>

            <AnimatePresence>
              {expandedCategories.includes(catIndex) && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="items-list">
                    {category.items.slice(0, 10).map((item, itemIndex) => (
                      <motion.label 
                        key={itemIndex} 
                        className="item-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                        whileHover={{ x: 4 }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(`${catIndex}-${itemIndex}`)}
                          onChange={() => toggleItem(catIndex, itemIndex)}
                        />
                        <File size={18} strokeWidth={2} className="item-icon" />
                        <div className="item-info">
                          <div className="item-path">{item.path}</div>
                          <div className="item-size">{item.size}</div>
                        </div>
                      </motion.label>
                    ))}
                    {category.items.length > 10 && (
                      <div className="more-items">
                        + {category.items.length - 10} more items
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {!scanData && !scanning && (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">Click "Scan System" to find junk files</div>
        </motion.div>
      )}
    </div>
  );
}

export default Cleaner;
