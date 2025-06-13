// backend/services/openai.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReply(userMessage) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Eres un agente demo para restaurantes. Casual, informativo, con voz femenina.'
      },
      { role: 'user', content: userMessage }
    ]
  });
  // v4 returns an array under `choices`
  return response.choices[0].message.content;
}

module.exports = { generateReply };
