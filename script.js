// script.js

// ← your live backend URL here
const BACKEND_URL = 'https://v0-reservo-live.onrender.com';

const btn = document.getElementById('voice-toggle');
let active = false;
let mediaRecorder;
let audioChunks = [];
let streamGlobal;  // so we can stop tracks later

btn.addEventListener('click', toggleVoice);

async function toggleVoice() {
  if (!active) {
    // ---------- START RECORDING ----------
    active = true;
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');

    // grab mic
    audioChunks = [];
    streamGlobal = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(streamGlobal);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.start();

  } else {
    // ---------- STOP RECORDING & PROCESS ----------
    active = false;
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');

    // stop recording
    mediaRecorder.stop();
    // release mic
    streamGlobal.getTracks().forEach(t => t.stop());

    // when recorder stops, handle the audio
    mediaRecorder.onstop = async () => {
      try {
        // 1) Transcribe
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('file', blob, 'audio.webm');
        const transRes = await fetch(`${BACKEND_URL}/transcribe`, {
          method: 'POST',
          body: fd
        });
        const { text } = await transRes.json();

        // 2) Chat
        const chatRes = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const { reply } = await chatRes.json();

        // 3) Speak via Web Speech API
        await speakText(reply);
      } catch (err) {
        console.error('Voicebot error:', err);
      }
    };
  }
}

function speakText(text) {
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-MX';
    // pick a female Spanish (MX) voice if available
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'es-MX');
    if (voices.length) utter.voice = voices[0];
    utter.onend = resolve;
    window.speechSynthesis.speak(utter);
  });
}

// preload voices
window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};
