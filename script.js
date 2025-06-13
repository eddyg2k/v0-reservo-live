const BACKEND_URL = 'https://v0-reservo-live.onrender.com';
const btn = document.getElementById('voice-toggle');
let active = false;
let mediaRecorder;
let audioChunks = [];

btn.addEventListener('click', toggleVoice);

async function toggleVoice() {
  if (!active) {
    // Activate recording
    active = true;
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');
    await startRecording();
  } else {
    // Stop recording and process
    active = false;
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');
    await stopRecordingAndProcess();
  }
}

async function startRecording() {
  audioChunks = [];
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();
}

async function stopRecordingAndProcess() {
  return new Promise(resolve => {
    mediaRecorder.onstop = async () => {
      try {
        // 1) Transcribe audio → text
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('file', blob, 'audio.webm');

        const transRes = await fetch(`${BACKEND_URL}/transcribe`, {
          method: 'POST',
          body: fd
        });
        const { text } = await transRes.json();

        // 2) Chat with GPT → reply text
        const chatRes = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const { reply } = await chatRes.json();

        // 3) Speak reply via Web Speech API
        await speakText(reply);
      } catch (err) {
        console.error('Error in voicebot flow:', err);
      } finally {
        resolve();
      }
    };
    mediaRecorder.stop();
  });
}

function speakText(text) {
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-MX';
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'es-MX');
    if (voices.length) {
      utter.voice = voices[0];
    }
    utter.onend = resolve;
    window.speechSynthesis.speak(utter);
  });
}

// Pre-load voices for reliability
window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};
