const express = require('express');
const { Pool } = require('pg');

// Replace these with your PostgreSQL connection details
const pool = new Pool({
  user: 'abhi',
  host: 'localhost',
  database: 'sampledb',
  password: 'abhi@2002',
  port: 5432,
});

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', async (req, res) => {
  const { input1, input2 } = req.body;

  try {
    const result = await pool.query('INSERT INTO sampletable(username, password) VALUES ($1, $2) RETURNING *', [input1, input2]);
    console.log(result.rows[0]);
    res.send('Data successfully stored in PostgreSQL!');
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error storing data in PostgreSQL');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
