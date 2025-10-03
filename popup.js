// Popup script for managing API key and testing
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');
    
    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const chirp3Tab = document.getElementById('chirp3-tab');
    const geminiTab = document.getElementById('gemini-tab');
    
    // Chirp3 elements
    const chirp3VoiceSelect = document.getElementById('chirp3VoiceSelect');
    const chirp3SpeedSlider = document.getElementById('chirp3SpeedSlider');
    const chirp3SpeedValue = document.getElementById('chirp3SpeedValue');
    const chirp3SampleRateSelect = document.getElementById('chirp3SampleRateSelect');
    const saveChirp3Settings = document.getElementById('saveChirp3Settings');
    const chirp3TestText = document.getElementById('chirp3TestText');
    const chirp3TestButton = document.getElementById('chirp3TestButton');
    
    // Gemini elements
    const modelOptions = document.querySelectorAll('.model-option');
    const geminiVoiceSelect = document.getElementById('geminiVoiceSelect');
    const geminiPrompt = document.getElementById('geminiPrompt');
    const geminiSpeedSlider = document.getElementById('geminiSpeedSlider');
    const geminiSpeedValue = document.getElementById('geminiSpeedValue');
    const saveGeminiSettings = document.getElementById('saveGeminiSettings');
    const geminiTestText = document.getElementById('geminiTestText');
    const geminiTestButton = document.getElementById('geminiTestButton');
    
    let currentEngine = 'chirp3';
    let selectedGeminiModel = 'gemini-2.5-flash-preview-tts';
    
    // Gemini voice list (from config.js)
    const geminiVoices = {
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
    
    // Initialize
    loadApiKey();
    loadSettings();
    populateGeminiVoices();
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    function switchTab(tab) {
        // Update buttons
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update content
        if (tab === 'chirp3') {
            chirp3Tab.classList.add('active');
            geminiTab.classList.remove('active');
            currentEngine = 'chirp3';
        } else {
            chirp3Tab.classList.remove('active');
            geminiTab.classList.add('active');
            currentEngine = 'gemini-tts';
        }
        
        // Save current engine
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        storageAPI.storage.sync.set({ ttsEngine: currentEngine });
    }
    
    // Populate Gemini voices
    function populateGeminiVoices() {
        geminiVoiceSelect.innerHTML = '';
        
        // Add female voices
        const femaleGroup = document.createElement('optgroup');
        femaleGroup.label = 'Female Voices';
        geminiVoices.female.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice;
            option.textContent = voice;
            femaleGroup.appendChild(option);
        });
        geminiVoiceSelect.appendChild(femaleGroup);
        
        // Add male voices
        const maleGroup = document.createElement('optgroup');
        maleGroup.label = 'Male Voices';
        geminiVoices.male.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice;
            option.textContent = voice;
            maleGroup.appendChild(option);
        });
        geminiVoiceSelect.appendChild(maleGroup);
    }
    
    // Model selection
    modelOptions.forEach(option => {
        option.addEventListener('click', function() {
            modelOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedGeminiModel = this.getAttribute('data-model');
        });
    });
    
    // Save API key
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }
        
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        storageAPI.storage.sync.set({googleApiKey: apiKey}).then(() => {
            return storageAPI.storage.sync.get(['googleApiKey']);
        }).then((result) => {
            if (result.googleApiKey) {
                showStatus('API key saved successfully!', 'success');
                apiKeyInput.value = '*'.repeat(Math.min(apiKey.length, 20));
            } else {
                showStatus('Warning: API key may not have saved properly', 'error');
            }
        }).catch((syncError) => {
            return storageAPI.storage.local.set({googleApiKey: apiKey}).then(() => {
                showStatus('API key saved successfully! (local storage)', 'success');
                apiKeyInput.value = '*'.repeat(Math.min(apiKey.length, 20));
            }).catch((localError) => {
                showStatus('Error saving API key: ' + localError.message, 'error');
            });
        });
    });
    
    // Save Chirp3 settings
    saveChirp3Settings.addEventListener('click', function() {
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        const settings = {
            chirp3Voice: chirp3VoiceSelect.value,
            chirp3Speed: parseFloat(chirp3SpeedSlider.value),
            chirp3SampleRate: parseInt(chirp3SampleRateSelect.value, 10)
        };
        
        storageAPI.storage.sync.set(settings, () => {
            showStatus('Chirp 3 settings saved!', 'success');
        });
    });
    
    // Save Gemini settings
    saveGeminiSettings.addEventListener('click', function() {
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        const settings = {
            geminiModel: selectedGeminiModel,
            geminiVoice: geminiVoiceSelect.value,
            geminiPrompt: geminiPrompt.value,
            geminiSpeed: parseFloat(geminiSpeedSlider.value)
        };
        
        storageAPI.storage.sync.set(settings, () => {
            showStatus('Gemini-TTS settings saved!', 'success');
        });
    });
    
    // Test Chirp3
    chirp3TestButton.addEventListener('click', function() {
        const testText = chirp3TestText.value.trim();
        
        if (!testText) {
            showStatus('Please enter test text', 'error');
            return;
        }
        
        chirp3TestButton.disabled = true;
        chirp3TestButton.textContent = 'Testing...';
        
        chrome.runtime.sendMessage({
            action: 'readText',
            text: testText,
            engine: 'chirp3',
            voice: chirp3VoiceSelect.value,
            speakingRate: parseFloat(chirp3SpeedSlider.value),
            sampleRateHertz: parseInt(chirp3SampleRateSelect.value, 10)
        }, function(response) {
            chirp3TestButton.disabled = false;
            chirp3TestButton.textContent = 'Test Chirp 3 HD';
            
            if (response.error) {
                showStatus('Test failed: ' + response.error, 'error');
            } else if (response.success) {
                showStatus('Test successful! Audio playing.', 'success');
            }
        });
    });
    
    // Test Gemini
    geminiTestButton.addEventListener('click', function() {
        const testText = geminiTestText.value.trim();
        
        if (!testText) {
            showStatus('Please enter test text', 'error');
            return;
        }
        
        geminiTestButton.disabled = true;
        geminiTestButton.textContent = 'Testing...';
        
        chrome.runtime.sendMessage({
            action: 'readText',
            text: testText,
            engine: 'gemini-tts',
            model: selectedGeminiModel,
            voice: geminiVoiceSelect.value,
            prompt: geminiPrompt.value,
            speakingRate: parseFloat(geminiSpeedSlider.value)
        }, function(response) {
            geminiTestButton.disabled = false;
            geminiTestButton.textContent = 'Test Gemini-TTS';
            
            if (response.error) {
                showStatus('Test failed: ' + response.error, 'error');
            } else if (response.success) {
                showStatus('Test successful! Audio playing.', 'success');
            }
        });
    });
    
    // Update speed value displays
    chirp3SpeedSlider.addEventListener('input', function() {
        chirp3SpeedValue.textContent = `${parseFloat(this.value).toFixed(2)}x`;
    });
    
    geminiSpeedSlider.addEventListener('input', function() {
        geminiSpeedValue.textContent = `${parseFloat(this.value).toFixed(2)}x`;
    });
    
    // Load saved API key
    function loadApiKey() {
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        storageAPI.storage.sync.get(['googleApiKey']).then((result) => {
            if (result.googleApiKey) {
                apiKeyInput.value = '*'.repeat(Math.min(result.googleApiKey.length, 20));
                apiKeyInput.placeholder = 'API key is saved (masked for security)';
            } else {
                return storageAPI.storage.local.get(['googleApiKey']);
            }
        }).then((localResult) => {
            if (localResult && localResult.googleApiKey) {
                apiKeyInput.value = '*'.repeat(Math.min(localResult.googleApiKey.length, 20));
                apiKeyInput.placeholder = 'API key is saved (masked for security)';
            }
        }).catch((error) => {
            console.error('Error loading API key:', error);
        });
    }
    
    // Load saved settings
    function loadSettings() {
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        storageAPI.storage.sync.get([
            'ttsEngine',
            'chirp3Voice', 'chirp3Speed', 'chirp3SampleRate',
            'geminiModel', 'geminiVoice', 'geminiPrompt', 'geminiSpeed'
        ], (result) => {
            // Load engine preference
            if (result.ttsEngine) {
                currentEngine = result.ttsEngine;
                switchTab(currentEngine === 'chirp3' ? 'chirp3' : 'gemini');
            }
            
            // Load Chirp3 settings
            if (result.chirp3Voice) chirp3VoiceSelect.value = result.chirp3Voice;
            if (result.chirp3Speed) {
                chirp3SpeedSlider.value = result.chirp3Speed;
                chirp3SpeedValue.textContent = `${result.chirp3Speed}x`;
            }
            if (result.chirp3SampleRate) chirp3SampleRateSelect.value = result.chirp3SampleRate;
            
            // Load Gemini settings
            if (result.geminiModel) {
                selectedGeminiModel = result.geminiModel;
                modelOptions.forEach(opt => {
                    if (opt.getAttribute('data-model') === result.geminiModel) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });
            }
            if (result.geminiVoice) geminiVoiceSelect.value = result.geminiVoice;
            if (result.geminiPrompt) geminiPrompt.value = result.geminiPrompt;
            if (result.geminiSpeed) {
                geminiSpeedSlider.value = result.geminiSpeed;
                geminiSpeedValue.textContent = `${result.geminiSpeed}x`;
            }
        });
    }
    
    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 5000);
    }
    
    // Handle API key input focus (clear masked value)
    apiKeyInput.addEventListener('focus', function() {
        if (apiKeyInput.value.includes('*')) {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'Enter your Google Cloud API key';
        }
    });
});