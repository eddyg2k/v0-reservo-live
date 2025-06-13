// backend/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const transcribeRouter = require('./routes/transcribe');
const chatRouter       = require('./routes/chat');
const speakRouter      = require('./routes/speak');

const app = express();

// ─── 1) CORS ───────────────────────────────────────────────────────────────
// Allow your front-end origin to call these APIs
app.use(cors({
  origin: 'https://www.reservo.live',  // your Vercel URL
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors());  // preflight

// ─── 2) JSON parsing ────────────────────────────────────────────────────────
app.use(express.json());

// ─── 3) Routes ───────────────────────────────────────────────────────────────
app.use('/transcribe', transcribeRouter);
app.use('/chat',       chatRouter);
app.use('/speak',      speakRouter);

// ─── 4) Start server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on port ${PORT}`);
});
