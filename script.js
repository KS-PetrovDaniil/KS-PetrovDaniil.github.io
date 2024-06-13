document.addEventListener('DOMContentLoaded', function() {
    const nameContainer = document.getElementById('name-container');
    const modeSelection = document.getElementById('mode-selection');
    const levelContainer = document.getElementById('level-container');
    const competitionSetup = document.getElementById('competition-setup');
    const questionContainer = document.getElementById('question-container');
    const resultContainer = document.getElementById('result-container');
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const submitButton = document.getElementById('submit-answer');
    const resultElement = document.getElementById('result');
    const restartButton = document.getElementById('restart-quiz');
    const showResultButton = document.getElementById('show-result');
    const submitNameButton = document.getElementById('submit-name');
    const startTrainingButton = document.getElementById('start-training');
    const joinCompetitionButton = document.getElementById('join-competition');
    const createCompetitionButton = document.getElementById('create-competition');
    const trainingModeButton = document.getElementById('training-mode');
    const competitionModeButton = document.getElementById('competition-mode');
    const difficultySelect = document.getElementById('difficulty');
    const timerElement = document.getElementById('timer');
    const usernameInput = document.getElementById('username');
    const roomCodeInput = document.getElementById('room-code');
    const resultsPanel = document.getElementById('results-panel');
    const resultsTableBody = document.querySelector('#results-table tbody');

    let currentQuestion = {};
    let score = 0;
    let questionCount = 0;
    const totalTrainingQuestions = 5;
    const totalCompetitionQuestions = 10;
    let difficulty = 'easy';
    let startTime;
    let timerInterval;
    let userAnswers = [];
    let mode = 'training'; // 'training' or 'competition'
    let roomCode = '';
    let competitionQuestions = [];
    let username = '';

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateDecimal(min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    function generateQuestion() {
        const easyOperations = ['+', '-', '*', '/'];
        const mediumOperations = ['+', '-', '*', '/'];
        const hardOperations = ['+', '-', '*', '/'];

        let question;

        switch (difficulty) {
            case 'easy':
                question = generateSimpleQuestion(easyOperations);
                break;
            case 'medium':
                question = generateSimpleQuestion(mediumOperations, true);
                break;
            case 'hard':
                question = generateComplexQuestion(hardOperations);
                break;
        }

        currentQuestion = { question, answer: eval(question).toFixed(2) };
        questionElement.textContent = currentQuestion.question;
        answerElement.value = '';
    }

    function generateSimpleQuestion(operations, isDecimal = false) {
        const num1 = isDecimal ? generateDecimal(1, 50) : generateRandomNumber(1, 50);
        const num2 = isDecimal ? generateDecimal(1, 50) : generateRandomNumber(1, 50);
        const operation = operations[generateRandomNumber(0, operations.length - 1)];
        return `${num1} ${operation} ${num2}`;
    }

    function generateComplexQuestion(operations) {
        const numOperations = generateRandomNumber(4, 6);
        let question = generateDecimal(1, 50);
        for (let i = 0; i < numOperations; i++) {
            const num = generateDecimal(1, 50);
            const operation = operations[generateRandomNumber(0, operations.length - 1)];
            question += ` ${operation} ${num}`;
        }
        return question;
    }

    function startTraining() {
        mode = 'training';
        difficulty = difficultySelect.value;
        levelContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        generateQuestion();
    }

    function startCompetition() {
        if (roomCode === '') {
            alert('Please enter a valid room code or create a new competition');
            return;
        }
        mode = 'competition';
        levelContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        fetchCompetitionData();
    }

    function createCompetition() {
        roomCode = generateRoomCode();
        alert(`Your room code is ${roomCode}`);
        startCompetition();
    }

    function generateRoomCode() {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    function fetchCompetitionData() {
        // Fetch the competition data for the room code
        // For the sake of this example, we will generate random questions
        // In a real application, you would fetch this data from a server
        competitionData = [];
        for (let i = 0; i < 4; i++) {
            difficulty = 'easy';
            competitionData.push({ question: generateSimpleQuestion(['+', '-', '*', '/']), difficulty });
        }
        for (let i = 0; i < 3; i++) {
            difficulty = 'medium';
            competitionData.push({ question: generateSimpleQuestion(['+', '-', '*', '/'], true), difficulty });
        }
        for (let i = 0; i < 3; i++) {
            difficulty = 'hard';
            competitionData.push({ question: generateComplexQuestion(['+', '-', '*', '/']), difficulty });
        }
        nextCompetitionQuestion();
    }

    function nextCompetitionQuestion() {
        if (questionCount < competitionData.length) {
            const data = competitionData[questionCount];
            currentQuestion = { question: data.question, answer: eval(data.question).toFixed(2) };
            questionElement.textContent = currentQuestion.question;
            answerElement.value = '';
        } else {
            clearInterval(timerInterval);
            showResult();
        }
    }

    function checkAnswer() {
        const userAnswer = parseFloat(answerElement.value.trim()).toFixed(2);
        userAnswers.push({ question: currentQuestion.question, userAnswer, correctAnswer: currentQuestion.answer });
        if (userAnswer === currentQuestion.answer) {
            score += getScoreForQuestion(difficulty);
        }
        questionCount++;
        if (mode === 'training') {
            if (questionCount < totalTrainingQuestions) {
                generateQuestion();
            } else {
                clearInterval(timerInterval);
                showResult();
            }
        } else {
            nextCompetitionQuestion();
        }
    }

    function getScoreForQuestion(difficulty) {
        switch (difficulty) {
            case 'easy': return 1;
            case 'medium': return 2;
            case 'hard': return 3;
            default: return 0;
        }
    }

    function showResult() {
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        const elapsedTime = new Date() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const totalTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        resultElement.textContent = `You scored ${score} points`;
        displayResultsTable(totalTime);
    }

    function displayResultsTable(totalTime) {
        resultsTableBody.innerHTML = '';
        userAnswers.forEach(answer => {
            const row = document.createElement('tr');
            row.className = parseFloat(answer.userAnswer) === parseFloat(answer.correctAnswer) ? 'correct' : 'incorrect';
            row.innerHTML = `
                <td>${answer.question}</td>
                <td>${answer.userAnswer}</td>
                <td>${answer.correctAnswer}</td>
                <td>${parseFloat(answer.userAnswer) === parseFloat(answer.correctAnswer) ? 'Correct' : 'Incorrect'}</td>
            `;
            resultsTableBody.appendChild(row);
        });
    }

    function restartQuiz() {
        score = 0;
        questionCount = 0;
        userAnswers = [];
        resultContainer.style.display = 'none';
        questionContainer.style.display = 'none';
        modeSelection.style.display = 'block';
        resultsPanel.classList.remove('show');
    }

    function updateTimer() {
        const elapsedTime = new Date() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        timerElement.textContent = `Time: ${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    submitNameButton.addEventListener('click', () => {
        if (usernameInput.value.trim() === '') {
            alert('Please enter your name');
            return;
        }
        username = usernameInput.value.trim();
        nameContainer.style.display = 'none';
        modeSelection.style.display = 'block';
    });

    trainingModeButton.addEventListener('click', () => {
        modeSelection.style.display = 'none';
        levelContainer.style.display = 'block';
    });

    competitionModeButton.addEventListener('click', () => {
        modeSelection.style.display = 'none';
        competitionSetup.style.display = 'block';
    });

    startTrainingButton.addEventListener('click', startTraining);
    joinCompetitionButton.addEventListener('click', startCompetition);
    createCompetitionButton.addEventListener('click', createCompetition);
    submitButton.addEventListener('click', checkAnswer);
    restartButton.addEventListener('click', restartQuiz);
    showResultButton.addEventListener('click', () => resultsPanel.classList.toggle('show'));

    // Sketchpad functionality
    const sketchpad = document.getElementById('sketchpad');
    const clearButton = document.getElementById('clear-sketchpad');
    const ctx = sketchpad.getContext('2d');
    let drawing = false;

    sketchpad.addEventListener('mousedown', startDrawing);
    sketchpad.addEventListener('mouseup', stopDrawing);
    sketchpad.addEventListener('mousemove', draw);
    clearButton.addEventListener('click', clearSketchpad);

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';

        ctx.lineTo(e.clientX - sketchpad.offsetLeft, e.clientY - sketchpad.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - sketchpad.offsetLeft, e.clientY - sketchpad.offsetTop);
    }

    function clearSketchpad() {
        ctx.clearRect(0, 0, sketchpad.width, sketchpad.height);
    }
});
