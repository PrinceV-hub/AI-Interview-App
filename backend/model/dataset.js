const axios = require('axios');
const fs = require('fs').promises;

async function fetchAndPreprocessData(domain) {
  try {
    const response = await axios.get(
      `https://raw.githubusercontent.com/Ebazhanov/linkedin-skill-assessments-quizzes/main/${domain.toLowerCase()}/${domain.toLowerCase()}-quiz.md`
    );
    const data = response.data;
    const questions = data.split('\n').filter((line) => line.startsWith('#### Q'));
    const processedData = questions.map((q, i) => ({
      id: i,
      question: q.replace('#### Q', '').trim(),
    }));
    await fs.writeFile(`data/${domain}.json`, JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (err) {
    console.error('Error fetching dataset:', err);
    return [];
  }
}

module.exports = { fetchAndPreprocessData };
