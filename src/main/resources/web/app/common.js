import hljs from 'highlight.js';
import 'highlight.js/scss/default.scss';

hljs.highlightAll();

function normalizePath(pathname) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function initModuleNavigation() {
    document.querySelectorAll('[data-module-link]').forEach(link => {
        link.addEventListener('click', () => {
            const currentQuizJSON = localStorage.getItem('currentQuiz');
            if (!currentQuizJSON) return;

            const targetUrl = new URL(link.href, window.location.href);
            const currentQuiz = JSON.parse(currentQuizJSON);
            currentQuiz.nextModuleUrl = targetUrl.pathname;
            localStorage.setItem('currentQuiz', JSON.stringify(currentQuiz));
        });
    });
}

function redirectToNextModuleIfQuizInProgress() {
    // Only perform redirection logic on the homepage.
    if (!window.location.pathname.includes('leaderboard')) {
        const currentQuizJSON = localStorage.getItem('currentQuiz');
        if (currentQuizJSON) {
            const currentQuiz = JSON.parse(currentQuizJSON);
            if (currentQuiz.nextModuleUrl && normalizePath(currentQuiz.nextModuleUrl) !== normalizePath(window.location.pathname)) {
                window.location.href = currentQuiz.nextModuleUrl;
            }
        }
    }
}

window.common = {
    initModuleNavigation: initModuleNavigation,
    redirectToNextModuleIfQuizInProgress: redirectToNextModuleIfQuizInProgress,
}
