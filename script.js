let alexaSessionId = Date.now().toString();
let isListening = false;
let recognition;

// Initialize voice capabilities
function initVoice() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    showUserMessage(transcript);
    const response = await processWithAlexa(transcript);
    speakResponse(response);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    toggleListeningUI(false);
  };
}

// Process input with Alexa
async function processWithAlexa(text) {
  showTypingIndicator();
  
  try {
    const response = await fetch('/api/alexa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: alexaSessionId
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Let's try that again later.", audio: null };
  }
}

// Voice output
function speakResponse(response) {
  if (window.speechSynthesis && response.message) {
    const utterance = new SpeechSynthesisUtterance(response.message);
    utterance.voice = speechSynthesis.getVoices().find(v => v.name === 'Alexa');
    speechSynthesis.speak(utterance);
  }
  showBotMessage(response.message);
}

// Voice input toggle
function toggleVoiceInput() {
  if (!isListening) {
    recognition.start();
    toggleListeningUI(true);
  } else {
    recognition.stop();
    toggleListeningUI(false);
  }
  isListening = !isListening;
}

// UI feedback for listening state
function toggleListeningUI(listening) {
  const micBtn = document.getElementById('voice-btn');
  const inputField = document.getElementById('user-input');
  
  if (listening) {
    micBtn.classList.add('active');
    inputField.placeholder = "Listening...";
  } else {
    micBtn.classList.remove('active');
    inputField.placeholder = "Speak or type your message...";
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  initVoice();
  document.getElementById('voice-btn').addEventListener('click', toggleVoiceInput);
  document.getElementById('send-btn').addEventListener('click', handleTextInput);
});
