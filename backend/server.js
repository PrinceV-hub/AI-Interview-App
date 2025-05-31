const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    res.redirect(`http://localhost:3000?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

app.post('/api/login', (req, res) => {
  const { email, phone, password } = req.body;
  // Mock authentication (replace with real database check)
  if (email === 'test@example.com' && password === 'password') {
    res.json({ user: { email, phone } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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
