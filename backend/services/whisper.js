// backend/services/whisper.js
const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const legacyClient = new OpenAIApi(config);

async function transcribeAudio(audioBuffer) {
  // legacy createTranscription handles a Buffer just fine
  const resp = await legacyClient.createTranscription(
    audioBuffer,
    'whisper-1',
    undefined,
    'json'
  );
  return resp.data.text;
}

module.exports = { transcribeAudio };
