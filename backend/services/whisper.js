// backend/services/whisper.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioBuffer) {
  // v4 audio transcription
  const resp = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: 'whisper-1',
    response_format: 'text'   // returns plain text
  });
  return resp.text;
}

module.exports = { transcribeAudio };
