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
                audioEncoding: 'OGG_OPUS'
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
        // Pass voice, speakingRate, and sampleRateHertz from the popup
        handleTextToSpeech(request.text, request.voice, request.speakingRate, request.sampleRateHertz)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error: error.message}));
        return true; // Keep message channel open for async response
    }
});

async function handleTextToSpeech(text, voiceName, speakingRate, sampleRateHertz) {
    try {
        let effectiveVoiceName = voiceName || config.voice.name;
        let effectiveLanguageCode = config.voice.languageCode; // Default

        if (voiceName) {
            // Extract language code from voice name, e.g., "en-US-Chirp3-HD-Charon" -> "en-US"
            const parts = voiceName.split('-');
            if (parts.length >= 2) {
                effectiveLanguageCode = `${parts[0]}-${parts[1]}`;
            }
        }

        // Promisified storage access for better compatibility
        const getStorageData = (key) => {
            return new Promise((resolve, reject) => {
                const storageAPI = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
                storageAPI.sync.get(key, (result) => {
                    if (chrome.runtime.lastError) {
                        // Fallback to local storage on error
                        storageAPI.local.get(key, (localResult) => {
                            if (chrome.runtime.lastError) {
                                return reject(chrome.runtime.lastError);
                            }
                            resolve(localResult);
                        });
                    } else {
                        resolve(result);
                    }
                });
            });
        };

        // Get API key from storage
        const storageData = await getStorageData(['googleApiKey']);
        const apiKey = storageData.googleApiKey;
        
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
                languageCode: effectiveLanguageCode,
                name: effectiveVoiceName
                // Note: Chirp 3 HD voices don't use ssmlGender parameter
            },
            audio_config: {
                audio_encoding: config.audio.audioEncoding,
                speaking_rate: speakingRate || config.audio.speakingRate,
                sample_rate_hertz: sampleRateHertz || 24000
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
        
        const responseData = await response.json();
        
        if (responseData.audioContent) {
            // Convert base64 audio to blob and play it
            await playAudio(responseData.audioContent);
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
        const audioBlob = new Blob([bytes], {type: 'audio/ogg'}); // Correct MIME type for OGG_OPUS
        
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