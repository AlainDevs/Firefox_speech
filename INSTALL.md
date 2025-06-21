# Quick Installation Guide - Chirp 3 HD

## Step 1: Get Google API Key (Chirp 3 HD)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable "Cloud Text-to-Speech API"
4. **Important**: Ensure your project region supports Chirp 3 HD (global, us, eu, asia-southeast1)
5. Create an API key (Credentials > Create Credentials > API Key)
6. Copy the API key

## Step 2: Install Extension

### Method A: Temporary Installation (for testing)
1. Open Firefox
2. Type `about:debugging` in address bar
3. Click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Navigate to this folder and select `manifest.json`

### Method B: Package Installation
1. Run `package.bat` (Windows) to create installation folder
2. Or manually create a zip file with all extension files
3. Rename zip to `.xpi` extension
4. Drag `.xpi` file into Firefox

## Step 3: Configure
1. Click the extension icon in Firefox toolbar
2. Paste your Google API key
3. Click "Save API Key"
4. Test with the built-in test function

## Step 4: Use
1. Select any text on a webpage
2. Press **Shift + X**
3. Listen to the ultra-realistic Chirp 3 HD UK English speech!

## Files Needed for Installation:
- `manifest.json`
- `content.js`
- `background.js` 
- `popup.html`
- `popup.js`
- `config.js`

## Troubleshooting
- Check Firefox console (F12) for errors
- Verify API key is correct
- Make sure Google Cloud Text-to-Speech API is enabled
- Test with extension popup first