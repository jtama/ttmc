function read(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

export const loadQuiz = () => read('currentQuiz', null);
export const loadLeaderboard = () => read('leaderboard', []);
export const currentPlayer = () => localStorage.getItem('currentPlayer');
export const answeredModules = (quiz = loadQuiz()) => new Set(
    (quiz?.detail || []).filter(answer => answer.completed !== false).map(answer => answer.module)
);
export const quizScore = quiz => (quiz?.detail || []).reduce((score, answer) => score + (answer.points || 0), 0);

function saveQuiz(quiz) {
    localStorage.setItem('currentQuiz', JSON.stringify(quiz));
}

export function startQuiz(playerName, nextModuleUrl) {
    saveQuiz({playerName, quizId: Date.now(), nextModuleUrl, detail: [], chosenLevels: {}});
}

export function chosenLevel(module) {
    return loadQuiz()?.chosenLevels?.[module];
}

export function chooseLevel(module, index) {
    const quiz = loadQuiz();
    if (!quiz || answeredModules(quiz).has(module)) return;
    quiz.chosenLevels = {...quiz.chosenLevels, [module]: index};
    saveQuiz(quiz);
}

export function recordAnswer(answer) {
    const quiz = loadQuiz();
    if (!quiz || answeredModules(quiz).has(answer.module)) return;
    quiz.detail = [...(quiz.detail || []).filter(item => item.module !== answer.module), {...answer, completed: true}];
    saveQuiz(quiz);
}

export function setNextModuleUrl(url) {
    const quiz = loadQuiz();
    if (!quiz) return;
    quiz.nextModuleUrl = url;
    saveQuiz(quiz);
}

export function finishQuiz() {
    const quiz = loadQuiz();
    if (!quiz) return 0;
    const score = quizScore(quiz);
    localStorage.setItem('currentPlayer', quiz.playerName);
    localStorage.setItem('leaderboard', JSON.stringify([...loadLeaderboard(), {playerName: quiz.playerName, score}]));
    localStorage.removeItem('currentQuiz');
    return score;
}

export function resetAll() {
    ['currentQuiz', 'currentPlayer', 'leaderboard'].forEach(key => localStorage.removeItem(key));
}
