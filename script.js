// script.js

// ← your live Render WebSocket URL here:
const WS_URL = 'wss://v0-reservo-live.onrender.com/ws';

const btn = document.getElementById('voice-toggle');
let ws, recorder, stream;

btn.addEventListener('click', async () => {
  if (!ws) {
    ws = new WebSocket(WS_URL);
    ws.binaryType = 'arraybuffer';
    ws.onmessage = e => {
      const audio = new Audio(
        URL.createObjectURL(new Blob([e.data], { type: 'audio/webm' }))
      );
      audio.play();
    };
    ws.onclose = () => { ws = null; };
  }

  if (!recorder) {
    // start
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => ws.send(e.data);
    recorder.start(250);  // send every 250ms
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');
  } else {
    // stop
    recorder.stop();
    recorder = null;
    stream.getTracks().forEach(t => t.stop());
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');
    // end session
    ws.close();
  }
});
