const WS_URL = `wss://${window.location.host}/realtime`;
const btn = document.getElementById('voice-toggle');

let ws = null;
let mediaRecorder = null;
let micStream = null;
let isRecording = false;

btn.addEventListener('click', () => {
  isRecording ? stopVoice() : startVoice();
});

async function startVoice() {
  try {
    // Update UI
    isRecording = true;
    btn.textContent = 'Reservo activado';
    btn.classList.add('active');

    // Open WebSocket if not already
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = new WebSocket(WS_URL);
      ws.binaryType = 'arraybuffer';
      ws.onmessage = handleWSMessage;
      ws.onclose = () => { ws = null };
      await new Promise(resolve => ws.addEventListener('open', resolve));
    }

    // Ask for mic permission and open stream
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(micStream);

    // Send audio chunks
    mediaRecorder.ondataavailable = e => {
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
    };

    mediaRecorder.start(250);
    console.log('🎙️ Mic started');

  } catch (err) {
    console.error('🚫 Error starting voice:', err);
    stopVoice(); // fail safe
  }
}

function stopVoice() {
  if (!isRecording) return;

  isRecording = false;
  btn.textContent = 'Habla con Reservo';
  btn.classList.remove('active');

  // Stop recorder and mic
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder = null;
  }

  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }

  // Send commit & response request
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    ws.send(JSON.stringify({ type: 'response.create' }));
  }

  console.log('🎤 Mic stopped');
}

function handleWSMessage(event) {
  try {
    const data = JSON.parse(event.data);
    console.log('🧠 Event:', data);
  } catch {
    // Play audio
    const blob = new Blob([event.data], { type: 'audio/webm' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  }
}
