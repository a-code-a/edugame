
import { Minigame } from './types';

export const GRADES = Array.from({ length: 13 }, (_, i) => i + 1);
export const SUBJECTS = ['Math', 'Language Arts', 'Science', 'Social Studies', 'Art'];

const simpleAdditionGameHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Addition</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f7ff; }
        .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); width: 90%; max-width: 400px; }
        h1 { color: #005a9c; }
        #problem { font-size: 2.5rem; margin: 20px 0; color: #333; }
        input { font-size: 1.5rem; padding: 10px; text-align: center; width: 100px; border: 2px solid #ccc; border-radius: 8px; margin-bottom: 20px; }
        button { font-size: 1.2rem; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.3s; }
        button:hover { background-color: #0056b3; }
        #feedback { margin-top: 20px; font-size: 1.2rem; font-weight: bold; }
        .correct { color: #28a745; }
        .incorrect { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Addition Challenge!</h1>
        <div id="problem"></div>
        <input type="number" id="answer" autofocus />
        <button onclick="checkAnswer()">Submit</button>
        <div id="feedback"></div>
    </div>
    <script>
        let num1, num2, correctAnswer;
        const problemEl = document.getElementById('problem');
        const answerEl = document.getElementById('answer');
        const feedbackEl = document.getElementById('feedback');
        function generateProblem() {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            correctAnswer = num1 + num2;
            problemEl.textContent = \`\${num1} + \${num2} = ?\`;
            answerEl.value = '';
            feedbackEl.textContent = '';
            answerEl.focus();
        }
        function checkAnswer() {
            const userAnswer = parseInt(answerEl.value, 10);
            if (userAnswer === correctAnswer) {
                feedbackEl.textContent = 'Correct! Great job!';
                feedbackEl.className = 'correct';
                setTimeout(generateProblem, 1500);
            } else {
                feedbackEl.textContent = 'Not quite. Try again!';
                feedbackEl.className = 'incorrect';
            }
        }
        answerEl.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                checkAnswer();
            }
        });
        generateProblem();
    </script>
</body>
</html>
`;

const spellingGameHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spelling Bee</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fffbe6; }
        .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); width: 90%; max-width: 450px; }
        h1 { color: #c47d00; }
        #scrambled-word { font-size: 3rem; letter-spacing: 10px; margin: 20px 0; color: #594500; font-weight: bold; }
        input { font-size: 1.5rem; padding: 10px; text-align: center; width: 80%; border: 2px solid #ccc; border-radius: 8px; margin-bottom: 20px; }
        button { font-size: 1.2rem; padding: 10px 20px; background-color: #ffc107; color: #333; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.3s; }
        button:hover { background-color: #e0a800; }
        #feedback { margin-top: 20px; font-size: 1.2rem; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Unscramble the Word!</h1>
        <div id="scrambled-word"></div>
        <input type="text" id="guess" autofocus />
        <button onclick="checkGuess()">Guess</button>
        <div id="feedback"></div>
    </div>
    <script>
        const words = ['APPLE', 'BEACH', 'CHAIR', 'DREAM', 'EARTH', 'FLOWER', 'GRAPE', 'HAPPY', 'IGLOO'];
        let currentWord = '';
        const scrambledWordEl = document.getElementById('scrambled-word');
        const guessEl = document.getElementById('guess');
        const feedbackEl = document.getElementById('feedback');
        function scramble(word) {
            let arr = word.split('');
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr.join('');
        }
        function newWord() {
            currentWord = words[Math.floor(Math.random() * words.length)];
            let scrambled = scramble(currentWord);
            while (scrambled === currentWord) {
                scrambled = scramble(currentWord);
            }
            scrambledWordEl.textContent = scrambled;
            guessEl.value = '';
            feedbackEl.textContent = '';
            guessEl.focus();
        }
        function checkGuess() {
            if (guessEl.value.toUpperCase() === currentWord) {
                feedbackEl.textContent = 'You got it!';
                feedbackEl.style.color = 'green';
                setTimeout(newWord, 1500);
            } else {
                feedbackEl.textContent = 'Try again!';
                feedbackEl.style.color = 'red';
            }
        }
        guessEl.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                checkGuess();
            }
        });
        newWord();
    </script>
</body>
</html>
`;

export const INITIAL_MINIGAMES: Minigame[] = [
  {
    id: 'math-add-1',
    title: 'Simple Addition',
    description: 'A fun game to practice basic addition skills.',
    grade: 1,
    subject: 'Math',
    htmlContent: simpleAdditionGameHtml,
  },
  {
    id: 'lang-spell-1',
    title: 'Spelling Bee',
    description: 'Unscramble the letters to form a word.',
    grade: 2,
    subject: 'Language Arts',
    htmlContent: spellingGameHtml,
  },
];
