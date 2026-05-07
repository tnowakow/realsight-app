const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/portfolios', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM portfolios');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM properties WHERE portfolio_id = $1', [req.query.portfolio_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/', (req, res) => {
  res.send('RealSight Backend is running!');
});

app.listen(port, () => {
  console.log(`RealSight Backend listening on port ${port}`);
});
