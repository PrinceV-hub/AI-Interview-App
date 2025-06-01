const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'https://silver-space-enigma-pjprqq57wwp5h6qgg-3000.app.github.dev',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Parse JSON bodies
app.use(express.json());

// Load trained model
let model;
(async () => {
  try {
    model = await tf.loadLayersModel('file://./model/model.json');
    console.log('Model loaded successfully');
  } catch (err) {
    console.error('Error loading model:', err.message);
  }
})();

// Mock user database
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
    console.error('Login error:', err.message);
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
      // File doesn't exist yet
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    users.push({ email, phone, password });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ user: { email, phone } });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/questions/:domain', async (req, res) => {
  const { domain } = req.params;
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/Ebazhanov/linkedin-skill-assessments-quizzes/main/${domain.toLowerCase()}/${domain.toLowerCase()}-quiz.md`
    );
    const questions = response.data.split('\n').filter(line => line.startsWith('#### Q'));
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json({ question: randomQuestion });
  } catch (err) {
    console.error('Question fetch error:', err.message);
    res.status(500).json({ error: 'Error fetching question' });
  }
});

app.post('/api/evaluate', upload.single('video'), (req, res) => {
  console.log('Received /api/evaluate request');
  if (!req.file) {
    console.log('No video file received');
    return res.status(400).json({ feedback: 'No video data received' });
  }
  console.log('Video file received, size:', req.file.size);

  // Mock evaluation (replace with model-based evaluation if desired)
  res.json({ feedback: 'Good response, but improve clarity.' });

  // Optional: Model-based evaluation
  /*
  if (model) {
    try {
      // Mock features (replace with real video processing)
      const features = tf.tensor2d([Array(25).fill(Math.random())], [1, 25]);
      const prediction = model.predict(features);
      const score = prediction.dataSync()[0];
      const feedback = score > 0.5 ? 'Great response!' : 'Needs improvement.';
      res.json({ feedback });
    } catch (err) {
      console.error('Model evaluation error:', err.message);
      res.json({ feedback: 'Error evaluating with model, using mock response.' });
    }
  } else {
    res.json({ feedback: 'Model not loaded, using mock response.' });
  }
  */
});

app.listen(5000, () => console.log('Server running on port 5000'));