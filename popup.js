// Popup script for managing API key and testing
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const testButton = document.getElementById('testButton');
    const testTextInput = document.getElementById('testText');
    const statusDiv = document.getElementById('status');
    const voiceSelect = document.getElementById('voiceSelect');
    const speedSlider = document.getElementById('speedSlider');
    const speedValueSpan = document.getElementById('speedValue');
    const saveSettingsButton = document.getElementById('saveSettingsButton');

    // Load existing API key and settings
    loadApiKey();
    loadSettings();

    // Save API key
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }
        
        // Save to storage with Firefox compatibility
        console.log('Attempting to save API key:', apiKey ? 'API key provided' : 'No API key');
        
        // Use browser API if available (Firefox), otherwise chrome API
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        // Try sync storage first
        storageAPI.storage.sync.set({googleApiKey: apiKey}).then(() => {
            console.log('API key saved to sync storage successfully');
            // Verify the save by reading it back
            return storageAPI.storage.sync.get(['googleApiKey']);
        }).then((result) => {
            console.log('Verification read result:', result);
            if (result.googleApiKey) {
                showStatus('API key saved successfully!', 'success');
                // Mask the input for security
                apiKeyInput.value = '*'.repeat(Math.min(apiKey.length, 20));
            } else {
                showStatus('Warning: API key may not have saved properly', 'error');
            }
        }).catch((syncError) => {
            console.error('Sync storage error:', syncError);
            // Fallback to local storage
            return storageAPI.storage.local.set({googleApiKey: apiKey}).then(() => {
                console.log('API key saved to local storage successfully');
                showStatus('API key saved successfully! (local storage)', 'success');
                // Mask the input for security
                apiKeyInput.value = '*'.repeat(Math.min(apiKey.length, 20));
            }).catch((localError) => {
                console.error('Local storage error:', localError);
                showStatus('Error saving API key: ' + localError.message, 'error');
            });
        });
    });
    
    // Test text-to-speech
    testButton.addEventListener('click', function() {
        const testText = testTextInput.value.trim();
        
        if (!testText) {
            showStatus('Please enter test text', 'error');
            return;
        }
        
        testButton.disabled = true;
        testButton.textContent = 'Testing...';
        
        const selectedVoice = voiceSelect.value;
        const speechSpeed = parseFloat(speedSlider.value);

        // Send test message to background script
        chrome.runtime.sendMessage({
            action: 'readText',
            text: testText,
            voice: selectedVoice,
            speakingRate: speechSpeed
        }, function(response) {
            testButton.disabled = false;
            testButton.textContent = 'Test Speech';
            
            if (response.error) {
                showStatus('Test failed: ' + response.error, 'error');
            } else if (response.success) {
                showStatus('Test successful! Audio should be playing.', 'success');
            } else {
                showStatus('Unexpected response from background script', 'error');
            }
        });
    });
    
    // Load saved API key
    function loadApiKey() {
        // Use browser API if available (Firefox), otherwise chrome API
        const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
        
        storageAPI.storage.sync.get(['googleApiKey']).then((result) => {
            if (result.googleApiKey) {
                // Show masked version for security
                apiKeyInput.value = '*'.repeat(Math.min(result.googleApiKey.length, 20));
                apiKeyInput.placeholder = 'API key is saved (masked for security)';
            } else {
                // Try local storage as fallback
                return storageAPI.storage.local.get(['googleApiKey']);
            }
        }).then((localResult) => {
            if (localResult && localResult.googleApiKey) {
                // Show masked version for security
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
        
        storageAPI.storage.sync.get(['selectedVoice', 'speechSpeed'], (result) => {
            if (result.selectedVoice) {
                voiceSelect.value = result.selectedVoice;
            } else {
                // Set default if not found
                voiceSelect.value = 'en-US-Chirp3-HD-Charon';
            }

            if (result.speechSpeed) {
                speedSlider.value = result.speechSpeed;
                speedValueSpan.textContent = `${result.speechSpeed}x`;
            } else {
                // Set default if not found
                speedSlider.value = 1.0;
                speedValueSpan.textContent = '1.0x';
            }
        });
    }

    // Save settings
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', function() {
            const storageAPI = typeof browser !== 'undefined' ? browser : chrome;

            const selectedVoice = voiceSelect.value;
            const speechSpeed = parseFloat(speedSlider.value);

            storageAPI.storage.sync.set({ selectedVoice: selectedVoice, speechSpeed: speechSpeed }, () => {
                showStatus('Settings saved successfully!', 'success');
                // Update the displayed speed value if it changed
                speedValueSpan.textContent = `${speechSpeed}x`;
            });
        });
    }

    // Update speed value display as slider changes
    if (speedSlider && speedValueSpan) {
        speedSlider.addEventListener('input', function() {
            speedValueSpan.textContent = `${parseFloat(this.value).toFixed(2)}x`;
        });
    }
    
    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
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