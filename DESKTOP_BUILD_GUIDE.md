# Desktop Build Guide - Creating Windows 64-bit Executable

This guide explains how to build a standalone Windows 64-bit executable (.exe) for the Gemini AI Image Editor application using Electron.

## Overview

Electron allows you to package your web application as a native desktop application that runs on Windows, macOS, and Linux. This guide focuses on creating a Windows 64-bit executable.

## Prerequisites

- Node.js (v18 or higher) installed
- npm or yarn package manager
- Windows OS (for testing) or any OS with cross-compilation support

## Installation Steps

### Step 1: Install Electron Dependencies

Add the necessary Electron packages to your project:

```bash
npm install --save-dev electron electron-builder concurrently wait-on cross-env
```

Or with yarn:

```bash
yarn add --dev electron electron-builder concurrently wait-on cross-env
```

### Step 2: Create Electron Main Process File

Create a new file named `electron.js` in the root directory:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'public/icon.png'),
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, 'dist/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update package.json

Add the following to your `package.json`:

```json
{
  "name": "gemini-ai-image-editor",
  "version": "1.0.0",
  "main": "electron.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win --x64"
  },
  "build": {
    "appId": "com.afridixsahil.gemini-ai-image-editor",
    "productName": "Gemini AI Image Editor",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron.js",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64"
          ]
        },
        {
          "target": "portable",
          "arch": [
            "x64"
          ]
        }
      ],
      "icon": "public/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "portable": {
      "artifactName": "Gemini-AI-Image-Editor-${version}-portable.exe"
    }
  }
}
```

### Step 4: Install electron-is-dev

```bash
npm install electron-is-dev
```

### Step 5: Update Vite Configuration

Modify `vite.config.ts` to set the base path for Electron:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // Important for Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
```

## Building the Executable

### Development Mode

To test the Electron app in development:

```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron.

### Build for Production

#### Windows 64-bit Executable

```bash
npm run electron:build:win
```

This creates:
1. **Portable EXE**: A single executable file that doesn't require installation
   - Location: `release/Gemini-AI-Image-Editor-{version}-portable.exe`
   - Users can double-click to run immediately

2. **NSIS Installer**: A full installer for Windows
   - Location: `release/Gemini AI Image Editor Setup {version}.exe`
   - Allows users to install the app traditionally

### Build for All Platforms

```bash
npm run electron:build
```

## Distribution

### File Sizes

- Portable EXE: ~80-120 MB (includes Chromium)
- NSIS Installer: ~80-120 MB

### What to Distribute

**Option 1 (Recommended)**: Portable Executable
- Share the `*-portable.exe` file
- Users can run it directly without installation
- Perfect for quick testing and distribution

**Option 2**: Installer
- Share the NSIS Setup `.exe` file
- Professional installation experience
- Creates Start Menu shortcuts and Desktop icons
- Better for production distribution

## Adding an Icon

1. Create a 256x256 PNG icon
2. Place it in `public/icon.png`
3. For Windows, you can also use `.ico` format
4. Update the icon path in both `electron.js` and `package.json` build configuration

## Troubleshooting

### Common Issues

**1. "Cannot find module 'electron'"**
```bash
npm install electron --save-dev
```

**2. Build fails on Linux/macOS when building for Windows**
```bash
# Install wine (for Linux)
sudo apt-get install wine64

# Or use Docker
docker run --rm -ti \
  -v ${PWD}:/project \
  electronuserland/builder:wine \
  /bin/bash -c "npm run electron:build:win"
```

**3. App shows blank screen**
- Check that `base: './'` is set in `vite.config.ts`
- Verify the build completed successfully
- Check electron console for errors

**4. API key not persisting**
- LocalStorage works in Electron just like in browsers
- Make sure context isolation is properly configured

## Testing the Executable

1. Build the app: `npm run electron:build:win`
2. Navigate to `release/` folder
3. Double-click the portable `.exe` file
4. The app should launch as a native Windows application

## CI/CD Integration

For automated builds, you can use GitHub Actions:

```yaml
name: Build Desktop App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run electron:build:win
      
      - uses: actions/upload-artifact@v3
        with:
          name: windows-executable
          path: release/*.exe
```

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Vite Documentation](https://vitejs.dev/)

## Size Optimization Tips

1. **Remove DevTools** in production
2. **Compress with UPX**: `electron-builder --win --x64 --config.compression=maximum`
3. **Code splitting**: Use dynamic imports in your React code
4. **Tree shaking**: Ensure your build process eliminates unused code

## Alternative: Tauri

For smaller executable sizes (~3-5 MB), consider [Tauri](https://tauri.app/):
- Uses native webview instead of bundling Chromium
- Written in Rust
- Better performance and security
- Smaller binary size
- Trade-off: Slightly more complex setup

---

**Note**: The Electron executable will be significantly larger than a web build because it bundles a complete Chromium browser engine. This is normal and expected for Electron applications.
