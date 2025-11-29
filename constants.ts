
import { Minigame } from './types';

export const GRADES = Array.from({ length: 13 }, (_, i) => i + 1);
export const SUBJECTS = ['Math', 'Language Arts', 'Science', 'Social Studies', 'Art'];

const simpleAdditionGameHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Einfache Addition</title>
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
        <h1>Additions-Herausforderung!</h1>
        <div id="problem"></div>
        <input type="number" id="answer" autofocus />
        <button onclick="checkAnswer()">Absenden</button>
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
                feedbackEl.textContent = 'Richtig! Super gemacht!';
                feedbackEl.className = 'correct';
                setTimeout(generateProblem, 1500);
            } else {
                feedbackEl.textContent = 'Nicht ganz. Versuch es nochmal!';
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
    <title>Buchstabierbiene</title>
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
        <h1>Entmische das Wort!</h1>
        <div id="scrambled-word"></div>
        <input type="text" id="guess" autofocus />
        <button onclick="checkGuess()">Raten</button>
        <div id="feedback"></div>
    </div>
    <script>
        const words = ['APFEL', 'STRAND', 'STUHL', 'TRAUM', 'ERDE', 'BLUME', 'TRAUBE', 'GLÜCKLICH', 'IGLU'];
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
                feedbackEl.textContent = 'Du hast es geschafft!';
                feedbackEl.style.color = 'green';
                setTimeout(newWord, 1500);
            } else {
                feedbackEl.textContent = 'Versuch es nochmal!';
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
        title: 'Einfache Addition',
        description: 'Ein unterhaltsames Spiel zum Üben grundlegender Additionsfertigkeiten.',
        grade: 1,
        subject: 'Math',
        htmlContent: simpleAdditionGameHtml,
    },
    {
        id: 'lang-spell-1',
        title: 'Buchstabierbiene',
        description: 'Entmische die Buchstaben, um ein Wort zu bilden.',
        grade: 2,
        subject: 'Language Arts',
        htmlContent: spellingGameHtml,
    },
];

export const SUBJECT_SHORTCUTS = [
    { id: 'All', label: 'Alle Fächer', value: 'All', gradient: 'from-slate-100 to-slate-200' },
    { id: 'Math', label: 'Mathe Labor', value: 'Math', gradient: 'from-sky-100 to-sky-200' },
    { id: 'Language Arts', label: 'Sprachatelier', value: 'Language Arts', gradient: 'from-pink-100 to-rose-200' },
    { id: 'Science', label: 'Science Lab', value: 'Science', gradient: 'from-green-100 to-emerald-200' },
    { id: 'Social Studies', label: 'Gesellschaft', value: 'Social Studies', gradient: 'from-amber-100 to-orange-200' },
    { id: 'Art', label: 'Kreativstudio', value: 'Art', gradient: 'from-purple-100 to-indigo-200' },
];

export const HERO_FILTERS = [
    { id: 'library', label: 'Bibliothek' },
    { id: 'templates', label: 'Vorlagen' },
    { id: 'ai', label: 'EduGame AI' },
];
