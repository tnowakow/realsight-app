const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('RealSight Backend is running!');
});

app.listen(port, () => {
  console.log(`RealSight Backend listening on port ${port}`);
});
