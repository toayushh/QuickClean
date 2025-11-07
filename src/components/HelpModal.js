import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Shield, Zap, Book, MessageCircle, ChevronLeft } from 'lucide-react';
import './HelpModal.css';

function HelpModal({ isOpen, onClose }) {
  const [view, setView] = useState('main'); // 'main', 'docs', 'support'

  if (!isOpen) return null;

  const renderMainView = () => (
    <>
      <div className="help-section">
        <div className="help-section-icon">
          <HelpCircle size={24} strokeWidth={2} />
        </div>
        <div className="help-section-content">
          <h3 className="help-section-title">How It Works</h3>
          <p className="help-section-text">
            QuickClean Pro safely scans and removes junk files using a triple safety system.
          </p>
          <ul className="help-list">
            <li><strong>Test Mode:</strong> Simulated data</li>
            <li><strong>Dry Run:</strong> Preview only</li>
            <li><strong>Production:</strong> Real cleaning</li>
          </ul>
        </div>
      </div>

      <div className="help-section">
        <div className="help-section-icon">
          <Shield size={24} strokeWidth={2} />
        </div>
        <div className="help-section-content">
          <h3 className="help-section-title">Safety First</h3>
          <p className="help-section-text">
            Only operates on safe directories. Never touches system files or personal documents.
          </p>
          <div className="safety-badges">
            <span className="safety-badge">✅ Whitelist-Only</span>
            <span className="safety-badge">✅ Path Validation</span>
            <span className="safety-badge">✅ Confirmation</span>
          </div>
        </div>
      </div>

      <div className="help-section">
        <div className="help-section-icon">
          <Book size={24} strokeWidth={2} />
        </div>
        <div className="help-section-content">
          <h3 className="help-section-title">Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🗑️</span>
              <span className="feature-name">System Cleaner</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📁</span>
              <span className="feature-name">Duplicates</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌐</span>
              <span className="feature-name">Browser</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📦</span>
              <span className="feature-name">Uninstaller</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-name">Startup</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏥</span>
              <span className="feature-name">Health</span>
            </div>
          </div>
        </div>
      </div>

      <div className="help-actions">
        <button className="help-action-btn" onClick={() => setView('docs')}>
          <Book size={20} strokeWidth={2} />
          <div>
            <div className="action-btn-title">Documentation</div>
            <div className="action-btn-subtitle">Read the full guide</div>
          </div>
          <ChevronLeft size={16} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
        </button>
        
        <button className="help-action-btn" onClick={() => setView('support')}>
          <MessageCircle size={20} strokeWidth={2} />
          <div>
            <div className="action-btn-title">Get Support</div>
            <div className="action-btn-subtitle">Need help? Contact us</div>
          </div>
          <ChevronLeft size={16} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </>
  );

  const renderDocsView = () => (
    <>
      <button className="back-button" onClick={() => setView('main')}>
        <ChevronLeft size={20} strokeWidth={2} />
        Back
      </button>
      
      <div className="help-section">
        <div className="help-section-icon">
          <Book size={24} strokeWidth={2} />
        </div>
        <div className="help-section-content">
          <h3 className="help-section-title">Documentation</h3>
          <p className="help-section-text">
            Complete guides and documentation for QuickClean Pro.
          </p>
        </div>
      </div>

      <div className="docs-list">
        <div className="doc-item">
          <div className="doc-icon">📖</div>
          <div>
            <div className="doc-title">Quick Start Guide</div>
            <div className="doc-desc">Get started in 5 minutes</div>
          </div>
        </div>
        <div className="doc-item">
          <div className="doc-icon">🛡️</div>
          <div>
            <div className="doc-title">Safety Protocols</div>
            <div className="doc-desc">How we keep your data safe</div>
          </div>
        </div>
        <div className="doc-item">
          <div className="doc-icon">⚙️</div>
          <div>
            <div className="doc-title">Feature Overview</div>
            <div className="doc-desc">Complete feature documentation</div>
          </div>
        </div>
        <div className="doc-item">
          <div className="doc-icon">🏥</div>
          <div>
            <div className="doc-title">Health Dashboard</div>
            <div className="doc-desc">Understanding system metrics</div>
          </div>
        </div>
        <div className="doc-item">
          <div className="doc-icon">🚀</div>
          <div>
            <div className="doc-title">Production Guide</div>
            <div className="doc-desc">Deploy and use in production</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSupportView = () => (
    <>
      <button className="back-button" onClick={() => setView('main')}>
        <ChevronLeft size={20} strokeWidth={2} />
        Back
      </button>
      
      <div className="help-section">
        <div className="help-section-icon">
          <MessageCircle size={24} strokeWidth={2} />
        </div>
        <div className="help-section-content">
          <h3 className="help-section-title">Get Support</h3>
          <p className="help-section-text">
            Need help? We're here to assist you.
          </p>
        </div>
      </div>

      <div className="support-options">
        <div className="support-item">
          <div className="support-icon">💬</div>
          <div>
            <div className="support-title">Community Forum</div>
            <div className="support-desc">Ask questions and get answers from the community</div>
          </div>
        </div>
        <div className="support-item">
          <div className="support-icon">📧</div>
          <div>
            <div className="support-title">Email Support</div>
            <div className="support-desc">support@quickclean.app</div>
          </div>
        </div>
        <div className="support-item">
          <div className="support-icon">🐛</div>
          <div>
            <div className="support-title">Report a Bug</div>
            <div className="support-desc">Help us improve by reporting issues</div>
          </div>
        </div>
        <div className="support-item">
          <div className="support-icon">💡</div>
          <div>
            <div className="support-title">Feature Request</div>
            <div className="support-desc">Suggest new features and improvements</div>
          </div>
        </div>
      </div>

      <div className="support-info">
        <p><strong>Response Time:</strong> Usually within 24 hours</p>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Platform:</strong> Windows 10/11</p>
      </div>
    </>
  );

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content help-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-header-content">
              <div className="modal-icon">
                <Zap size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="modal-title">QuickClean Pro</h2>
                <p className="modal-version">Version 1.0.0</p>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          <div className="modal-body">
            {view === 'main' && renderMainView()}
            {view === 'docs' && renderDocsView()}
            {view === 'support' && renderSupportView()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default HelpModal;
