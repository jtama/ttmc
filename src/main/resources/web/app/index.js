import hljs from 'highlight.js';
import 'highlight.js/scss/default.scss';
import './back-to-school.scss';
import {initModuleMenu, leaveAnsweredModule} from './navigation';
import {initStartQuizPage} from './start-quiz';
import {initModulePage} from './module';
import {initLeaderboardPage} from './leaderboard';
import {init404Page} from './404';

hljs.highlightAll();

// Each page initializer does nothing when its elements are absent from the current page.
if (!leaveAnsweredModule()) {
    initModuleMenu();
    initStartQuizPage();
    initModulePage();
    initLeaderboardPage();
    init404Page();
}

// Pages restored from the back/forward cache do not run their scripts again.
window.addEventListener('pageshow', event => {
    if (event.persisted && !leaveAnsweredModule()) initModuleMenu();
});
