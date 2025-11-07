# QuickClean Pro 🚀

<div align="center">

![QuickClean Pro](https://img.shields.io/badge/QuickClean-Pro-ff3b3b?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-0078D6?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A professional PC cleaning and optimization tool built with Electron, React, and Node.js**

*Clean. Fast. Secure.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Safety Features](#-safety-features)
- [Build & Deploy](#-build--deploy)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

QuickClean Pro is a production-ready PC cleaning and optimization tool comparable to CCleaner. It provides comprehensive system maintenance features with a modern, intuitive interface.

### Key Highlights

- ✅ **100% Free & Open Source**
- ✅ **No Telemetry or Tracking**
- ✅ **Cross-Platform Support**
- ✅ **Modern UI with Dark/Light Themes**
- ✅ **Safe Operations with Multiple Safety Modes**
- ✅ **Real-Time System Monitoring**

---

## ✨ Features

### 🏠 Dashboard
- System health overview with health score (0-100)
- Quick access to all features
- Real-time system statistics
- Visual health indicators

### 🏥 Health Check
- Comprehensive system health analysis
- CPU, RAM, Disk, and Temperature monitoring
- Smart recommendations based on system state
- Status indicators (Excellent/Good/Fair/Critical)

### ⚡ Performance Optimizer
- **Process Manager**: View and end running processes
- **Memory Boost**: Free up RAM instantly
- **Startup Manager**: Control programs that run on startup
- **Performance Mode**: Enable/disable performance optimizations
- Real-time performance metrics

### 🗑️ System Cleaner
- Scans and removes temporary files
- Cleans application cache (VSCode, Discord, Slack, etc.)
- Safe deletion with path validation
- Dry run mode for preview
- Admin elevation when needed

### 🌐 Browser Cleaner
- Supports Chrome, Edge, Firefox
- Detects running browsers
- Safe cache clearing
- Preserves bookmarks and passwords
- Shows space to be freed

### 📁 Duplicate Finder
- Three scan methods: Name, Size, Checksum (MD5)
- Recursive folder scanning
- Grouped duplicate display
- Selective deletion
- Space reclamation calculation

### 💾 Disk Analyzer
- Visual disk space analysis
- File categorization (8 types: Documents, Images, Videos, Audio, Archives, Programs, Code, Other)
- Three view modes: By Type, Largest Files, Largest Folders
- Drive and folder selection
- Real-time progress tracking

### 📦 App Uninstaller
- Lists all installed applications
- Batch uninstall support
- Shows app details (name, vendor, version)
- WMI-based management

### ⚙️ Settings
- **Test Mode**: Simulated data (safe for testing)
- **Dry Run Mode**: Real scanning, simulated deletion
- **Production Mode**: Real operations
- Theme support (Light/Dark/Auto)
- Custom folder configuration

### 📝 Logs
- Comprehensive operation logging
- Error tracking
- Activity history
- Export logs functionality

---

## 🚀 Installation

### Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd quickclean

# Install dependencies
npm install

# Start development mode
npm run dev
```

The app will launch automatically with hot reload enabled.

---

## 💻 Usage

### First Time Setup

1. **Start in Test Mode** (enabled by default)
   - Uses simulated data
   - No real file operations
   - Safe to explore all features

2. **Try Dry Run Mode**
   - Scans real files
   - Simulates deletion
   - Preview what would be cleaned

3. **Production Mode** (when ready)
   - Disable both Test Mode and Dry Run in Settings
   - Actually performs operations
   - Use with caution

### Basic Workflow

1. **Dashboard** → Check system health
2. **Health Check** → Run comprehensive analysis
3. **Performance** → Optimize system performance
4. **Cleaner** → Remove junk files
5. **Browser** → Clean browser cache
6. **Duplicates** → Find and remove duplicate files
7. **Disk Analyzer** → Analyze disk space usage
8. **Uninstaller** → Manage installed applications

### Safety Tips

- ✅ Always start with Test Mode
- ✅ Use Dry Run before actual deletion
- ✅ Review files before cleaning
- ✅ Keep backups of important data
- ✅ Check logs for any issues

---

## 🗂️ Project Structure

```
quickclean/
├── src/
│   ├── components/              # React components
│   │   ├── Dashboard.js         # Main dashboard
│   │   ├── HealthCheck.js       # Health check feature
│   │   ├── PerformanceOptimizer.js  # Performance tools
│   │   ├── Cleaner.js           # System cleaner
│   │   ├── Browser.js           # Browser cleaner
│   │   ├── Duplicates.js        # Duplicate finder
│   │   ├── DiskAnalyzer.js      # Disk analyzer
│   │   ├── Uninstaller.js       # App uninstaller
│   │   ├── Settings.js          # Settings panel
│   │   ├── Logs.js              # Logs viewer
│   │   ├── Sidebar.js           # Navigation sidebar
│   │   ├── SystemMonitor.js     # System stats widget
│   │   └── HelpModal.js         # Help & About modal
│   │
│   ├── backend/                 # Node.js backend modules
│   │   ├── index.js             # Main backend exports
│   │   ├── fileScanner.js       # File scanning logic
│   │   ├── safeDelete.js        # Safe deletion logic
│   │   ├── browserCleaner.js    # Browser cleaning logic
│   │   ├── duplicateFinder.js   # Duplicate detection
│   │   ├── diskAnalyzer.js      # Disk analysis logic
│   │   ├── uninstallManager.js  # App uninstall logic
│   │   ├── registryScanner.js   # Registry scanning
│   │   ├── systemMonitor.js     # System metrics
│   │   ├── healthMonitor.js     # Health check logic
│   │   ├── performanceManager.js # Performance optimization
│   │   └── startupManager.js    # Startup management
│   │
│   ├── electron/                # Electron configuration
│   │   ├── main.js              # Main process
│   │   ├── preload.js           # Preload script (IPC bridge)
│   │   └── systemMonitor.js     # System stats handler
│   │
│   ├── contexts/                # React contexts
│   │   └── ThemeContext.js      # Theme management
│   │
│   ├── App.js                   # Main app component
│   ├── App.css                  # Global styles
│   ├── index.js                 # Entry point
│   └── index.css                # Base styles & CSS variables
│
├── public/                      # Static assets
│   ├── index.html
│   └── favicon.ico
│
├── build/                       # Build assets
│   └── icon.ico                 # App icon
│
├── dist/                        # Build output (generated)
│
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── README.md                    # This file
```

---

## 🎨 Technology Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Framer Motion** 10.16.4 - Smooth animations
- **Lucide React** 0.292.0 - Modern icons
- **React Hot Toast** 2.4.1 - Toast notifications
- **Recharts** 2.10.3 - Charts and graphs
- **Tailwind CSS** 3.3.5 - Utility-first CSS

### Backend
- **Electron** 27.0.0 - Desktop framework
- **Node.js** - Backend runtime
- **fs-extra** 11.1.1 - Enhanced file operations
- **systeminformation** 5.22.8 - System metrics
- **sudo-prompt** 9.2.1 - Admin elevation

### Build Tools
- **electron-builder** 24.6.4 - App packaging
- **concurrently** 8.2.1 - Process management
- **wait-on** 7.0.1 - Dev server sync
- **react-scripts** 5.0.1 - React build tools

---

## 🛡️ Safety Features

### Triple Safety System

1. **Test Mode**
   - Uses simulated/mock data
   - No real file system operations
   - Safe for testing and demos
   - Instant results

2. **Dry Run Mode**
   - Scans real files
   - Simulates deletion operations
   - Shows what would be deleted
   - No actual changes made

3. **Production Mode**
   - Real file operations
   - Requires user confirmation
   - Detailed operation logs
   - Reversible when possible

### Path Protection

- **Protected Paths**: System directories are automatically excluded
  - `C:\Windows`
  - `C:\Program Files`
  - `C:\Program Files (x86)`
  - `C:\ProgramData\Microsoft`
  - `$Recycle.Bin`
  - `node_modules`
  - `.git`

- **Whitelist Approach**: Only scans approved directories
- **Path Validation**: Validates all paths before operations
- **Safe Directory Restrictions**: Prevents accidental system file deletion

### User Confirmations

- Preview before deletion
- Confirmation dialogs for critical operations
- Detailed file lists with sizes
- Undo capability where possible

---

## 🔨 Build & Deploy

### Development

```bash
# Start development server
npm run dev

# Start React dev server only
npm start

# Start Electron only
npm run electron
```

### Production Build

```bash
# Build for production
npm run build
```

**Output:**
- `dist/QuickCleanSetup.exe` - Windows installer (NSIS)
- `dist/win-unpacked/` - Portable Windows version
- `dist/QuickClean.dmg` - macOS installer (if built on macOS)
- `dist/QuickClean.AppImage` - Linux installer (if built on Linux)

### Build Configuration

The build is configured in `package.json`:

```json
{
  "build": {
    "appId": "com.quickclean.app",
    "productName": "QuickClean",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## 📊 Performance

### Speed
- Dashboard load: < 1 second
- Temp file scan: 5-15 seconds
- Browser scan: 3-10 seconds
- Duplicate scan: 30-120 seconds (depends on folder size)
- Disk analysis: 10-60 seconds (depends on folder size)

### Resource Usage
- **RAM**: ~100-200 MB
- **CPU**: < 5% idle, 20-40% during scan
- **Disk I/O**: Minimal
- **Network**: None (fully offline)

---

## 🔒 Privacy & Security

- ✅ **No External Data Transmission** - All operations are local
- ✅ **No Telemetry or Tracking** - Your data stays on your device
- ✅ **No Analytics** - We don't collect any usage data
- ✅ **Logs Stored Locally Only** - Full transparency
- ✅ **Open Source** - Audit the code yourself
- ✅ **No Account Required** - Use immediately

---

## 🎯 Comparison with CCleaner

| Feature | QuickClean Pro | CCleaner |
|---------|---------------|----------|
| System Cleaning | ✅ | ✅ |
| Browser Cleaning | ✅ | ✅ |
| Duplicate Finder | ✅ | ✅ (Pro) |
| Disk Analyzer | ✅ | ✅ (Pro) |
| App Uninstaller | ✅ | ✅ |
| Startup Manager | ✅ | ✅ |
| Performance Optimizer | ✅ | ✅ (Pro) |
| Health Dashboard | ✅ | ✅ (Pro) |
| Modern UI | ✅ | ⚠️ |
| Dark/Light Theme | ✅ | ❌ |
| Open Source | ✅ | ❌ |
| Free | ✅ | Limited |
| Privacy | ✅ 100% | ⚠️ |
| Cross-Platform | ✅ | ⚠️ Limited |

---

## 🐛 Known Issues

1. **WMI App Listing Slow** - Windows WMI is inherently slow (10-30 seconds)
2. **Temperature Estimation** - Not real hardware temperature (by design for safety)
3. **Registry Cleaning** - Read-only mode (safety feature)

No critical issues. All core functionality working as expected.

---

## 🔮 Future Enhancements

- [ ] Registry cleaner (advanced mode)
- [ ] Scheduled cleaning
- [ ] Multi-language support
- [ ] System restore point creation
- [ ] Command-line interface
- [ ] Cloud backup integration
- [ ] File shredder
- [ ] Privacy tools

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help others understand the project
5. **Share the Project** - Spread the word

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (use Test Mode)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use ES6+ JavaScript
- Follow React best practices
- Use functional components with hooks
- Add comments for complex logic
- Test in both Test Mode and Production Mode

---

## 📝 License

MIT License

Copyright (c) 2024 QuickClean Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://react.dev/)
- Icons from [Lucide](https://lucide.dev/)
- Animations with [Framer Motion](https://www.framer.com/motion/)
- System metrics via [systeminformation](https://systeminformation.io/)
- Charts by [Recharts](https://recharts.org/)

---

## 📞 Support

### Getting Help

1. Check this README
2. Review the code comments
3. Check logs in the Logs tab
4. Enable Test Mode to isolate issues
5. Open an issue on GitHub

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- QuickClean version
- Error message or screenshot
- Steps to reproduce
- Expected vs actual behavior

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start React dev server only
npm start

# Start Electron only
npm run electron
```

---

<div align="center">

**QuickClean Pro** - Clean. Fast. Secure. 🚀

*Made with ❤️ using Electron, React, and Node.js*

**[⬆ Back to Top](#quickclean-pro-)**

---

*Version 1.0.0 | MIT License | 2024*

</div>
