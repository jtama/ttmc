export function init404Page() {
    const responseButton = document.querySelector('.btn-404-answer');
    const answer = document.getElementById('answer-404');
    if (!responseButton || !answer) return;

    responseButton.addEventListener('click', () => {
        answer.hidden = false;
        responseButton.setAttribute('aria-expanded', 'true');
        responseButton.disabled = true;
    });
}
