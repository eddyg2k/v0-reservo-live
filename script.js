// script.js

// ← UPDATE this to your real backend URL!
const BACKEND_URL = 'https://v0-reservo-live.onrender.com';

const btn = document.getElementById('voice-toggle');
let active = false;
let mediaRecorder;
let audioChunks = [];
let streamGlobal;

btn.addEventListener('click', toggleVoice);

async function toggleVoice() {
  if (!active) {
    console.log('▶️ Starting recording');
    active = true;
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');

    audioChunks = [];
    try {
      streamGlobal = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(streamGlobal);
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.start();
      console.log('🟢 MediaRecorder started');
    } catch (err) {
      console.error('❌ getUserMedia error:', err);
    }

  } else {
    console.log('⏹️ Stopping recording');
    active = false;
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');

    mediaRecorder.stop();
    streamGlobal.getTracks().forEach(t => t.stop());

    mediaRecorder.onstop = async () => {
      console.log('🔴 Recording stopped, chunks:', audioChunks.length);
      try {
        // 1) Transcribe
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('file', blob, 'audio.webm');
        console.log('📤 Sending to /transcribe');
        const transRes = await fetch(`${BACKEND_URL}/transcribe`, {
          method: 'POST',
          body: fd
        });
        const { text } = await transRes.json();
        console.log('📝 Transcribed text:', text);

        // 2) Chat
        console.log('📤 Sending to /chat');
        const chatRes = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const { reply } = await chatRes.json();
        console.log('💬 GPT reply:', reply);

        // 3) Speak
        console.log('🔊 Speaking reply');
        await speakText(reply);
        console.log('✅ Done speaking');

      } catch (err) {
        console.error('❗ Voicebot flow error:', err);
      }
    };
  }
}

function speakText(text) {
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-MX';
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang === 'es-MX');
    if (voices.length) utter.voice = voices[0];
    utter.onend = () => {
      console.log('🔈 SpeechSynthesis ended');
      resolve();
    };
    window.speechSynthesis.speak(utter);
  });
}

// Preload voices
window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
  console.log('🔄 Voices loaded:', window.speechSynthesis.getVoices().map(v=>v.name));
};
