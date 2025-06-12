// Replace with your actual backend URL once deployed (e.g. https://reservobot.onrender.com)
const BACKEND_URL = 'https://your-backend-url.com';

const btn = document.getElementById('voice-toggle');
let active = false;
let mediaRecorder;
let audioChunks = [];

btn.addEventListener('click', toggleVoice);

async function toggleVoice() {
  if (!active) {
    // Activate
    active = true;
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');
    await startRecording();
  } else {
    // Deactivate
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

      // 3) Text-to-Speech
      const ttsRes = await fetch(`${BACKEND_URL}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply })
      });
      const ttsBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(ttsBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      resolve();
    };
    mediaRecorder.stop();
  });
}
