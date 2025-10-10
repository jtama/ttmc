import {showDialog} from "./dialog";
// --- Module Page Logic ---
function initModulePage(nextModule, allModules) {
    const levelButtons = document.querySelectorAll('.level-btn');
    const questionContainer = document.getElementById('question-container');
    if (!levelButtons.length || !questionContainer) return;

    // Objet pour tracker l'état de révélation (passé par référence)
    const state = { answerRevealed: false, currentQuestionElement: null };

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
        const template = document.getElementById('already-answered-template').content.cloneNode(true);
        template.querySelector('.niveau').textContent = existingAnswer.niveau;
        template.querySelector('.points').textContent = existingAnswer.points;
        template.querySelector('.next-btn').onclick = () => window.location.href = nextModule;
        questionContainer.innerHTML = '';
        questionContainer.appendChild(template);
        questionContainer.style.display = '';
        return;
    }

    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => showQuestion(btn, questionContainer, nextModule, levelButtons, state, allModules));
    });
}

function showQuestion(btn, container, nextModule, levelButtons, state, allModules) {
    const idx = parseInt(btn.getAttribute('data-index'));
    const questionElement = document.getElementById(`question-${idx}`);
    if (!questionElement) return;

    // Cacher la question précédente si elle existe
    if (state.currentQuestionElement) {
        state.currentQuestionElement.style.display = 'none';
    }

    // Si la réponse n'a pas encore été révélée, permettre le changement de question
    if (!state.answerRevealed) {
        // Réactiver tous les boutons de niveau
        levelButtons.forEach(otherBtn => {
            otherBtn.disabled = false;
            otherBtn.style.opacity = '1';
            otherBtn.style.pointerEvents = 'auto';
            // Mettre en évidence le bouton actuellement sélectionné
            if (otherBtn === btn) {
                otherBtn.style.backgroundColor = '#007bff';
                otherBtn.style.color = 'white';
            } else {
                otherBtn.style.backgroundColor = '';
                otherBtn.style.color = '';
            }
        });
    }

    questionElement.style.display = 'block';
    state.currentQuestionElement = questionElement;

    const showAnswerBtn = questionElement.querySelector('.show-answer-btn');
    const okBtn = questionElement.querySelector('.ok-btn');
    const errorBtn = questionElement.querySelector('.error-btn');
    const answerText = questionElement.querySelector('.answer-text');
    const questionText = questionElement.querySelector('.question-text');

    showAnswerBtn.addEventListener('click', () => {
        // Marquer que la réponse a été révélée
        state.answerRevealed = true;

        // Désactiver tous les autres boutons de niveau maintenant
        levelButtons.forEach(otherBtn => {
            if (otherBtn !== btn) {
                otherBtn.disabled = true;
                otherBtn.style.opacity = '0.5';
                otherBtn.style.pointerEvents = 'none';
            }
        });

        answerText.style.display = 'block';
        okBtn.disabled = false;
        errorBtn.disabled = false;
        showAnswerBtn.disabled = true;
        showAnswerBtn.style.opacity = '0.5';
    });

    okBtn.addEventListener('click', () => handleAnswer(true, parseInt(okBtn.dataset.points), questionText.innerHTML, parseInt(okBtn.dataset.points), nextModule, allModules));
    errorBtn.addEventListener('click', () => handleAnswer(false, 0, questionText.innerHTML, parseInt(okBtn.dataset.points), nextModule, allModules));
}

function handleAnswer(isCorrect, points, question, niveau, nextModule, allModules) {
    let currentQuizData = JSON.parse(localStorage.getItem('currentQuiz'));
    if (!currentQuizData) {
        showDialog('Veuillez démarrer le quiz depuis la page principale.');
        return;
    }
    if (!currentQuizData.detail) currentQuizData.detail = [];

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
    
    if (nextModule) {
        currentQuizData.nextModuleUrl = nextModule;
    } else {
        // No more modules, clear the next module URL
        delete currentQuizData.nextModuleUrl;
    }

    localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
    window.location.href = nextModule;
}

const nextModule = document.body.getAttribute('data-next-module');
const allModules = document.body.getAttribute('data-all-modules') || '[]';
initModulePage(nextModule, allModules);