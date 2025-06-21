// Configuration file for the Text-to-Speech extension
// This file contains default settings that can be easily modified

const TTS_CONFIG = {
    // Voice settings - Chirp 3 HD Voices
    voice: {
        languageCode: 'en-GB',              // UK English
        name: 'en-GB-Chirp3-HD-Charon',    // Male UK Chirp 3 HD voice
        // Available UK voices: en-GB-Chirp3-HD-Charon (Male), en-GB-Chirp3-HD-Aoede (Female)
        // Available voices: Aoede (F), Puck (M), Charon (M), Kore (F), Fenrir (M), Leda (F), Orus (M), Zephyr (F)
    },
    
    // Audio settings
    audio: {
        speakingRate: 1.0,           // Speed: 0.25 to 2.0 (1.0 = normal) - Chirp 3 supports up to 2.0
        audioEncoding: 'MP3'         // MP3, LINEAR16, OGG_OPUS, ALAW, MULAW, PCM
    },
    
    // Keyboard shortcut
    shortcut: {
        key: 'x',                    // The key to press with Shift
        requireShift: true,          // Whether Shift is required
        requireCtrl: false,          // Whether Ctrl is required
        requireAlt: false            // Whether Alt is required
    },
    
    // UI settings
    ui: {
        notificationDuration: 3000,  // How long notifications show (milliseconds)
        showSuccessNotifications: true,
        showErrorNotifications: true,
        showWarningNotifications: true
    },
    
    // API settings
    api: {
        timeout: 30000,              // API request timeout (milliseconds)
        retryAttempts: 1             // Number of retry attempts on failure
    }
};

// Alternative Chirp 3 HD voice options (uncomment to use)
/*
// Female UK voice
TTS_CONFIG.voice.name = 'en-GB-Chirp3-HD-Aoede';

// US voices (Male)
TTS_CONFIG.voice.languageCode = 'en-US';
TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Charon';

// US voices (Female)
TTS_CONFIG.voice.languageCode = 'en-US';
TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Aoede';

// Other popular voices:
// TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Puck';    // Male US
// TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Kore';    // Female US
// TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Fenrir';  // Male US
// TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Leda';    // Female US
// TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Orus';    // Male US
// TTS_CONFIG.voice.name = 'en-US-Chirp3-HD-Zephyr';  // Female US

// Australian voices
TTS_CONFIG.voice.languageCode = 'en-AU';
TTS_CONFIG.voice.name = 'en-AU-Chirp3-HD-Charon';  // Male AU
// TTS_CONFIG.voice.name = 'en-AU-Chirp3-HD-Aoede';   // Female AU
*/

// Make config available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TTS_CONFIG;
} else if (typeof window !== 'undefined') {
    window.TTS_CONFIG = TTS_CONFIG;
}