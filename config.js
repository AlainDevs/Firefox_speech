// Configuration file for the Text-to-Speech extension
// This file contains default settings that can be easily modified

const TTS_CONFIG = {
    // TTS Engine Selection
    engine: 'chirp3',  // 'chirp3' or 'gemini-tts'
    
    // Chirp 3 HD Voice settings
    chirp3: {
        voice: {
            languageCode: 'en-GB',              // UK English
            name: 'en-GB-Chirp3-HD-Charon',    // Male UK Chirp 3 HD voice
        },
        audio: {
            speakingRate: 1.0,           // Speed: 0.25 to 2.0 (1.0 = normal)
            sampleRateHertz: 24000,      // Sample rate in Hertz - 24000 is high quality
            audioEncoding: 'OGG_OPUS'    // MP3, LINEAR16, OGG_OPUS, ALAW, MULAW, PCM
        }
    },
    
    // Gemini-TTS settings
    geminiTts: {
        modelName: 'gemini-2.5-flash-preview-tts',  // 'gemini-2.5-flash-preview-tts' or 'gemini-2.5-pro-preview-tts'
        voice: {
            languageCode: 'en-us',
            name: 'Kore'  // Short name format for Gemini-TTS
        },
        prompt: '',  // Optional: Style instruction prompt
        audio: {
            speakingRate: 1.0,
            audioEncoding: 'LINEAR16'  // Gemini-TTS uses LINEAR16
        }
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

// Gemini-TTS Voice List (30 voices)
const GEMINI_VOICES = {
    male: [
        'Achird', 'Algenib', 'Algieba', 'Alnilam', 'Charon', 'Enceladus',
        'Fenrir', 'Iapetus', 'Orus', 'Puck', 'Rasalgethi', 'Sadachbia',
        'Sadaltager', 'Schedar', 'Umbriel', 'Zubenelgenubi'
    ],
    female: [
        'Achernar', 'Aoede', 'Autonoe', 'Callirrhoe', 'Despina', 'Erinome',
        'Gacrux', 'Kore', 'Laomedeia', 'Leda', 'Pulcherrima', 'Sulafat',
        'Vindemiatrix', 'Zephyr'
    ]
};

// Chirp 3 HD Voice List
const CHIRP3_VOICES = {
    'en-GB': [
        { name: 'en-GB-Chirp3-HD-Charon', label: 'Charon (Male)' },
        { name: 'en-GB-Chirp3-HD-Kore', label: 'Kore (Female)' },
        { name: 'en-GB-Chirp3-HD-Leda', label: 'Leda (Female)' },
        { name: 'en-GB-Chirp3-HD-Puck', label: 'Puck (Male)' }
    ]
};

// Make config available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TTS_CONFIG;
} else if (typeof window !== 'undefined') {
    window.TTS_CONFIG = TTS_CONFIG;
}