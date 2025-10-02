loadScript('js/dialog.js');

const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
const isLeaderboardPage = window.location.pathname.endsWith('leaderboard.html');
const isFinalScorePage = window.location.pathname.endsWith('final-score.html');

if (isIndexPage) {
    loadScript('js/start-quiz.js');
} else if (isLeaderboardPage) {
    loadScript('js/leaderboard.js');
} else if (isFinalScorePage) {
    loadScript('js/final-score.js');
} else {
    loadScript('js/module.js');
}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
}
