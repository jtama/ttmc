document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page d'accueil (index.html) ou le leaderboard
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const isLeaderboardPage = window.location.pathname.endsWith('leaderboard.html');

    // Si ce n'est pas la page d'accueil ni le leaderboard, vérifier qu'un quiz est en cours
    if (!isIndexPage && !isLeaderboardPage) {
        const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
        if (!currentQuizData || !currentQuizData.playerName) {
            alert('Veuillez d\'abord saisir votre nom sur la page d\'accueil.');
            window.location.href = 'index.html';
            return;
        }
    }

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

    // Vérifier si une réponse a déjà été donnée pour ce module
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    const moduleName = document.title;
    const hasAnswered = currentQuizData && currentQuizData.detail &&
                       currentQuizData.detail.some(d => d.module === moduleName);

    if (hasAnswered) {
        // Désactiver tous les boutons si une réponse a déjà été donnée
        levelButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });

        // Afficher un message indiquant qu'une réponse a déjà été donnée
        const existingAnswer = currentQuizData.detail.find(d => d.module === moduleName);
        questionContainer.innerHTML = `
            <div class="question-card">
                <div class="question-text">Vous avez déjà répondu à une question de ce module.</div>
                <div class="answer-text">
                    <strong>Niveau choisi :</strong> ${existingAnswer.niveau}<br>
                    <strong>Points obtenus :</strong> ${existingAnswer.points}
                </div>
                <div class="button-group">
                    <button onclick="window.location.href='${nextModule}'" class="next-btn">Continuer vers le module suivant</button>
                </div>
            </div>
        `;
        questionContainer.style.display = '';
        return;
    }

    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => showQuestion(btn, questions, questionContainer, nextModule));
    });
}

function showQuestion(btn, questions, container, nextModule) {
    const idx = parseInt(btn.getAttribute('data-index'));
    const q = questions[idx];
    if (!q) return;

    // Désactiver tous les autres boutons de niveau
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
            otherBtn.disabled = true;
            otherBtn.style.opacity = '0.5';
            otherBtn.style.pointerEvents = 'none';
        }
    });

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

    // Afficher le quiz en cours s'il y en a un
    displayCurrentQuiz();

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

