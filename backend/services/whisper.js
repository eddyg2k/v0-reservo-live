const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

async function transcribeAudio(audioBuffer) {
  const resp = await openai.createTranscription(
    audioBuffer,
    'whisper-1',
    undefined,
    'json'
  );
  return resp.data.text;
}

module.exports = { transcribeAudio };
