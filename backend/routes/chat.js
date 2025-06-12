const express = require('express');
const router = express.Router();
const { generateReply } = require('../services/openai');

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await generateReply(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat generation failed' });
  }
});

module.exports = router;
