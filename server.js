const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generatePaper', (req, res) => {
  const { totalMarks, easyQuestions, mediumQuestions, hardQuestions } = req.body;

  // Read questions from the JSON file
  const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'question.json'), 'utf-8'));

  // Shuffle the questions randomly
  const shuffledQuestions = shuffleArray(questions);

  // Calculate the total marks based on the number of questions and their individual marks
  const totalMarksAllocated =
    easyQuestions * getMarksByDifficulty(shuffledQuestions, 'Easy') +
    mediumQuestions * getMarksByDifficulty(shuffledQuestions, 'Medium') +
    hardQuestions * getMarksByDifficulty(shuffledQuestions, 'Hard');

  // Check if the calculated total marks match the provided total marks
  if (totalMarksAllocated !== parseInt(totalMarks)) {
    return res
      .status(400)
      .json({ error: 'Calculated total marks do not match the provided total marks.' });
  }

  // Select questions randomly based on user input
  const selectedQuestions = [
    ...getRandomQuestionsByDifficulty(shuffledQuestions, 'Easy', easyQuestions),
    ...getRandomQuestionsByDifficulty(shuffledQuestions, 'Medium', mediumQuestions),
    ...getRandomQuestionsByDifficulty(shuffledQuestions, 'Hard', hardQuestions),
  ];

  // Send the selected questions to the client
  res.json({ questionPaper: selectedQuestions });
});

function getMarksByDifficulty(questions, difficulty) {
  const question = questions.find(q => q.difficulty === difficulty);
  return question ? question.marks : 0;
}

function getRandomQuestionsByDifficulty(questions, difficulty, count) {
  return questions.filter(q => q.difficulty === difficulty).slice(0, count);
}

function shuffleArray(array) {
  // Fisher-Yates (aka Knuth) Shuffle Algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
