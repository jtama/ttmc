import {answeredModules, finishQuiz, loadQuiz, setNextModuleUrl} from './quiz-state';

const moduleLinks = () => Array.from(document.querySelectorAll('[data-module-link]'));
const normalizePath = path => path.replace(/\/+$/, '') || '/';
const linkPath = link => new URL(link.href, window.location.href).pathname;

export function currentModuleLink() {
    return moduleLinks().find(link => normalizePath(linkPath(link)) === normalizePath(window.location.pathname));
}

export function nextModuleUrl() {
    const links = moduleLinks();
    const current = links.indexOf(currentModuleLink());
    const ordered = [...links.slice(current + 1), ...links.slice(0, current + 1)];
    const completed = answeredModules();
    const next = ordered.find(link => !completed.has(link.dataset.moduleTitle));
    if (next) return linkPath(next);
    finishQuiz();
    return document.body.dataset.leaderboardUrl;
}

export function leaveAnsweredModule() {
    const current = currentModuleLink();
    if (!current || !answeredModules().has(current.dataset.moduleTitle)) return false;
    const next = nextModuleUrl();
    setNextModuleUrl(next);
    window.location.href = next;
    return true;
}

export function initModuleMenu() {
    const completed = answeredModules();
    const current = currentModuleLink();
    moduleLinks().forEach(link => {
        const locked = completed.has(link.dataset.moduleTitle);
        link.classList.toggle('current', link === current);
        link.classList.toggle('is-completed', locked);
        link.setAttribute('aria-disabled', String(locked));
        if (locked) link.setAttribute('tabindex', '-1');
        else link.removeAttribute('tabindex');
        if (link.dataset.navigationInitialized) return;
        link.dataset.navigationInitialized = 'true';
        link.addEventListener('click', event => {
            if (answeredModules().has(link.dataset.moduleTitle)) event.preventDefault();
            else if (loadQuiz()) setNextModuleUrl(linkPath(link));
        });
    });
    if (current && loadQuiz()) setNextModuleUrl(linkPath(current));
}
