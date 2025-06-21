const WS_URL = `wss://${window.location.host}/realtime`;
const btn = document.getElementById('voice-toggle');

let ws = null;
let mediaRecorder = null;
let micStream = null;
let isRecording = false;

btn.addEventListener('click', async () => {
  if (!isRecording) {
    // ─── START MIC ──────────────────────────────
    isRecording = true;
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');

    // 1. Open WebSocket if not open
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = new WebSocket(WS_URL);
      ws.binaryType = 'arraybuffer';
      ws.onmessage = handleWSMessage;
      ws.onclose = () => { ws = null };
      await new Promise(res => ws.addEventListener('open', res));
    }

    // 2. Open mic
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(micStream);

    mediaRecorder.addEventListener('dataavailable', e => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            data: { audio_content: base64 }
          }));
        };
        reader.readAsDataURL(e.data);
      }
    });

    mediaRecorder.start(250);

  } else {
    // ─── STOP MIC ───────────────────────────────
    isRecording = false;
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }

    // Null mediaRecorder after stop event
    mediaRecorder.addEventListener('stop', () => {
      mediaRecorder = null;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        ws.send(JSON.stringify({ type: 'response.create' }));
      }
    }, { once: true });
  }
});

function handleWSMessage(e) {
  try {
    const data = JSON.parse(e.data);
    console.log('🧠 Realtime Event:', data);
  } catch {
    const blob = new Blob([e.data], { type: 'audio/webm' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  }
}
