// script.js

const WS_URL = `wss://${window.location.host}/realtime`;
const btn    = document.getElementById('voice-toggle');
let ws, recorder, stream;

btn.addEventListener('click', async () => {
  if (!ws) {
    ws = new WebSocket(WS_URL);
    ws.binaryType = 'arraybuffer';

    ws.onmessage = e => {
      // Server may send JSON or binary audio:
      try {
        const evt = JSON.parse(e.data);
        console.log('Event:', evt);
        // handle text transcripts or control events if needed
      } catch {
        // assume binary audio chunk
        const audio = new Audio(
          URL.createObjectURL(new Blob([e.data], {type: 'audio/webm'}))
        );
        audio.play();
      }
    };

    ws.onopen = () => console.log('🔌 WS connected');
    ws.onclose = () => { ws = null; };
  }

  if (!recorder) {
    // Start sending audio every 250ms
    stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
      // Wrap your audio in the proper JSON event:
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          data: { audio_content: base64 }
        }));
      };
      reader.readAsDataURL(e.data);
    };
    recorder.start(250);
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');
  } else {
    // Tell OpenAI we’re done speaking:
    ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    ws.send(JSON.stringify({ type: 'response.create' }));

    recorder.stop();
    recorder = null;
    stream.getTracks().forEach(t => t.stop());
    btn.textContent = 'Habla con Reservo';
    btn.classList.remove('active');
  }
});
