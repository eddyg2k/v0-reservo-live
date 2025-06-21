// backend/app.js
require('dotenv').config();

const express   = require('express');
const http      = require('http');
const WebSocket = require('ws');
const path      = require('path');

const app    = express();
const server = http.createServer(app);

// Serve your static front-end
app.use(express.static(path.join(__dirname, '..')));

// Proxy all /realtime WebSocket connections
const wss = new WebSocket.Server({ server, path: '/realtime' });

wss.on('connection', (clientWs) => {
  // 1) Connect to OpenAI Realtime API
  const openaiWs = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', 
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta':   'realtime=v1'
      }
    }
  );

  openaiWs.on('open', () => {
    console.log('✅ Connected to OpenAI Realtime');
    // Kick off a conversation:
    openaiWs.send(JSON.stringify({
      type: 'conversation.create',
      data: {
        instructions: 'Eres un agente demo para restaurantes, casual y práctico.',
        modalities: ['audio']
      }
    }));
  });

  // 2) Forward messages from OpenAI → browser
  openaiWs.on('message', msg => {
    clientWs.send(msg);
  });

  // 3) Forward messages from browser → OpenAI
  clientWs.on('message', msg => {
    // Expect browser to send proper JSON events or raw audio buffers:
    openaiWs.send(msg);
  });

  // 4) Cleanup on close
  clientWs.on('close', () => openaiWs.close());
  openaiWs.on('close',  () => clientWs.close());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Listening on ${PORT}`));
