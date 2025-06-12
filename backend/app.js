require('dotenv').config();
const express = require('express');
const cors = require('cors');
const transcribeRouter = require('./routes/transcribe');
const chatRouter = require('./routes/chat');
const speakRouter = require('./routes/speak');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/transcribe', transcribeRouter);
app.use('/chat', chatRouter);
app.use('/speak', speakRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