function displayCurrentQuiz() {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    const titleElement = document.getElementById('current-quiz-title');
    const contentElement = document.getElementById('current-quiz-content');
    const templateElement = document.getElementById('quiz-in-progress-template');

    if (!titleElement || !contentElement || !templateElement) return;

    if (currentQuizData && currentQuizData.playerName) {
        // Définir tous les modules disponibles
        const allModules = ['Java', 'JavaScript', 'Python', 'Kubernetes', 'IA', 'BDXIO'];

        // Calculer les modules restants
        const answeredModules = currentQuizData.detail ?
                               currentQuizData.detail.map(d => d.module) : [];
        const remainingModules = allModules.filter(module => !answeredModules.includes(module));

        const currentScore = currentQuizData.detail ?
                           currentQuizData.detail.reduce((acc, d) => acc + (d.points || 0), 0) : 0;

        // Mettre à jour le titre
        titleElement.textContent = '🎯 Quiz en cours';

        // Cacher le contenu par défaut et afficher le template
        contentElement.style.display = 'none';
        templateElement.style.display = 'block';

        // Remplir les données dans le template
        document.getElementById('player-name-display').textContent = currentQuizData.playerName;
        document.getElementById('current-score-display').textContent = currentScore;
        document.getElementById('modules-progress').textContent = `${answeredModules.length}/${allModules.length}`;

        // Remplir la liste des modules restants
        const remainingModulesList = document.getElementById('remaining-modules-list');
        remainingModulesList.innerHTML = '';
        if (remainingModules.length > 0) {
            remainingModules.forEach(module => {
                const li = document.createElement('li');
                li.textContent = module;
                remainingModulesList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.innerHTML = '<em>Tous les modules sont complétés</em>';
            remainingModulesList.appendChild(li);
        }

        // Afficher/cacher les boutons appropriés
        const forceFinishBtn = document.getElementById('force-finish-btn');
        const finalizeBtn = document.getElementById('finalize-btn');

        if (remainingModules.length > 0) {
            forceFinishBtn.style.display = 'inline-block';
            finalizeBtn.style.display = 'none';
        } else {
            forceFinishBtn.style.display = 'none';
            finalizeBtn.style.display = 'inline-block';
        }

    } else {
        // Aucun quiz en cours - afficher le contenu par défaut
        titleElement.textContent = 'ℹ️ Aucun quiz en cours';
        contentElement.style.display = 'block';
        templateElement.style.display = 'none';
    }
}

// Fonction pour forcer la fin du quiz avec 0 points pour les modules restants
function forceFinishQuiz() {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        alert('Aucun quiz en cours à terminer.');
        return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir terminer le quiz de ${currentQuizData.playerName} ? Les modules non complétés auront 0 point.`)) {
        return;
    }

    const allModules = [
        'Java', 'JavaScript', 'Python', 'Kubernetes', 'IA', 'BDXIO'
    ];

    if (!currentQuizData.detail) currentQuizData.detail = [];

    // Ajouter 0 points pour tous les modules restants
    const answeredModules = currentQuizData.detail.map(d => d.module);
    const remainingModules = allModules.filter(module => !answeredModules.includes(module));

    remainingModules.forEach(module => {
        currentQuizData.detail.push({
            niveau: 0,
            module: module,
            question: 'Quiz terminé automatiquement',
            points: 0
        });
    });

    // Finaliser le quiz
    finalizeQuiz(currentQuizData);
}

// Fonction pour finaliser un quiz déjà complété
function finalizeCompletedQuiz() {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        alert('Aucun quiz en cours à finaliser.');
        return;
    }

    if (confirm(`Finaliser le quiz de ${currentQuizData.playerName} et l'ajouter au leaderboard ?`)) {
        finalizeQuiz(currentQuizData);
    }
}

// Fonction pour continuer le quiz
function continueQuiz() {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        alert('Aucun quiz en cours à continuer.');
        return;
    }

    // Rediriger vers le premier module ou la page appropriée
    window.location.href = 'java.html'; // À adapter selon votre flux
}

// Fonction utilitaire pour finaliser un quiz
function finalizeQuiz(quizData) {
    const score = quizData.detail ? quizData.detail.reduce((acc, d) => acc + (d.points || 0), 0) : 0;

    // Ajouter au leaderboard
    localStorage.setItem('currentPlayer', quizData.playerName);
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ playerName: quizData.playerName, score });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Supprimer le quiz en cours
    localStorage.removeItem('currentQuiz');

    alert(`Quiz terminé ! Score final : ${score} points`);

    // Actualiser l'affichage
    location.reload();
}

// --- Start Quiz Page Logic ---
function initStartQuizPage() {
    const startQuizButton = document.getElementById('start-quiz-btn');
    const playerNameInput = document.getElementById('player-name');
    if (!startQuizButton || !playerNameInput) return;

    // Désactiver le bouton au démarrage
    startQuizButton.style.pointerEvents = 'none';
    startQuizButton.style.opacity = '0.5';

    // Fonction pour vérifier et activer/désactiver le bouton
    function toggleStartButton() {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            startQuizButton.style.pointerEvents = 'auto';
            startQuizButton.style.opacity = '1';
        } else {
            startQuizButton.style.pointerEvents = 'none';
            startQuizButton.style.opacity = '0.5';
        }
    }

    // Écouter les changements dans le champ de saisie
    playerNameInput.addEventListener('input', toggleStartButton);
    playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const playerName = playerNameInput.value.trim();
            if (playerName) {
                startQuizButton.click();
            }
        }
    });

    startQuizButton.addEventListener('click', (e) => {
        e.preventDefault();
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Veuillez saisir votre nom pour commencer le quiz.');
            playerNameInput.focus();
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

    // Vérification initiale
    toggleStartButton();
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