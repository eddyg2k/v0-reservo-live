const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/chat', require('./routes/chat'));
app.listen(3000, () => console.log('Backend corriendo en puerto 3000'));
