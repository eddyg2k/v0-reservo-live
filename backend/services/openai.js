const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

async function generateReply(userMessage) {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Eres un agente de demo para restaurantes. Casual, informativo, con voz femenina.'
      },
      { role: 'user', content: userMessage }
    ]
  });
  return response.data.choices[0].message.content;
}

module.exports = { generateReply };
