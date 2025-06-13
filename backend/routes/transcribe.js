// backend/routes/transcribe.js

const express = require('express');
const multer = require('multer');
const upload = multer();
const { transcribeAudio } = require('../services/whisper');

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('🛎 /transcribe request received, bytes:', req.file?.buffer?.length);
    const text = await transcribeAudio(req.file.buffer);
    console.log('🛎 /transcribe success:', text);
    res.json({ text });
  } catch (err) {
    console.error('🛑 /transcribe error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = router;
