import {showDialog} from "./dialog";
import {completedModules, refreshModuleLinks, nextAvailableModule} from './module-progress';

function initModulePage() {
    const levelButtons = Array.from(document.querySelectorAll('.level-btn'));
    if (!levelButtons.length) return;

    const moduleName = document.body.getAttribute('data-page-title') || document.title;
    const quiz = JSON.parse(localStorage.getItem('currentQuiz'));
    const detail = quiz?.detail?.find(item => item.module === moduleName);
    if (completedModules(quiz).has(moduleName)) {
        document.querySelector('.main-layout').style.display = 'none';
        window.location.replace(nextAvailableModule(quiz, moduleName));
        return;
    }
    const answers = detail?.answers || [];
    const answeredLevels = new Set(answers.map(answer => answer.niveau));
    const revealedLevels = new Set();
    let currentIndex = -1;
    let currentQuestion = null;

    function showCurrentQuestion(selectedIndex = -1) {
        currentIndex = selectedIndex;
        levelButtons.forEach((button, index) => {
            button.disabled = answeredLevels.size === levelButtons.length;
            button.classList.toggle('is-active', index === currentIndex);
            button.setAttribute('aria-pressed', String(index === currentIndex));
        });
        if (currentQuestion) currentQuestion.style.display = 'none';
        document.getElementById('module-complete').hidden = answeredLevels.size < levelButtons.length;
        if (currentIndex < 0) return;

        const button = levelButtons[currentIndex];
        currentQuestion = document.getElementById(`question-${button.dataset.index}`);
        currentQuestion.style.display = 'block';
        const revealButton = currentQuestion.querySelector('.show-answer-btn');
        const answerText = currentQuestion.querySelector('.answer-text');
        const okButton = currentQuestion.querySelector('.ok-btn');
        const errorButton = currentQuestion.querySelector('.error-btn');
        const niveau = Number(okButton.dataset.points);
        const answered = answeredLevels.has(niveau);
        let revealed = answered || revealedLevels.has(niveau);
        let submitted = false;
        answerText.style.display = revealed ? 'block' : 'none';
        revealButton.disabled = revealed;
        for (const action of [okButton, errorButton]) {
            action.style.display = revealed && !answered ? 'inline-flex' : 'none';
            action.disabled = !revealed || answered;
        }

        revealButton.onclick = () => {
            revealed = true;
            revealedLevels.add(niveau);
            answerText.style.display = 'block';
            for (const action of [okButton, errorButton]) {
                action.style.display = 'inline-flex';
                action.disabled = false;
            }
            revealButton.disabled = true;
        };

        function submitAnswer(correct) {
            if (!revealed || submitted || answeredLevels.has(niveau) || currentIndex !== selectedIndex) return;
            const currentQuiz = JSON.parse(localStorage.getItem('currentQuiz'));
            if (!currentQuiz) {
                showDialog('Veuillez démarrer le quiz depuis la page principale.');
                return;
            }
            submitted = true;
            answeredLevels.add(niveau);
            answers.push({
                niveau,
                question: currentQuestion.querySelector('.question-text').innerHTML,
                points: correct ? niveau : 0
            });
            const completed = answers.length === levelButtons.length;
            const moduleDetail = {
                module: moduleName,
                niveau,
                question: answers[answers.length - 1].question,
                answers,
                completed,
                points: answers.reduce((total, answer) => total + answer.points, 0)
            };
            currentQuiz.detail ||= [];
            const index = currentQuiz.detail.findIndex(item => item.module === moduleName);
            if (index === -1) currentQuiz.detail.push(moduleDetail);
            else currentQuiz.detail[index] = moduleDetail;
            currentQuiz.nextModuleUrl = completed ? nextAvailableModule(currentQuiz, moduleName) : window.location.pathname;
            localStorage.setItem('currentQuiz', JSON.stringify(currentQuiz));
            refreshModuleLinks(currentQuiz);
            if (completed) {
                document.querySelector('#module-complete a').href = currentQuiz.nextModuleUrl;
            }
            showCurrentQuestion();
        }

        okButton.onclick = () => submitAnswer(true);
        errorButton.onclick = () => submitAnswer(false);
    }

    levelButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (answeredLevels.size < levelButtons.length) showCurrentQuestion(index);
        });
    });
    showCurrentQuestion();
}

initModulePage();
