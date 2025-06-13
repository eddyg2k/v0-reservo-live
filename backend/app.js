// backend/app.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const { createSession } = require('./services/realtime');

const app = express();
app.use(express.static(path.join(__dirname, '..')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', ws => {
  const session = createSession();

  // stream audio from client → OpenAI
  ws.on('message', msg => {
    if (Buffer.isBuffer(msg)) session.sendAudio(msg);
  });

  // stream audio from OpenAI → client
  (async () => {
    try {
      for await (const part of session) {
        if (part.audio) ws.send(part.audio);
      }
    } catch (err) {
      console.error('Realtime session error:', err);
      ws.close();
    }
  })();

  ws.on('close', () => session.end());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server listening on port ${PORT}`)
);
