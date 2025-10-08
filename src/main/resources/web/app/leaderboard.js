import {showConfirmDialog, showDialog} from "./dialog";

// --- Leaderboard Page Logic ---
export function initLeaderboardPage(allModules) {
    const leaderboardElement = document.getElementById('leaderboard-list');
    if (!leaderboardElement) return;

    // Afficher le quiz en cours s'il y en a un
    displayCurrentQuiz(allModules);

    const leaderboard = (JSON.parse(localStorage.getItem('leaderboard')) || []).sort((a, b) => b.score - a.score);
    const currentPlayer = localStorage.getItem('currentPlayer');
    leaderboardElement.innerHTML = '';
    leaderboard.slice(0, 25).forEach((entry, index) => {
        const template = document.getElementById('leaderboard-row-template').content.cloneNode(true);
        const cells = template.querySelectorAll('td');
        template.querySelector('th').textContent = index + 1;
        cells[0].textContent = entry.playerName;
        cells[1].textContent = entry.score;
        if (entry.playerName === currentPlayer) {
            template.querySelector('tr').classList.add('current-player');
        }
        leaderboardElement.appendChild(template);
    });
    const clearStorageBtn = document.getElementById('clear-storage-btn');
    if (clearStorageBtn) {
        clearStorageBtn.addEventListener('click', () => {
            showConfirmDialog('Êtes-vous sûr de vouloir vider le stockage local ? Cela supprimera tous les quiz en cours et les scores du leaderboard.').then(confirmed => {
                if (confirmed) {
                    localStorage.clear();
                    showDialog('Le stockage local a été vidé.');
                    // Optionally reload the page to reflect changes
                    location.reload();
                }
            });
        });
    }

}

function displayCurrentQuiz(allModules) {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    const titleElement = document.getElementById('current-quiz-title');
    const contentElement = document.getElementById('current-quiz-content');
    const templateElement = document.getElementById('quiz-in-progress-template');

    if (!titleElement || !contentElement || !templateElement) return;

    if (currentQuizData && currentQuizData.playerName) {
        // Définir tous les modules disponibles

        // Calculer les modules restants
        const answeredModules = currentQuizData.detail ?
            currentQuizData.detail.map(d => d.module) : [];
        const remainingModules = allModules.filter(module => !answeredModules.includes(module));

        const currentScore = currentQuizData.detail ?
            currentQuizData.detail.reduce((acc, d) => acc + (d.points || 0), 0) : 0;

        // Cacher le contenu par défaut et afficher le template
        contentElement.innerHTML = '';
        const template = document.getElementById('quiz-in-progress-template').content.cloneNode(true);
        template.querySelector('.player-name-display').textContent = currentQuizData.playerName;
        template.querySelector('.current-score-display').textContent = currentScore;
        template.querySelector('.modules-progress').textContent = `${answeredModules.length}/${allModules.length}`;

        const remainingModulesList = template.querySelector('.remaining-modules-list');
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

        const forceFinishBtn = template.querySelector('.force-finish-btn');
        const finalizeBtn = template.querySelector('.finalize-btn');

        if (remainingModules.length > 0) {
            forceFinishBtn.style.display = 'inline-block';
            finalizeBtn.style.display = 'none';
        } else {
            forceFinishBtn.style.display = 'none';
            finalizeBtn.style.display = 'inline-block';
        }

        forceFinishBtn.onclick = () => forceFinishQuiz(allModules);
        finalizeBtn.onclick = () => forceFinishQuiz(allModules);
        template.querySelector('.continue-quiz-btn').onclick = continueQuiz;

        contentElement.appendChild(template);

    } else {
        // Aucun quiz en cours - afficher le contenu par défaut
        titleElement.textContent = 'ℹ️ Aucun quiz en cours';
        contentElement.innerHTML = '';
    }
}

// Fonction pour forcer la fin du quiz avec 0 points pour les modules restants
function forceFinishQuiz(allModules) {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        showDialog('Aucun quiz en cours à terminer.');
        return;
    }

    showConfirmDialog(`Êtes-vous sûr de vouloir terminer le quiz de ${currentQuizData.playerName} ? Les modules non complétés auront 0 point.`).then(confirmed => {
        if (!confirmed) {
            return;
        }

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
    });
}

// Fonction pour continuer le quiz
function continueQuiz() {
    const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        showDialog('Aucun quiz en cours à continuer.');
        return;
    }

    const nextModule = document.body.getAttribute('data-next-module');

    // Rediriger vers le premier module ou la page appropriée
    window.location.href = '../'+nextModule; // À adapter selon votre flux
}

// Fonction utilitaire pour finaliser un quiz
function finalizeQuiz(quizData) {
    const score = quizData.detail ? quizData.detail.reduce((acc, d) => acc + (d.points || 0), 0) : 0;

    // Ajouter au leaderboard
    localStorage.setItem('currentPlayer', quizData.playerName);
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({playerName: quizData.playerName, score});
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Supprimer le quiz en cours
    localStorage.removeItem('currentQuiz');

    showDialog(`Quiz terminé ! Score final : ${score} points`);

    // Actualiser l'affichage
    location.reload();
}

if (window.location.pathname === '/leaderboard') {
    const modules = document.getElementById('leaderboard').getAttribute("data-modules").split(",");
    initLeaderboardPage(modules);
}




