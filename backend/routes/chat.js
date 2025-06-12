const express = require('express');
const router = express.Router();
router.post('/', async (req, res) => {
    const { message } = req.body;
    res.json({ reply: `Echo: ${message}` });
});
module.exports = router;
