import {showDialog} from "./dialog";

function initModulePage() {
    const levelButtons = Array.from(document.querySelectorAll('.level-btn'));
    if (!levelButtons.length) return;

    const moduleName = document.body.getAttribute('data-page-title') || document.title;
    const nextModule = document.body.getAttribute('data-next-module');
    const quiz = JSON.parse(localStorage.getItem('currentQuiz'));
    const detail = quiz?.detail?.find(item => item.module === moduleName);
    const answers = detail?.answers || [];
    let currentIndex = answers.length;
    let currentQuestion = null;

    function showCurrentQuestion() {
        levelButtons.forEach((button, index) => {
            button.disabled = index !== currentIndex;
            button.classList.toggle('is-answered', index < currentIndex);
            button.classList.toggle('is-active', index === currentIndex);
            button.setAttribute('aria-pressed', String(index === currentIndex));
        });
        if (currentQuestion) currentQuestion.style.display = 'none';
        if (currentIndex >= levelButtons.length) {
            document.getElementById('module-complete').hidden = false;
            return;
        }

        const button = levelButtons[currentIndex];
        currentQuestion = document.getElementById(`question-${button.dataset.index}`);
        currentQuestion.style.display = 'block';
        const revealButton = currentQuestion.querySelector('.show-answer-btn');
        const answerText = currentQuestion.querySelector('.answer-text');
        const okButton = currentQuestion.querySelector('.ok-btn');
        const errorButton = currentQuestion.querySelector('.error-btn');
        let revealed = false;
        let submitted = false;

        revealButton.onclick = () => {
            revealed = true;
            answerText.style.display = 'block';
            for (const action of [okButton, errorButton]) {
                action.style.display = 'inline-flex';
                action.disabled = false;
            }
            revealButton.disabled = true;
        };

        function submitAnswer(correct) {
            if (!revealed || submitted) return;
            const currentQuiz = JSON.parse(localStorage.getItem('currentQuiz'));
            if (!currentQuiz) {
                showDialog('Veuillez démarrer le quiz depuis la page principale.');
                return;
            }
            submitted = true;
            const niveau = Number(okButton.dataset.points);
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
            currentQuiz.nextModuleUrl = completed && nextModule ? nextModule : window.location.pathname;
            localStorage.setItem('currentQuiz', JSON.stringify(currentQuiz));
            currentIndex++;
            showCurrentQuestion();
        }

        okButton.onclick = () => submitAnswer(true);
        errorButton.onclick = () => submitAnswer(false);
    }

    showCurrentQuestion();
}

initModulePage();
