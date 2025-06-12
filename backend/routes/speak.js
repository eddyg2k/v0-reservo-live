const express = require('express');
const router = express.Router();
const { synthesizeSpeech } = require('../services/tts');

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const audioContent = await synthesizeSpeech(text);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'TTS failed' });
  }
});

module.exports = router;
