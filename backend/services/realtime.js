// backend/services/realtime.js
const OpenAI = require('openai');
const { OpenAIRealtimeWebSocket } = require('openai/beta/realtime/websocket');

function createSession() {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const session = new OpenAIRealtimeWebSocket({
    model: 'gpt-4o-mini-realtime-preview'
  }, client);

  // helper to send raw audio chunks
  session.sendAudio = (buf) => {
    session.send({
      type: 'input_audio_buffer.append',
      audio: buf.toString('base64')
    });
  };

  // end the session
  session.end = () => session.close();

  return session;
}

module.exports = { createSession };
