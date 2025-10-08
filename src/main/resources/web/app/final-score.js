
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
        const template = document.getElementById('score-details-template').content.cloneNode(true);
        const tbody = template.querySelector('tbody');
        currentQuizData.detail.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${d.niveau ?? '-'}</td><td>${d.module}</td><td>${d.question && d.question !== 'undefined' ? d.question : '-'}</td><td>${d.points}</td>`;
            tbody.appendChild(tr);
        });
        finalScoreElement.parentNode.appendChild(template);
    }
    localStorage.setItem('currentPlayer', currentQuizData.playerName);
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ playerName: currentQuizData.playerName, score });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    localStorage.removeItem('currentQuiz');
}

initFinalScorePage();
