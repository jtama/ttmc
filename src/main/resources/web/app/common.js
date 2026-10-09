import hljs from 'highlight.js';
import 'highlight.js/scss/default.scss';
import {completedModules, refreshModuleLinks} from './module-progress';

hljs.highlightAll();

function normalizePath(pathname) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function markCurrentModuleLink() {
    const currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll('[data-module-link]').forEach(link => {
        const linkPath = normalizePath(new URL(link.href, window.location.href).pathname);
        link.classList.toggle('current', linkPath === currentPath);
    });
}

function initModuleNavigation() {
    markCurrentModuleLink();
    refreshModuleLinks(JSON.parse(localStorage.getItem('currentQuiz')));

    document.querySelectorAll('[data-module-link]').forEach(link => {
        link.addEventListener('click', event => {
            const currentQuizJSON = localStorage.getItem('currentQuiz');
            const currentQuiz = currentQuizJSON ? JSON.parse(currentQuizJSON) : null;
            if (completedModules(currentQuiz).has(link.dataset.moduleTitle)) {
                event.preventDefault();
                return;
            }
            document.querySelectorAll('[data-module-link].current').forEach(currentLink => {
                currentLink.classList.remove('current');
            });
            link.classList.add('current');

            if (!currentQuizJSON) return;

            const targetUrl = new URL(link.href, window.location.href);
            currentQuiz.nextModuleUrl = targetUrl.pathname;
            localStorage.setItem('currentQuiz', JSON.stringify(currentQuiz));
        });
    });
}

async function redirectToNextModuleIfQuizInProgress() {
    // A quiz is resumed only when the player explicitly visits the homepage.
    if (!document.getElementById('start-quiz-btn')) return;

    const currentQuizJSON = localStorage.getItem('currentQuiz');
    if (!currentQuizJSON) return;

    let currentQuiz;
    try {
        currentQuiz = JSON.parse(currentQuizJSON);
    } catch {
        localStorage.removeItem('currentQuiz');
        return;
    }

    if (!currentQuiz.nextModuleUrl) return;

    const nextModuleUrl = new URL(currentQuiz.nextModuleUrl, window.location.origin);
    if (nextModuleUrl.origin !== window.location.origin) {
        localStorage.removeItem('currentQuiz');
        return;
    }

    try {
        const response = await fetch(nextModuleUrl.pathname);
        if (!response.ok) {
            localStorage.removeItem('currentQuiz');
            return;
        }

        if (normalizePath(nextModuleUrl.pathname) !== normalizePath(window.location.pathname)) {
            window.location.href = nextModuleUrl.pathname;
        }
    } catch {
        // Keep the current page usable when the server is temporarily unavailable.
    }
}

window.common = {
    initModuleNavigation: initModuleNavigation,
    redirectToNextModuleIfQuizInProgress: redirectToNextModuleIfQuizInProgress,
}
