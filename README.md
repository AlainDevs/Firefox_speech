# Firefox Speech Extension

A Firefox browser extension that integrates Google Cloud Text-to-Speech (TTS) with Chirp 3 HD voices to provide high-quality speech synthesis for web content.

## Overview

This Firefox extension leverages Google Cloud's latest Chirp 3 HD voices to convert text into natural-sounding audio directly in your browser. Powered by state-of-the-art large language models (LLMs), these voices offer significantly improved realism and emotional expressiveness compared to traditional TTS solutions.

## Features

### 🎯 Core Functionality
- **High-Fidelity Speech**: Generate natural-sounding audio using Google's Chirp 3 HD voices
- **Real-time Processing**: Convert text to speech with minimal latency
- **Streaming Support**: Process long texts efficiently with streaming TTS
- **Multi-language Support**: Access to 31 languages with 8 distinct voice options (4 male, 4 female)

### 🎵 Voice Options
- **Aoede** (Female)
- **Puck** (Male)
- **Charon** (Male)
- **Kore** (Female)
- **Fenrir** (Male)
- **Leda** (Female)
- **Orus** (Male)
- **Zephyr** (Female)

### 🌍 Supported Languages
- **English**: en-US, en-AU, en-GB, en-IN
- **European**: de-DE, fr-FR, fr-CA, es-ES, it-IT, nl-NL, pl-PL, ru-RU
- **Asian**: hi-IN, ja-JP, ko-KR, cmn-CN, th-TH, vi-VN, id-ID, tr-TR
- **Indian**: bn-IN, gu-IN, kn-IN, ml-IN, mr-IN, ta-IN, te-IN
- **Other**: pt-BR, ar-XA

## Installation

### Prerequisites

