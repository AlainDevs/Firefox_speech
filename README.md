# Firefox Chirp 3 HD Text-to-Speech Extension

A Firefox extension that reads selected text aloud using Google's ultra-realistic Chirp 3 HD voices with a simple keyboard shortcut (Shift + X).

## Features

- 🔊 Read selected text aloud with Shift + X hotkey
- 🇬🇧 Ultra-realistic UK English voice (Chirp 3 HD - Charon)
- ⚡ Speed control (0.25x to 2.0x, currently set to normal: 1.0)
- 🔐 Secure API key storage
- 📱 Simple popup interface for configuration
- 🌐 Works on all websites
- 🎭 Powered by Google's most advanced AI voices

## Setup Instructions

### 1. Get Google Cloud Text-to-Speech API Key (Chirp 3 HD)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Text-to-Speech API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Text-to-Speech API"
   - Click on it and press "Enable"
   - **Important**: Ensure your project has access to Chirp 3 HD voices (available in global, us, eu, asia-southeast1 regions)
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - (Optional) Restrict the API key to only Text-to-Speech API for security

### 2. Install the Extension

#### Option A: Load as Temporary Add-on (for testing)
1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file from this project directory
6. The extension will be loaded temporarily

#### Option B: Package for permanent installation
1. Zip all the extension files (`manifest.json`, `content.js`, `background.js`, `popup.html`, `popup.js`)
2. Rename the zip file to have a `.xpi` extension
3. Open Firefox and drag the `.xpi` file into the browser
4. Follow the installation prompts

### 3. Configure the Extension

1. Click the extension icon in the Firefox toolbar
2. Enter your Google Cloud API key in the popup
3. Click "Save API Key"
4. Test the functionality using the test section in the popup

## How to Use

1. **Select text** on any webpage by highlighting it with your mouse
2. **Press Shift + X** while the text is selected
3. The extension will read the selected text aloud using UK English voice
4. A notification will appear to confirm the action

## Technical Details

### File Structure
```
firefox-speech-extension/
├── manifest.json          # Extension configuration
├── content.js            # Content script for text selection and hotkeys
├── background.js         # Background script for API calls
├── popup.html           # Popup interface HTML
├── popup.js             # Popup interface logic
└── README.md            # This file
```

### Voice Configuration (Chirp 3 HD)
- **Language**: English (UK) - `en-GB`
- **Voice**: `en-GB-Chirp3-HD-Charon` (Ultra-realistic Male UK voice)
- **Speed**: 1.0 (normal speed, adjustable 0.25x to 2.0x)
- **Audio Format**: MP3
- **Technology**: Powered by Google's latest LLM-based speech synthesis

### Permissions Used
- `activeTab`: Access to current webpage for text selection
- `storage`: Store API key securely
- `https://texttospeech.googleapis.com/*`: Access to Google TTS API

## Troubleshooting

### Common Issues

1. **"No text selected" message**
   - Make sure you have selected text before pressing Shift + X
   - Try selecting the text again

2. **"Google API key not configured" error**
   - Open the extension popup and enter your API key
   - Make sure the API key is valid and has Text-to-Speech API enabled

3. **"API Error" messages**
   - Check that your Google Cloud project has Text-to-Speech API enabled
   - Verify your API key is correct and not expired
   - Ensure you have quota/credits available in your Google Cloud account
   - **Important**: Verify your project has access to Chirp 3 HD voices in supported regions

4. **No audio playback**
   - Check your browser's audio settings
   - Make sure the website allows audio playback (some sites block autoplay)
   - Try testing with the built-in test function in the popup

### Browser Compatibility
- Designed for Firefox (manifest v2)
- Requires Firefox 60+ for full compatibility

## Security Notes

- API keys are stored locally in Firefox's secure storage
- No data is sent to third parties except Google's TTS API
- Selected text is only sent to Google for speech synthesis
- API keys are masked in the UI for security

## Future Enhancements

- Settings page for voice selection (8 Chirp 3 HD voices available)
- Support for all 31 Chirp 3 HD supported languages
- Pace control and pause control features
- Custom pronunciation support
- Custom hotkey configuration
- Audio controls (pause, stop, resume)
- Streaming synthesis for longer texts

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Google Cloud setup
3. Test with the built-in test function
4. Check Firefox's extension debugging tools at `about:debugging`