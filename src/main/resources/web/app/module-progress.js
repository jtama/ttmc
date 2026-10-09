export function completedModules(quiz) {
    return new Set((quiz?.detail || [])
        .filter(detail => detail.completed !== false)
        .map(detail => detail.module));
}

export function refreshModuleLinks(quiz) {
    const completed = completedModules(quiz);
    document.querySelectorAll('[data-module-link]').forEach(link => {
        const locked = completed.has(link.dataset.moduleTitle);
        link.classList.toggle('is-completed', locked);
        link.setAttribute('aria-disabled', String(locked));
        if (locked) link.setAttribute('tabindex', '-1');
        else link.removeAttribute('tabindex');
    });
}

export function nextAvailableModule(quiz, moduleName) {
    const completed = completedModules(quiz);
    const links = Array.from(document.querySelectorAll('[data-module-link]'));
    const current = links.findIndex(link => link.dataset.moduleTitle === moduleName);
    const ordered = [...links.slice(current + 1), ...links.slice(0, current + 1)];
    const next = ordered.find(link => !completed.has(link.dataset.moduleTitle));
    return next ? new URL(next.href, window.location.href).pathname
        : document.body.getAttribute('data-leaderboard-url');
}
