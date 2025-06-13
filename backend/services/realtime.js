// backend/services/realtime.js
const { Realtime } = require('openai');
const openai = new Realtime({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
  // kicks off a new realtime audio session
  createSession() {
    return openai.chat.completions.create({
      model: 'gpt-4o-mini-realtime-preview',
      modalities: ['audio'],
    });
  }
};
