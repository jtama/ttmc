import {showDialog} from "./dialog";



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
            showDialog('Veuillez saisir votre nom pour commencer le quiz.');
            playerNameInput.focus();
            return;
        }
        const newQuizData = {
            playerName,
            quizId: Date.now(),
            nextModuleUrl: startQuizButton.pathname,
            detail: []
        };
        localStorage.setItem('currentQuiz', JSON.stringify(newQuizData));
        window.location.href = startQuizButton.href;
    });

    // Vérification initiale
    toggleStartButton();
}

// Execute redirection check first. If it redirects, the rest of the script won't matter.
initStartQuizPage();
