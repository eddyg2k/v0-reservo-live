// script.js

const WS_URL = `wss://${window.location.host}/realtime`;
const btn = document.getElementById('voice-toggle');

let ws = null;
let mediaRecorder = null;
let micStream = null;

btn.addEventListener('click', toggleVoice);

async function toggleVoice() {
  if (!mediaRecorder) {
    // ─── START RECORDING ──────────────────────────────────────────
    // 1) Open WS if needed
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = new WebSocket(WS_URL);
      ws.binaryType = 'arraybuffer';
      ws.onmessage = handleWSMessage;
      ws.onclose = () => { ws = null };
      await new Promise(res => ws.addEventListener('open', res));
    }

    // 2) Grab mic
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(micStream);
    mediaRecorder.addEventListener('dataavailable', e => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(e.data);
      }
    });
    mediaRecorder.start(200);

    // 3) Toggle UI
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');

  } else {
    // ─── STOP RECORDING ───────────────────────────────────────────
    // 1) Stop recorder (will fire a “stop” event)
    mediaRecorder.stop();

    // 2) When stop event fires, close mic and send commit/create
    mediaRecorder.addEventListener('stop', () => {
      // a) Stop all mic tracks
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
      mediaRecorder = null;

      // b) Signal end-of-speech & request response
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        ws.send(JSON.stringify({ type: 'response.create' }));
      }
    }, { once: true });

    // 3) Toggle UI back
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');
  }
}

function handleWSMessage(event) {
  // Try parse JSON → if that fails, assume binary audio
  try {
    const msg = JSON.parse(event.data);
    console.log('▶️ Realtime event:', msg);
  } catch {
    // Binary audio chunk → play it
    const blob = new Blob([event.data], { type: 'audio/webm' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  }
}
