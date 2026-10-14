import {showDialog} from './dialog';
import {chooseLevel, chosenLevel, loadQuiz, recordAnswer, setNextModuleUrl} from './quiz-state';
import {currentModuleLink, nextModuleUrl} from './navigation';

// Levels can be changed until an answer is submitted for this module.
export function initModulePage() {
    const levelButtons = Array.from(document.querySelectorAll('.level-btn'));
    const moduleName = currentModuleLink()?.dataset.moduleTitle;
    if (!levelButtons.length || !moduleName) return;

    function askQuestion(index) {
        if (!loadQuiz()) {
            showDialog('Veuillez démarrer le quiz depuis la page principale.');
            return;
        }
        if (!Number.isInteger(index) || !levelButtons[index]) return;
        chooseLevel(moduleName, index);
        levelButtons.forEach((button, i) => {
            button.classList.toggle('is-active', i === index);
            button.setAttribute('aria-pressed', String(i === index));
            document.getElementById(`question-${button.dataset.index}`).style.display = 'none';
        });
        showQuestion(document.getElementById(`question-${levelButtons[index].dataset.index}`));
    }

    function showQuestion(question) {
        const revealButton = question.querySelector('.show-answer-btn');
        const answerButtons = [question.querySelector('.ok-btn'), question.querySelector('.error-btn')];
        const niveau = Number(answerButtons[0].dataset.points);
        question.style.display = 'block';

        revealButton.onclick = () => {
            revealButton.disabled = true;
            question.querySelector('.answer-text').style.display = 'block';
            answerButtons.forEach(button => {
                button.style.display = 'inline-flex';
                button.disabled = false;
            });
        };

        function submitAnswer(correct) {
            if (answerButtons[0].disabled) return;
            levelButtons.forEach(button => button.disabled = true);
            answerButtons.forEach(button => button.disabled = true);
            recordAnswer({
                module: moduleName,
                niveau,
                question: question.querySelector('.question-text').innerHTML,
                points: correct ? niveau : 0
            });
            const next = nextModuleUrl();
            setNextModuleUrl(next);
            window.location.href = next;
        }

        answerButtons[0].onclick = () => submitAnswer(true);
        answerButtons[1].onclick = () => submitAnswer(false);
    }

    levelButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            askQuestion(index);
        });
    });

    // Reloading the page keeps the level already chosen.
    const pendingLevel = chosenLevel(moduleName);
    if (pendingLevel !== undefined) askQuestion(pendingLevel);
}
