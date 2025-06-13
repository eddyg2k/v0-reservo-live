// backend/services/openai.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReply(userMessage) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Eres un agente demo para restaurantes. Casual, informativo, con voz femenina.'
      },
      { role: 'user', content: userMessage }
    ]
  });
  return response.choices[0].message.content;
}

module.exports = { generateReply };
