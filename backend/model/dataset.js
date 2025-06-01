const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function fetchAndPreprocessData(domain) {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Fetch quiz data for the given domain
    const response = await axios.get(
      `https://raw.githubusercontent.com/Ebazhanov/linkedin-skill-assessments-quizzes/main/${domain.toLowerCase()}/${domain.toLowerCase()}-quiz.md`
    );
    const data = response.data;

    // Extract questions starting with "#### Q"
    const questions = data.split('\n').filter(line => line.startsWith('#### Q'));
    const processedData = questions.map((q, i) => ({
      id: i,
      question: q.replace('#### Q', '').trim(),
    }));

    // Save to domain-specific JSON file
    const filePath = path.join(dataDir, `${domain.toLowerCase()}.json`);
    await fs.writeFile(filePath, JSON.stringify(processedData, null, 2));
    console.log(`Saved ${processedData.length} questions to ${filePath}`);

    return processedData;
  } catch (err) {
    console.error(`Error fetching or saving dataset for ${domain}:`, err.message);
    // Fallback mock data
    return [
      { id: 0, question: `Mock question for ${domain}: What is a basic concept in ${domain}?` }
    ];
  }
}

module.exports = { fetchAndPreprocessData };