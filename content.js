// Content script for text selection and keyboard handling
(function() {
    'use strict';
    
    let selectedText = '';
    
    // Listen for text selection
    document.addEventListener('mouseup', function(e) {
        const selection = window.getSelection();
        if (selection.toString().trim()) {
            selectedText = selection.toString().trim();
        }
    });
    
    // Listen for keyboard events
    document.addEventListener('keydown', function(e) {
        // Check for Shift + X
        if (e.shiftKey && e.key.toLowerCase() === 'x') {
            e.preventDefault();
            
            // Get current selection if no stored selection
            const currentSelection = window.getSelection().toString().trim();
            const textToRead = currentSelection || selectedText;
            
            if (textToRead) {
                console.log('Text to read:', textToRead);
                console.log('Text length:', textToRead.length, 'characters');
                
                // Get settings from storage before sending the message
                const storageAPI = typeof browser !== 'undefined' ? browser : chrome;
                storageAPI.storage.sync.get([
                    'ttsEngine',
                    'chirp3Voice', 'chirp3Speed', 'chirp3SampleRate',
                    'geminiModel', 'geminiVoice', 'geminiPrompt', 'geminiSpeed'
                ], (settings) => {
                    const engine = settings.ttsEngine || 'chirp3';
                    
                    console.log('Using TTS engine:', engine);
                    
                    // Build message based on engine
                    const message = {
                        action: 'readText',
                        text: textToRead,
                        engine: engine
                    };
                    
                    if (engine === 'gemini-tts') {
                        message.model = settings.geminiModel || 'gemini-2.5-flash-tts';
                        message.voice = settings.geminiVoice || 'Kore';
                        message.prompt = settings.geminiPrompt || '';
                        message.speakingRate = settings.geminiSpeed || 1.0;
                    } else {
                        message.voice = settings.chirp3Voice || 'en-GB-Chirp3-HD-Charon';
                        message.speakingRate = settings.chirp3Speed || 1.0;
                        message.sampleRateHertz = settings.chirp3SampleRate || 24000;
                    }
                    
                    console.log('Sending message to background script...');
                    
                    // Send message to background script
                    chrome.runtime.sendMessage(message, function(response) {
                        if (response && response.error) {
                            console.error('TTS Error:', response.error);
                            showNotification('Error: ' + response.error, 'error');
                        } else if (response && response.success) {
                            console.log('TTS processing started successfully');
                            showNotification('Reading text...', 'success');
                        } else {
                            console.warn('Unexpected response from background script:', response);
                        }
                    });
                });
            } else {
                showNotification('No text selected', 'warning');
            }
        }
    });
    
    // Simple notification function
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existingNotif = document.getElementById('tts-notification');
        if (existingNotif) {
            existingNotif.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'tts-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: opacity 0.3s ease;
        `;
        
        // Set colors based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ff9800';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
})();