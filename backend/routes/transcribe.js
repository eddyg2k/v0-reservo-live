const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { transcribeAudio } = require('../services/whisper');

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const text = await transcribeAudio(req.file.buffer);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = router;
