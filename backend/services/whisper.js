// backend/services/whisper.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioBuffer) {
  // 1) Write buffer to a temp file
  const tmpPath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
  await fs.promises.writeFile(tmpPath, audioBuffer);

  // 2) Stream that file into Whisper
  const stream = fs.createReadStream(tmpPath);
  const resp = await openai.audio.transcriptions.create({
    file: stream,
    model: 'whisper-1'
  });

  // 3) (Optional) Clean up temp file
  fs.unlink(tmpPath, () => {});

  return resp.text;
}

module.exports = { transcribeAudio };
