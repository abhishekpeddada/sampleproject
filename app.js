const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const session = require('express-session');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'abhishek1213', resave: true, saveUninitialized: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

app.get('/user', (req, res) => {
    res.sendFile(__dirname + '/userlogin.html');
});

app.post('/submit', async (req, res) => {
  const { input1, input2 } = req.body;

  try {
    const result = await pool.query('INSERT INTO sampletable(username, password) VALUES ($1, $2) RETURNING *', [input1, input2]);
    console.log(result.rows[0]);
    res.sendFile(__dirname + '/usersuccess.html');
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error storing data in PostgreSQL');
  }
});

app.post('/add', async (req, res) => {
  const { medicine, symptoms } = req.body;

  try {
    const result = await pool.query('INSERT INTO health_data(medicine, symptoms) VALUES ($1, $2) RETURNING *', [medicine, symptoms]);
    console.log(result.rows[0]);
    res.send('Data successfully stored in PostgreSQL!');
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error storing data in PostgreSQL');
  }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM sampletable WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            req.session.user = { username };

            res.redirect('/dashboard');
        } else {
            res.send('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
	res.sendFile(__dirname + '/dashboard.html');
    } else {
        res.redirect('/');
    }
});

app.post('/userlogin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM sampletable WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            req.session.user = { username };

            res.redirect('/userdashboard');
        } else {
            res.send('Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/userdashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/userdashboard.html');
    } else {
        res.redirect('/');
    }
});

app.get('/retrieve', async (req, res) => {
  const { symptom } = req.query;

  try {
    const result = await pool.query('SELECT * FROM health_data WHERE symptoms = $1', [symptom]);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Retrieve Data</title>
      </head>
      <body>
          <h2>Data for Symptom: ${symptom}</h2>
          <ul>
              ${result.rows.map(row => `<li>${row.medicine}</li>`).join('')}
          </ul>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error retrieving data from PostgreSQL');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
