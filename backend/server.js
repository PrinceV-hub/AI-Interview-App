const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const multer = require('multer');
const nlp = require('compromise');
const whisper = require('whisper');
const ffmpeg = require('fluent-ffmpeg');
const { createWriteStream, unlink } = require('fs');

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
    const usersData = await fs.readFile(fsUSERS_FILE, 'utf8');
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
      const usersData = await fs.readFile(fsUSERS_FILE, 'utf8');
      users = JSON.parse(usersData);
    } catch (err) {}
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    users.push({ email, phone, password });
    await fs.writeFile(fsUSERS_FILE, JSON.stringify(users, null, 2'));
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
    // Save video temporarily
    const videoPath = `./temp_video_${Date.now()}.webm`;
    const audioPath = `./temp_audio_${Date.now()}.wav`;
    console.log('Saving video to:', videoPath);
    await fs.writeFile(videoPath, req.file.buffer);

    // Extract audio using ffmpeg
    console.log('Extracting audio to:', audioPath);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .output(audioPath)
        .on('end', () => {
          console.log('Audio extraction complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          reject(err);
        })
        .run();
    });

    // Transcribe audio with Whisper
    console.log('Starting Whisper transcription');
    const transcription = await whisper(audioPath, { model: 'tiny', language: 'en' });
    console.log('Whisper transcription result:', transcription);
    const userAnswer = Array.isArray(transcription)
      ? transcription.map(t => t.text).join(' ').trim()
      : transcription.text || 'No transcription available';
    console.log('User answer:', userAnswer);

    // Clean up temporary files
    await Promise.all([
      unlink(videoPath).catch(err => console.error('Error deleting video:', err.message)),
      unlink(audioPath).catch(err => console.error('Error deleting audio:', err.message))
    ]);

    const question = req.body.question || 'What is a closure in JavaScript?';
    const correctAnswer = req.body.correctAnswer || 'A closure is a function that retains access to its lexical scope.';

    // NLP analysis
    const docUser = nlp(userAnswer);
    const docCorrect = nlp(correctAnswer);
    const termsUser = docUser.terms().out('array');
    const termsCorrect = docCorrect.terms().out('array');
    const commonTerms = termsUser.filter(term => termsCorrect.includes(term));
    const similarityScore = (commonTerms.length / Math.max(termsCorrect.length, 1)) * 100;

    const normalFeedback = similarityScore > 70
      ? `Good job! Your answer is relevant (Score: ${similarityScore.toFixed(1)}%).`
      : `Needs work. Your answer lacks key details (Score: ${similarityScore.toFixed(1)}%).`;

    const enhancedFeedback = similarityScore > 70
      ? `Your response was solid, covering key aspects of ${question}. To improve, consider adding examples, e.g., "A closure can be created using a function inside another function, like a counter."`
      : `Your response missed important points about ${question}. A better answer would be: "${correctAnswer}". Try explaining with an example, e.g., a function returning another function that accesses outer variables.`;

    res.json({
      normalFeedback,
      enhancedFeedback,
      similarityScore: similarityScore.toFixed(1),
      transcription: userAnswer
    });
  } catch (err) {
    console.error('Evaluation error:', err.message);
    res.status(500).json({ normalFeedback: 'Error evaluating response', enhancedFeedback: '', transcription: 'Error transcribing audio' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));