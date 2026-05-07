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

app.get('/api/tenants', async (req, res) => {
  try {
    const { property_id } = req.query;
    if (!property_id) {
      return res.status(400).send('property_id query parameter is required');
    }
    const { rows } = await pool.query('SELECT * FROM tenants WHERE property_id = $1', [property_id]);
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
