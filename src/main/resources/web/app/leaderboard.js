import {showConfirmDialog, showDialog} from './dialog';
import {answeredModules, currentPlayer, finishQuiz, loadLeaderboard, loadQuiz, quizScore, resetAll} from './quiz-state';

const DISPLAYED_ROWS = 25;

export function initLeaderboardPage() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    renderCurrentQuiz();
    renderLeaderboard(leaderboardList);
    document.getElementById('clear-storage-btn').addEventListener('click', resetGame);
}

function renderCurrentQuiz() {
    const section = document.getElementById('quiz-in-progress');
    const content = document.getElementById('current-quiz-content');
    const quiz = loadQuiz();
    if (!quiz) {
        const title = document.getElementById('current-quiz-title');
        title.querySelector('.heading-icon--info').hidden = false;
        title.querySelector('.quiz-title-label').textContent = 'Aucun quiz en cours';
        content.innerHTML = '';
        return;
    }

    const totalModules = Number(section.dataset.moduleCount);
    const answeredCount = answeredModules(quiz).size;
    const remainingCount = totalModules - answeredCount;
    content.querySelector('.player-name-display').textContent = quiz.playerName;
    content.querySelector('.current-score-display').textContent = quizScore(quiz);
    content.querySelector('.modules-progress').textContent = `${answeredCount}/${totalModules}`;

    const remaining = document.createElement('li');
    if (remainingCount > 0) remaining.textContent = `${remainingCount} module(s) restant(s)`;
    else remaining.innerHTML = '<em>Tous les modules sont complétés</em>';
    content.querySelector('.remaining-modules-list').appendChild(remaining);

    content.querySelector('.force-finish-btn').addEventListener('click', () => forceFinishQuiz(quiz));
    content.querySelector('.continue-quiz-btn').addEventListener('click', () => {
        window.location.href = quiz.nextModuleUrl;
    });
}

function renderLeaderboard(leaderboardList) {
    const template = document.getElementById('leaderboard-row-template');
    const player = currentPlayer();
    const entries = loadLeaderboard()
        .sort((a, b) => b.score - a.score)
        .slice(0, DISPLAYED_ROWS);

    leaderboardList.replaceChildren(...entries.map((entry, index) => {
        const row = template.content.firstElementChild.cloneNode(true);
        if (index > 0) {
            // Rows fade from the winner's color to light green.
            const lightness = 63 + 32 * index / (entries.length - 1);
            row.style.setProperty('--rank-green-lightness', `${lightness}%`);
            row.style.setProperty('--rank-green-end-lightness', `${Math.min(lightness + 10, 98)}%`);
        }
        const [nameCell, scoreCell] = row.querySelectorAll('td');
        row.querySelector('th').textContent = index + 1;
        nameCell.textContent = entry.playerName;
        scoreCell.textContent = entry.score;
        row.classList.toggle('current-player', entry.playerName === player);
        return row;
    }));
}

async function forceFinishQuiz(quiz) {
    const confirmed = await showConfirmDialog(`Êtes-vous sûr de vouloir terminer le quiz de ${quiz.playerName} ? Les modules non complétés auront 0 point.`);
    if (!confirmed) return;
    const score = finishQuiz();
    await showDialog(`Quiz terminé ! Score final : ${score} points`);
    window.location.reload();
}

async function resetGame() {
    const confirmed = await showConfirmDialog('Êtes-vous sûr de vouloir vider le stockage local ? Cela supprimera tous les quiz en cours et les scores du leaderboard.');
    if (!confirmed) return;
    resetAll();
    await showDialog('Le stockage local a été vidé.');
    window.location.reload();
}
