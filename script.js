
document.addEventListener('DOMContentLoaded', () => {
    const nextModule = document.body.getAttribute('data-next-module');
    initModulePage(nextModule);
    initLeaderboardPage();
    initStartQuizPage();
    initFinalScorePage();
});

// --- Module Page Logic ---
function initModulePage(nextModule) {
    const levelButtons = document.querySelectorAll('.level-btn');
    const questionContainer = document.getElementById('question-container');
    if (!levelButtons.length || !questionContainer) return;
    const questions = window.moduleQuestions || [];
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => showQuestion(btn, questions, questionContainer, nextModule));
    });
}

function showQuestion(btn, questions, container, nextModule) {
    const idx = parseInt(btn.getAttribute('data-index'));
    const q = questions[idx];
    if (!q) return;
    container.innerHTML = `
        <div class="question-card">
            <div class="question-text">${q.question}</div>
            <div class="answer-text" style="display:none;"></div>
            <div class="button-group">
                <button class="show-answer-btn">Voir la réponse</button>
                <button class="ok-btn" data-points="${idx+1}" disabled>OK</button>
                <button class="error-btn" disabled>Error</button>
            </div>
        </div>
    `;
    container.style.display = '';
    const showAnswerBtn = container.querySelector('.show-answer-btn');
    const okBtn = container.querySelector('.ok-btn');
    const errorBtn = container.querySelector('.error-btn');
    showAnswerBtn.addEventListener('click', () => {
        container.querySelector('.answer-text').innerHTML = q.answer;
        container.querySelector('.answer-text').style.display = '';
        okBtn.disabled = false;
        errorBtn.disabled = false;
    });
    okBtn.addEventListener('click', () => handleAnswer(true, idx+1, q.question, idx+1, nextModule));
    errorBtn.addEventListener('click', () => handleAnswer(false, 0, q.question, idx+1, nextModule));
}

function handleAnswer(isCorrect, points, question, niveau, nextModule) {
    let currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        alert('Veuillez démarrer le quiz depuis la page principale.');
        return;
    }
    if (!currentQuizData.detail) currentQuizData.detail = [];
    // Remplace le détail du module si déjà présent
    const moduleName = document.title;
    const newDetail = {
        niveau: niveau,
        module: moduleName,
        question: question || '-',
        points: isCorrect ? points : 0
    };
    const idx = currentQuizData.detail.findIndex(d => d.module === moduleName);
    if (idx !== -1) {
        currentQuizData.detail[idx] = newDetail;
    } else {
        currentQuizData.detail.push(newDetail);
    }
    localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
    window.location.href = nextModule;
}

// --- Leaderboard Page Logic ---
function initLeaderboardPage() {
    const leaderboardElement = document.getElementById('leaderboard-list');
    if (!leaderboardElement) return;
    const leaderboard = (JSON.parse(localStorage.getItem('leaderboard')) || []).sort((a, b) => b.score - a.score);
    const currentPlayer = localStorage.getItem('currentPlayer');
    leaderboardElement.innerHTML = '';
    leaderboard.slice(0, 25).forEach((entry, index) => {
        const tr = document.createElement('tr');
        if (entry.playerName === currentPlayer) tr.classList.add('current-player');
        tr.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${entry.playerName}</td>
            <td>${entry.score}</td>
        `;
        leaderboardElement.appendChild(tr);
    });
}

// --- Start Quiz Page Logic ---
function initStartQuizPage() {
    const startQuizButton = document.getElementById('start-quiz-btn');
    const playerNameInput = document.getElementById('player-name');
    if (!startQuizButton || !playerNameInput) return;
    startQuizButton.addEventListener('click', (e) => {
        e.preventDefault();
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name.');
            return;
        }
        const newQuizData = {
            playerName,
            quizId: Date.now(),
            detail: []
        };
        localStorage.setItem('currentQuiz', JSON.stringify(newQuizData));
        window.location.href = startQuizButton.href;
    });
    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            startQuizButton.click();
        }
    });
}

// --- Final Score Page Logic ---
function initFinalScorePage() {
    const finalScoreElement = document.getElementById('final-score');
    const playerNameElement = document.getElementById('player-name-display');
    if (!finalScoreElement) return;
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) return;
    // Calcule le score à partir du détail
    const score = currentQuizData.detail ? currentQuizData.detail.reduce((acc, d) => acc + (d.points || 0), 0) : 0;
    finalScoreElement.textContent = score;
    if (playerNameElement) playerNameElement.textContent = currentQuizData.playerName;
    // Affichage du détail des scores
    if (currentQuizData.detail && currentQuizData.detail.length) {
        const detailDiv = document.createElement('div');
        detailDiv.className = 'score-detail';
        detailDiv.innerHTML = '<h2>Détail par question</h2>';
        const table = document.createElement('table');
        table.innerHTML = '<thead><tr><th>Niveau</th><th>Module</th><th>Question</th><th>Points</th></tr></thead><tbody></tbody>';
        currentQuizData.detail.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${d.niveau ?? '-'}</td><td>${d.module}</td><td>${d.question && d.question !== 'undefined' ? d.question : '-'}</td><td>${d.points}</td>`;
            table.querySelector('tbody').appendChild(tr);
        });
        detailDiv.appendChild(table);
        finalScoreElement.parentNode.appendChild(detailDiv);
    }
    localStorage.setItem('currentPlayer', currentQuizData.playerName);
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ playerName: currentQuizData.playerName, score });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    localStorage.removeItem('currentQuiz');
}