1. **Google Cloud Project**: Set up a Google Cloud project with Text-to-Speech API enabled
2. **API Authentication**: Configure authentication credentials
3. **Firefox**: Version 90+ recommended

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/firefox-speech-extension.git
   cd firefox-speech-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Google Cloud**
   - Enable the [Text-to-Speech API](https://console.cloud.google.com/flows/enableapi?apiid=texttospeech.googleapis.com)
   - Set up authentication (see [Authentication Setup](#authentication-setup))
   - Note: Chirp 3 voices are available in [specific regions](https://cloud.google.com/text-to-speech/docs/endpoints)

4. **Load Extension in Firefox**
   - Open `about:debugging` in Firefox
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

## Configuration

### Authentication Setup

#### Method 1: Environment Variables
```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
```

#### Method 2: Extension Configuration
1. Open the extension options page
2. Enter your Google Cloud Project ID
3. Upload your service account credentials

### Voice Configuration

Default settings can be customized in the extension options:

```javascript
{
  "defaultVoice": "en-US-Chirp3-HD-Aoede",
  "languageCode": "en-US",
  "audioEncoding": "MP3",
  "speakingRate": 1.0,
  "pitch": 0.0,
  "volumeGainDb": 0.0
}
```

## Usage

### Basic Text-to-Speech

1. **Select Text**: Highlight any text on a webpage
2. **Right-click**: Choose "Speak with Chirp 3" from the context menu
3. **Listen**: Audio will play automatically

### Advanced Features

#### Streaming Mode
For long texts (articles, blog posts):
- Enable streaming mode in settings
- Text is processed sentence by sentence
- Reduces latency for long content

#### Voice Switching
- Quick voice switcher in the toolbar popup
- Language auto-detection for multilingual content
- Custom voice preferences per website

#### Keyboard Shortcuts
- `Ctrl+Shift+S`: Speak selected text
- `Ctrl+Shift+P`: Pause/Resume playback
- `Ctrl+Shift+X`: Stop playback

## Technical Implementation

### Core Components

#### Text Processing
```javascript
function processText(text) {
  // Split text into sentences for streaming
  const sentences = text.match(/[^.!?]+[.!?](?:\s|$)/g);
  return sentences?.map(s => s.trim()) || [text];
}
```

#### TTS Integration
```javascript
async function synthesizeSpeech(text, voice) {
  const response = await texttospeech.synthesizeSpeech({
    input: { text },
    voice: {
      name: `${languageCode}-Chirp3-HD-${voice}`,
      languageCode
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  });
  return response.audioContent;
}
```

#### Streaming Implementation
```javascript
async function* streamingSynthesize(textIterator, voice) {
  const configRequest = {
    streamingConfig: { voice }
  };
  
  yield configRequest;
  
  for (const text of textIterator) {
    yield {
      input: { text }
    };
  }
}
```

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Content       │    │   Background     │    │   Google Cloud  │
│   Script        │◄──►│   Script         │◄──►│   TTS API       │
│                 │    │                  │    │                 │
│ • Text Selection│    │ • API Calls      │    │ • Chirp 3 HD    │
│ • Audio Playback│    │ • Authentication │    │ • Streaming     │
│ • UI Controls   │    │ • Caching        │    │ • Multi-language│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Reference

### Main Functions

#### `synthesizeSpeech(text, options)`
Convert text to speech using real-time processing.

**Parameters:**
- `text` (string): Text to convert
- `options` (object): Voice and audio configuration

**Returns:** Promise\<AudioBuffer\>

#### `streamingSynthesize(textIterator, voice)`
Process text using streaming TTS for long content.

**Parameters:**
- `textIterator` (Iterator\<string\>): Stream of text chunks
- `voice` (VoiceConfig): Voice configuration

**Returns:** Iterator\<bytes\>

### Configuration Options

```typescript
interface VoiceConfig {
  name: string;           // e.g., "en-US-Chirp3-HD-Aoede"
  languageCode: string;   // e.g., "en-US"
  speakingRate?: number;  // 0.25 to 4.0
  pitch?: number;         // -20.0 to 20.0
  volumeGainDb?: number;  // -96.0 to 16.0
}

interface AudioConfig {
  audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  effectsProfileId?: string[];
}
```

## Privacy & Security

### Data Handling
- Text is sent to Google Cloud TTS API for processing
- No text is stored locally or logged
- Audio files are cached temporarily for performance
- All communication uses HTTPS encryption

### Permissions
The extension requires the following permissions:
- `activeTab`: Access current tab content
- `storage`: Save user preferences
- `contextMenus`: Add right-click menu options
- `https://texttospeech.googleapis.com/*`: API access

## Troubleshooting

### Common Issues

#### Authentication Errors
```
Error: Request had invalid authentication credentials
```
**Solution**: Verify your Google Cloud credentials and API key setup.

#### Rate Limiting
```
Error: Quota exceeded for quota metric 'texttospeech.googleapis.com/requests'
```
**Solution**: Check your API quotas in Google Cloud Console.

#### Audio Playback Issues
```
Error: Failed to decode audio data
```
**Solution**: Ensure your browser supports the selected audio encoding format.

### Debug Mode

Enable debug logging in extension options:
```javascript
{
  "debug": true,
  "logLevel": "info"
}
```

## Performance Optimization

### Caching Strategy
- Audio files cached for 24 hours
- LRU cache with 100MB limit
- Cache cleared on voice/language changes

### Network Optimization
- Request batching for multiple sentences
- Compression for large text inputs
- Retry logic with exponential backoff

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Setup
```bash
# Install development dependencies
npm install --dev

# Run tests
npm test

# Build extension
npm run build

# Watch for changes
npm run watch
```

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on Google Cloud Platform's [generative-ai examples](https://github.com/GoogleCloudPlatform/generative-ai)
- Chirp 3 HD voices documentation and samples
- Firefox WebExtension API documentation

## Support

- **Documentation**: [Google Cloud TTS Docs](https://cloud.google.com/text-to-speech/docs)
- **Issues**: [GitHub Issues](https://github.com/your-username/firefox-speech-extension/issues)
- **Community**: [Discord Server](https://discord.gg/your-server)

## Changelog

### v1.0.0
- Initial release with Chirp 3 HD voice support
- Real-time and streaming TTS
- Multi-language support
- Firefox WebExtension integration