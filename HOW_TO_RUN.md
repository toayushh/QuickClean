# QuickClean Pro - How to Run

## 🚀 Quick Start (3 minutes)

### Prerequisites
- **Node.js** v16 or higher ([Download here](https://nodejs.org/))
- **Windows** 10/11

---

## 📥 Method 1: Download from GitHub (Recommended)

### Step 1: Download the Code
1. Go to: https://github.com/toayushh/QuickClean
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder (e.g., `C:\QuickClean`)

### Step 2: Install Dependencies
1. Open **Command Prompt** (Press `Win + R`, type `cmd`, press Enter)
2. Navigate to the folder:
   ```
   cd C:\QuickClean
   ```
3. Install dependencies:
   ```
   npm install
   ```
   ⏱️ This takes 1-2 minutes

### Step 3: Run the Application
```
npm run dev
```

⏱️ The app will open automatically in 10-20 seconds!

---

## 🎯 Method 2: Clone with Git (If you have Git installed)

```bash
git clone https://github.com/toayushh/QuickClean.git
cd QuickClean
npm install
npm run dev
```

---

## ✨ What You'll See

The application will start with:
- **Dashboard** - System health overview
- **10 Features** - All ready to test
- **Test Mode** - Enabled by default (100% safe)

---

## 🛡️ Safety Features

The app starts in **Test Mode** by default:
- ✅ Uses simulated data
- ✅ No actual file operations
- ✅ 100% safe to explore all features

To enable real operations:
1. Go to **Settings** (bottom left)
2. Disable "Test Mode"
3. Keep "Dry Run Mode" enabled for safe preview

---

## 🐛 Troubleshooting

### "npm is not recognized"
**Solution:** Node.js is not installed
- Download from: https://nodejs.org/
- Install and restart Command Prompt

### "Port 3000 is already in use"
**Solution:** Another app is using port 3000
- Close other apps or change port in package.json

### "Module not found"
**Solution:** Dependencies not installed
- Run: `npm install`

### App won't start
**Solution:** Clear cache and reinstall
```
rmdir /s /q node_modules
npm install
npm run dev
```

---

## 📦 Optional: Build Windows Installer

If you want to create an installer:

```
npm run build:win
```

This creates: `dist\QuickClean Setup 1.0.0.exe`

⏱️ Takes 2-3 minutes

---

## 🎯 Features to Test

1. **Dashboard** - System health score
2. **Health Check** - CPU, RAM, Disk monitoring
3. **Performance Optimizer** - Process manager, Memory boost
4. **System Cleaner** - Clean temp files
5. **Browser Cleaner** - Clean Chrome, Edge, Firefox
6. **Duplicate Finder** - Find duplicate files
7. **Disk Analyzer** - Analyze disk space
8. **App Uninstaller** - Manage apps
9. **Settings** - Configure options
10. **Logs** - View operations

---

## 📞 Need Help?

- Check the main **README.md** file
- Review code in `src/` folder
- All features are documented

---

## ✅ Summary

**Quick Commands:**
```
npm install    # Install dependencies (once)
npm run dev    # Run the application
```

**That's it!** The app will start and you can test all features.

---

*QuickClean Pro - Clean. Fast. Secure.*
