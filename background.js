// Background script for handling Google Text-to-Speech API

// Load configuration
let config = {};
try {
    if (typeof TTS_CONFIG !== 'undefined') {
        config = TTS_CONFIG;
    } else {
        // Default config if config.js is not loaded
        config = {
            engine: 'chirp3',
            chirp3: {
                voice: {
                    languageCode: 'en-GB',
                    name: 'en-GB-Chirp3-HD-Charon'
                },
                audio: {
                    speakingRate: 1.0,
                    audioEncoding: 'OGG_OPUS'
                }
            },
            geminiTts: {
                modelName: 'gemini-2.5-flash-preview-tts',
                voice: {
                    languageCode: 'en-us',
                    name: 'Kore'
                },
                prompt: '',
                audio: {
                    speakingRate: 1.0,
                    audioEncoding: 'LINEAR16'
                }
            }
        };
    }
} catch (e) {
    console.log('Using default config');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'readText') {
        handleTextToSpeech(request)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error: error.message}));
        return true; // Keep message channel open for async response
    }
});

async function handleTextToSpeech(request) {
    // Split text into sentences
    const sentences = request.text.split(/(?<=[.!?:]+)/g).map(s => s.trim()).filter(Boolean);

    for (const sentence of sentences) {
        await fetchAndPlayAudio(sentence, request);
    }
    
    return { success: true };
}

async function fetchAndPlayAudio(text, request) {
    try {
        // Get API key from storage
        const storageData = await getStorageData(['googleApiKey']);
        const apiKey = storageData.googleApiKey;
        
        if (!apiKey) {
            throw new Error('Google API key not configured. Please set it in the extension popup.');
        }
        
        // Determine which engine to use
        const engine = request.engine || 'chirp3';
        
        let requestBody;
        if (engine === 'gemini-tts') {
            requestBody = buildGeminiRequest(text, request);
        } else {
            requestBody = buildChirp3Request(text, request);
        }
        
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
            await playAudio(responseData.audioContent);
        } else {
            throw new Error('No audio content received from API');
        }
        
    } catch (error) {
        console.error('Text-to-Speech Error:', error);
        throw error;
    }
}

function buildChirp3Request(text, request) {
    let voiceName = request.voice || config.chirp3.voice.name;
    let languageCode = config.chirp3.voice.languageCode;
    
    // Extract language code from voice name
    if (request.voice) {
        const parts = request.voice.split('-');
        if (parts.length >= 2) {
            languageCode = `${parts[0]}-${parts[1]}`;
        }
    }
    
    return {
        input: {
            text: text
        },
        voice: {
            languageCode: languageCode,
            name: voiceName
        },
        audio_config: {
            audio_encoding: config.chirp3.audio.audioEncoding,
            speaking_rate: request.speakingRate || config.chirp3.audio.speakingRate,
            sample_rate_hertz: request.sampleRateHertz || 24000
        }
    };
}

function buildGeminiRequest(text, request) {
    const inputObj = {
        text: text
    };
    
    // Add prompt if provided
    if (request.prompt && request.prompt.trim()) {
        inputObj.prompt = request.prompt.trim();
    }
    
    return {
        input: inputObj,
        voice: {
            languageCode: request.languageCode || config.geminiTts.voice.languageCode,
            name: request.voice || config.geminiTts.voice.name,
            modelName: request.model || config.geminiTts.modelName  // Changed from model_name to modelName
        },
        audioConfig: {
            audioEncoding: config.geminiTts.audio.audioEncoding,
            sampleRateHertz: 24000  // Required for Gemini-TTS
        }
    };
}

// Promisified storage access
function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        const storageAPI = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
        storageAPI.sync.get(keys, (result) => {
            if (chrome.runtime.lastError) {
                // Fallback to local storage on error
                storageAPI.local.get(keys, (localResult) => {
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
}

let audioContext;
let audioQueue = [];
let isPlaying = false;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

async function playAudio(base64Audio) {
    const audioData = atob(base64Audio).split('').map(c => c.charCodeAt(0));
    const audioBuffer = await getAudioContext().decodeAudioData(new Uint8Array(audioData).buffer);
    audioQueue.push(audioBuffer);
    if (!isPlaying) {
        playNextInQueue();
    }
}

function playNextInQueue() {
    if (audioQueue.length === 0) {
        isPlaying = false;
        return;
    }
    isPlaying = true;
    const audioBuffer = audioQueue.shift();
    const source = getAudioContext().createBufferSource();
    source.buffer = audioBuffer;
    source.connect(getAudioContext().destination);
    source.onended = playNextInQueue;
    source.start();
}

// Install/update handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('Text-to-Speech extension installed');
});