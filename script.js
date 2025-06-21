// ✅ public/script.js (Frontend WebRTC logic with toggle)

let pc = null;
let dc = null;
let micStream = null;
let isActive = false;

const button = document.getElementById("voice-toggle");
button.addEventListener("click", () => {
  isActive ? stopSession() : startSession();
});

async function startSession() {
  button.textContent = "Reservo activado";
  button.classList.add("active");
  isActive = true;

  // 1. Fetch ephemeral session token
 const sessionRes = await fetch("https://v0-reservo-live.onrender.com/session");
const data = await sessionRes.json();
const EPHEMERAL_KEY = data.id;  // ← this is the actual token




  // 2. Create RTCPeerConnection
  pc = new RTCPeerConnection();

  // 3. Setup audio player for AI voice
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = e => (audioEl.srcObject = e.streams[0]);

  // 4. Get mic and add to connection
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  micStream.getTracks().forEach(track => pc.addTrack(track, micStream));

  // 5. Setup data channel
  dc = pc.createDataChannel("oai-events");
  dc.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    console.log("📩", msg);
  };

  // 6. Offer SDP
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // 7. Send SDP to OpenAI Realtime endpoint
  const response = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03", {
    method: "POST",
    body: offer.sdp,
    headers: {
      "Authorization": `Bearer ${client_secret.value}`,
      "OpenAI-Beta": "realtime=v1",
      "Content-Type": "application/sdp"
    }
  });

  const answer = {
    type: "answer",
    sdp: await response.text()
  };
  await pc.setRemoteDescription(answer);

  console.log("✅ WebRTC session started");
}

function stopSession() {
  button.textContent = "Habla con Reservo";
  button.classList.remove("active");
  isActive = false;

  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
  if (dc) dc.close();
  if (pc) pc.close();

  dc = null;
  pc = null;

  console.log("🛑 Session stopped");
}
