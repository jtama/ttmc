import hljs from 'highlight.js';
import 'highlight.js/scss/default.scss';

hljs.highlightAll();


function redirectToNextModuleIfQuizInProgress() {
    // Only perform redirection logic on the homepage.
    if (!window.location.pathname.includes('leaderboard')) {
        const currentQuizJSON = localStorage.getItem('currentQuiz');
        if (currentQuizJSON) {
            const currentQuiz = JSON.parse(currentQuizJSON);
            if (currentQuiz.nextModuleUrl && currentQuiz.nextModuleUrl !== window.location.pathname) {
                window.location.href = currentQuiz.nextModuleUrl;
            }
        }
    }
}

window.common = {
    redirectToNextModuleIfQuizInProgress: redirectToNextModuleIfQuizInProgress,
}