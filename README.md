<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UYrrar4JepfirmpG9SaZsnn6h0zKzgBF

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## API Key Setup

The app now supports user-provided API keys through the browser's localStorage:

### Option 1: Using Browser Settings (Recommended for Users)

1. Visit the deployed app: https://gemini-ai-image-editor.vercel.app/
2. Open browser's Developer Console (F12 or Right-click > Inspect)
3. Go to the Console tab
4. Type the following and press Enter:
   ```javascript
   localStorage.setItem('gemini_api_key', 'YOUR_GEMINI_API_KEY');
   ```
5. Reload the page
6. Your API key will be saved locally and used for all API calls

### Option 2: Using Environment Variable (For Development)

Set the `GEMINI_API_KEY` environment variable before running the app.

### Getting Your API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API key" in the top navigation
4. Create a new API key or use an existing one
5. Copy your API key

**Important Security Notes:**
- Never share your API key publicly
- API keys stored in localStorage are only accessible on your device
- For production apps, consider implementing proper backend authentication

- ## Desktop Application (Windows 64-bit Executable)

Want to run this app as a standalone desktop application? Check out our comprehensive guide:

📦 **[Desktop Build Guide](./DESKTOP_BUILD_GUIDE.md)** - Complete instructions for building a Windows 64-bit executable (.exe)

The guide includes:
- Step-by-step Electron setup
- Building portable .exe files
- Creating installers with NSIS
- Troubleshooting common issues
- CI/CD integration examples

**Quick Start:**
```bash
# Install dependencies
npm install --save-dev electron electron-builder

# Build Windows 64-bit executable
npm run electron:build:win
```

The executable will be available in the `release/` folder and can be distributed to users who want to run the app without a browser.
