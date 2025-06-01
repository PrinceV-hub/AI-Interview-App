const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const multer = require('multer');
const natural = require('natural');

const app = express();

app.use(cors({
  origin: 'https://silver-space-enigma-pjprqq57wwp5h6qgg-3000.app.github.dev',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());

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
    } catch (err) {}
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
    const data = response.data;
    const lines = data.split('\n');
    const questions = [];
    let currentQuestion = null;

    for (const line of lines) {
      if (line.startsWith('#### Q')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = { text: line.replace('#### Q', '').trim(), answer: '' };
      } else if (line.startsWith('**Correct Answer:**') && currentQuestion) {
        currentQuestion.answer = line.replace('**Correct Answer:**', '').trim();
      }
    }
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json({ question: randomQuestion.text, correctAnswer: randomQuestion.answer });
  } catch (err) {
    console.error('Question fetch error:', err.message);
    res.status(500).json({ error: 'Error fetching question' });
  }
});

app.post('/api/evaluate', upload.single('video'), async (req, res) => {
  console.log('Received /api/evaluate request');
  if (!req.file) {
    console.log('No video file received');
    return res.status(400).json({ normalFeedback: 'No video data received', enhancedFeedback: '' });
  }
  console.log('Video file received, size:', req.file.size);

  try {
    const userAnswer = req.body.transcription || 'No transcription provided';
    const question = req.body.question || 'What is a closure in JavaScript?';
    const correctAnswer = req.body.correctAnswer || 'A closure is a function that retains access to its lexical scope.';

    // Compute cosine similarity using TF-IDF
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(userAnswer.toLowerCase());
    tfidf.addDocument(correctAnswer.toLowerCase());

    let similarityScore = 0;
    tfidf.tfidfs(userAnswer.toLowerCase(), (i, measure) => {
      if (i === 0) { // User answer
        const userVector = measure;
        tfidf.tfidfs(correctAnswer.toLowerCase(), (j, measureCorrect) => {
          if (j === 1) { // Correct answer
            const correctVector = measureCorrect;
            const dotProduct = userVector.reduce((sum, val, idx) => sum + val * (correctVector[idx] || 0), 0);
            const magnitudeUser = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
            const magnitudeCorrect = Math.sqrt(correctVector.reduce((sum, val) => sum + val * val, 0));
            similarityScore = magnitudeUser && magnitudeCorrect ? (dotProduct / (magnitudeUser * magnitudeCorrect)) * 100 : 0;
          }
        });
      }
    });

    const normalFeedback = similarityScore > 70
      ? `Good job! Your answer is relevant (Score: ${similarityScore.toFixed(1)}%).`
      : `Needs work. Your answer lacks key details (Score: ${similarityScore.toFixed(1)}%).`;

    const enhancedFeedback = similarityScore > 70
      ? `Your response was solid, covering key aspects of "${question}". To improve, consider adding examples, e.g., "A closure can be created using a function inside another function, like a counter."`
      : `Your response missed important points about "${question}". A better answer would be: "${correctAnswer}". Try explaining with an example, e.g., a function returning another function that accesses outer variables.`;

    res.json({
      normalFeedback,
      enhancedFeedback,
      similarityScore: similarityScore.toFixed(1),
      transcription: userAnswer
    });
  } catch (err) {
    console.error('Evaluation error:', err.message);
    res.status(500).json({ normalFeedback: 'Error evaluating response', enhancedFeedback: '', transcription: `Error processing: ${err.message}` });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));