// Background script for handling Google Text-to-Speech API

// Maximum chunk size for API requests (characters)
// Google TTS API has a 5000 character limit, but we use a safer limit
const MAX_CHUNK_SIZE = 4500;

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

/**
 * Intelligently chunk text into smaller pieces that fit API limits
 * Uses multi-tier approach: sentences → clauses → words
 */
function intelligentChunk(text) {
    const chunks = [];
    
    // First, try splitting by sentences
    const sentences = text.split(/(?<=[.!?:]+)/g).map(s => s.trim()).filter(Boolean);
    
    for (const sentence of sentences) {
        if (sentence.length <= MAX_CHUNK_SIZE) {
            // Sentence fits within limit
            chunks.push(sentence);
        } else {
            // Sentence too long, split by clauses (commas, semicolons)
            const clauses = sentence.split(/(?<=[,;])\s+/).filter(Boolean);
            
            let currentChunk = '';
            for (const clause of clauses) {
                if (clause.length > MAX_CHUNK_SIZE) {
                    // Even a clause is too long, split by word boundaries
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                        currentChunk = '';
                    }
                    
                    const words = clause.split(/\s+/);
                    for (const word of words) {
                        if ((currentChunk + ' ' + word).length > MAX_CHUNK_SIZE) {
                            if (currentChunk) {
                                chunks.push(currentChunk.trim());
                            }
                            currentChunk = word;
                        } else {
                            currentChunk = currentChunk ? currentChunk + ' ' + word : word;
                        }
                    }
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                        currentChunk = '';
                    }
                } else if ((currentChunk + ' ' + clause).length > MAX_CHUNK_SIZE) {
                    // Adding this clause would exceed limit
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                    }
                    currentChunk = clause;
                } else {
                    // Add clause to current chunk
                    currentChunk = currentChunk ? currentChunk + ' ' + clause : clause;
                }
            }
            
            // Add remaining chunk
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
        }
    }
    
    return chunks.filter(chunk => chunk.length > 0);
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
    try {
        // Use intelligent chunking to split text into API-friendly sizes
        const chunks = intelligentChunk(request.text);
        
        console.log(`Processing ${chunks.length} chunks from ${request.text.length} characters`);
        
        // Process each chunk sequentially
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
            await fetchAndPlayAudio(chunk, request);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Text-to-Speech handling error:', error);
        throw error;
    }
}

async function fetchAndPlayAudio(text, request) {
    try {
        // Validate chunk size
        if (text.length > MAX_CHUNK_SIZE) {
            console.warn(`Warning: Chunk size ${text.length} exceeds recommended limit ${MAX_CHUNK_SIZE}`);
        }
        
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
        
        console.log(`Sending ${text.length} chars to ${engine} API`);
        
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
            const errorMsg = errorData.error?.message || 'Unknown error';
            console.error(`API Error (${response.status}):`, errorMsg);
            console.error('Failed text chunk:', text.substring(0, 100) + '...');
            throw new Error(`API Error: ${errorMsg}`);
        }
        
        const responseData = await response.json();
        
        if (responseData.audioContent) {
            await playAudio(responseData.audioContent);
        } else {
            throw new Error('No audio content received from API');
        }
        
    } catch (error) {
        console.error('Text-to-Speech Error:', error);
        console.error('Error details:', {
            textLength: text.length,
            engine: request.engine,
            errorMessage: error.message
        });
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
let currentSource = null;
let playbackTimeout = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume context if suspended (important for Firefox)
    if (audioContext.state === 'suspended') {
        console.log('Resuming suspended AudioContext...');
        audioContext.resume();
    }
    return audioContext;
}

async function playAudio(base64Audio) {
    try {
        console.log('Decoding audio chunk...');
        const audioData = atob(base64Audio).split('').map(c => c.charCodeAt(0));
        const audioBuffer = await getAudioContext().decodeAudioData(new Uint8Array(audioData).buffer);
        console.log(`Audio decoded successfully, duration: ${audioBuffer.duration.toFixed(2)}s`);
        audioQueue.push(audioBuffer);
        if (!isPlaying) {
            playNextInQueue();
        }
    } catch (error) {
        console.error('Audio decoding error:', error);
        throw error;
    }
}

function playNextInQueue() {
    // Clear any existing timeout
    if (playbackTimeout) {
        clearTimeout(playbackTimeout);
        playbackTimeout = null;
    }
    
    if (audioQueue.length === 0) {
        isPlaying = false;
        currentSource = null;
        console.log('Audio queue finished');
        return;
    }
    
    isPlaying = true;
    const audioBuffer = audioQueue.shift();
    const duration = audioBuffer.duration;
    console.log(`Playing audio chunk (${duration.toFixed(2)}s), ${audioQueue.length} remaining in queue`);
    
    // Ensure AudioContext is running
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
            console.log('AudioContext resumed, starting playback...');
            startAudioSource(audioBuffer, duration);
        }).catch(error => {
            console.error('Failed to resume AudioContext:', error);
            playNextInQueue(); // Try next chunk
        });
    } else {
        startAudioSource(audioBuffer, duration);
    }
}

function startAudioSource(audioBuffer, duration) {
    try {
        const ctx = getAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        // Store reference to prevent garbage collection
        currentSource = source;
        
        source.onended = () => {
            console.log('Audio chunk finished playing normally');
            if (playbackTimeout) {
                clearTimeout(playbackTimeout);
                playbackTimeout = null;
            }
            currentSource = null;
            playNextInQueue();
        };
        
        // Safety timeout in case onended doesn't fire
        // Add 1 second buffer to the expected duration
        playbackTimeout = setTimeout(() => {
            console.warn('Audio playback timeout - forcing next chunk');
            if (currentSource) {
                try {
                    currentSource.stop();
                } catch (e) {
                    // Ignore if already stopped
                }
                currentSource = null;
            }
            playbackTimeout = null;
            playNextInQueue();
        }, (duration + 1) * 1000);
        
        source.start(0);
        console.log('Audio source started successfully');
        
    } catch (error) {
        console.error('Error starting audio playback:', error);
        currentSource = null;
        if (playbackTimeout) {
            clearTimeout(playbackTimeout);
            playbackTimeout = null;
        }
        playNextInQueue(); // Try next chunk
    }
}

// Install/update handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('Text-to-Speech extension installed');
});