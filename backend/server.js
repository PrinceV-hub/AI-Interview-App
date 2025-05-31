const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const app = express();

app.use(cors());
app.use(express.json());

// Mock user database (stored in users.json)
const USERS_FILE = './users.json';

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usersData = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      res.json({ user: { email: user.email, phone: user.phone } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    let users = [];
    try {
      const usersData = await fs.readFile(USERS_FILE, 'utf8');
      users = JSON.parse(usersData);
    } catch (err) {
      // File doesn't exist yet, start with empty array
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    users.push({ email, phone, password });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ user: { email, phone } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/questions/:domain', async (req, res) => {
  const { domain } = req.params;
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/Ebazhanov/linkedin-skill-assessments-quizzes/main/${domain.toLowerCase()}/${domain.toLowerCase()}-quiz.md`
    );
    const questions = response.data.split('\n').filter((line) => line.startsWith('#### Q'));
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json({ question: randomQuestion });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching question' });
  }
});

app.post('/api/evaluate', (req, res) => {
  // Mock evaluation (replace with TensorFlow.js model inference)
  res.json({ feedback: 'Good response, but improve clarity.' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
