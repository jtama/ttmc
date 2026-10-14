import {showDialog} from './dialog';
import {loadQuiz, startQuiz} from './quiz-state';

export function initStartQuizPage() {
    const startButton = document.getElementById('start-quiz-btn');
    const nameInput = document.getElementById('player-name');
    if (!startButton || !nameInput) return;

    // A quiz in progress is resumed where the player left it.
    const quiz = loadQuiz();
    if (quiz?.nextModuleUrl) {
        window.location.href = quiz.nextModuleUrl;
        return;
    }

    const playerName = () => nameInput.value.trim();
    const refreshStartButton = () => startButton.setAttribute('aria-disabled', String(!playerName()));

    nameInput.addEventListener('input', refreshStartButton);
    nameInput.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        startButton.click();
    });
    startButton.addEventListener('click', event => {
        event.preventDefault();
        if (!playerName()) {
            showDialog('Veuillez saisir votre nom pour commencer le quiz.');
            nameInput.focus();
            return;
        }
        startQuiz(playerName(), startButton.pathname);
        window.location.href = startButton.href;
    });
    refreshStartButton();
}
