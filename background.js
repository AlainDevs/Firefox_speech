// Background script for handling Google Text-to-Speech API

// Load configuration
let config = {};
try {
    // Import config if available
    if (typeof TTS_CONFIG !== 'undefined') {
        config = TTS_CONFIG;
    } else {
        // Default config if config.js is not loaded - using Chirp 3 HD
        config = {
            voice: {
                languageCode: 'en-GB',
                name: 'en-GB-Chirp3-HD-Charon'
                // Chirp 3 HD voices don't use ssmlGender
            },
            audio: {
                speakingRate: 1.0,
                audioEncoding: 'MP3'
                // Chirp 3 HD voices don't support pitch and volumeGainDb
            },
            api: {
                timeout: 30000,
                retryAttempts: 1
            }
        };
    }
} catch (e) {
    console.log('Using default config');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'readText') {
        handleTextToSpeech(request.text)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error: error.message}));
        return true; // Keep message channel open for async response
    }
});

async function handleTextToSpeech(text) {
    try {
        // Get API key from storage - use browser API for better Firefox compatibility
        let result;
        let apiKey;
        
        // Try multiple storage methods for Firefox compatibility
        try {
            // First try browser.storage.sync (Firefox preferred)
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
                result = await browser.storage.sync.get(['googleApiKey']);
                console.log('Browser sync storage result:', result);
                apiKey = result.googleApiKey;
            } else {
                // Fallback to chrome.storage.sync
                result = await chrome.storage.sync.get(['googleApiKey']);
                console.log('Chrome sync storage result:', result);
                apiKey = result && result.googleApiKey;
            }
        } catch (syncError) {
            console.log('Sync storage failed, trying local storage:', syncError);
            try {
                if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                    result = await browser.storage.local.get(['googleApiKey']);
                    console.log('Browser local storage result:', result);
                    apiKey = result.googleApiKey;
                } else {
                    result = await chrome.storage.local.get(['googleApiKey']);
                    console.log('Chrome local storage result:', result);
                    apiKey = result && result.googleApiKey;
                }
            } catch (localError) {
                console.log('Local storage also failed:', localError);
            }
        }
        
        console.log('API key retrieved:', apiKey ? 'Found' : 'Not found');
        
        if (!apiKey) {
            throw new Error('Google API key not configured. Please set it in the extension popup.');
        }
        
        // Prepare the request payload for Google Text-to-Speech API (Chirp 3 HD)
        const requestBody = {
            input: {
                text: text
            },
            voice: {
                languageCode: config.voice.languageCode,
                name: config.voice.name
                // Note: Chirp 3 HD voices don't use ssmlGender parameter
            },
            audio_config: {
                audio_encoding: config.audio.audioEncoding,
                speaking_rate: config.audio.speakingRate
                // Note: Chirp 3 HD voices don't support pitch and volumeGainDb parameters
            }
        };
        
        // Make API call to Google Text-to-Speech
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (data.audioContent) {
            // Convert base64 audio to blob and play it
            await playAudio(data.audioContent);
            return {success: true, message: 'Text read successfully'};
        } else {
            throw new Error('No audio content received from API');
        }
        
    } catch (error) {
        console.error('Text-to-Speech Error:', error);
        throw error;
    }
}

async function playAudio(base64Audio) {
    try {
        // Convert base64 to blob
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], {type: 'audio/mp3'});
        
        // Create audio element and play
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        return new Promise((resolve, reject) => {
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                reject(new Error('Failed to play audio'));
            };
            audio.play().catch(reject);
        });
        
    } catch (error) {
        console.error('Audio playback error:', error);
        throw new Error('Failed to play synthesized speech');
    }
}

// Install/update handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('Text-to-Speech extension installed');
});