document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Raw localStorage.getItem("currentQuiz"):', localStorage.getItem('currentQuiz'));

    const okButtons = document.querySelectorAll('.ok-btn');
    const errorButtons = document.querySelectorAll('.error-btn');
    const nextModule = document.body.getAttribute('data-next-module');
    const finalScoreElement = document.getElementById('final-score');
    const playerNameElement = document.getElementById('player-name-display');
    const startQuizButton = document.getElementById('start-quiz-btn');
    const playerNameInput = document.getElementById('player-name');
    const leaderboardElement = document.getElementById('leaderboard-list');

    // Leaderboard page logic
    if (leaderboardElement) {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending

            const currentPlayer = localStorage.getItem('currentPlayer');
        
            leaderboardElement.innerHTML = ''; // Clear existing list
            leaderboard.slice(0, 25).forEach((entry, index) => { // Limit to 25 entries
                const tr = document.createElement('tr');
                if (entry.playerName === currentPlayer) {
                    tr.classList.add('current-player');
                }            const th = document.createElement('th');
            th.setAttribute('scope', 'row');
            th.textContent = index + 1;
            const tdName = document.createElement('td');
            tdName.textContent = entry.playerName;
            const tdScore = document.createElement('td');
            tdScore.textContent = entry.score;

            tr.appendChild(th);
            tr.appendChild(tdName);
            tr.appendChild(tdScore);
            leaderboardElement.appendChild(tr);
        });
    }

    // Start Quiz button logic
    if (startQuizButton) {
        startQuizButton.addEventListener('click', (e) => {
            e.preventDefault();
            const playerName = playerNameInput.value;
            if (playerName) {
                console.log('Starting quiz for player:', playerName);
                const newQuizData = {
                    playerName: playerName,
                    score: 0,
                    quizId: Date.now() // Unique ID for this quiz session
                };
                localStorage.setItem('currentQuiz', JSON.stringify(newQuizData));
                console.log('localStorage.getItem("currentQuiz") after set on index page:', localStorage.getItem('currentQuiz'));
                window.location.href = startQuizButton.href;
            } else {
                alert('Please enter your name.');
            }
        });
    }

    // Trigger Start Quiz button on Enter key press in player name input
    if (playerNameInput && startQuizButton) {
        playerNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default form submission
                startQuizButton.click(); // Programmatically click the button
            }
        });
    }

    // Final Score page logic
    if (finalScoreElement) {
        const currentQuizData = JSON.parse(localStorage.getItem('currentQuiz')); // Retrieve here
        if (currentQuizData) {
            console.log('Final score page. Current quiz data from localStorage:', currentQuizData);
            finalScoreElement.textContent = currentQuizData.score;
            if (playerNameElement) {
                playerNameElement.textContent = currentQuizData.playerName;
            }

            // Save player name for leaderboard highlighting
        localStorage.setItem('currentPlayer', currentQuizData.playerName);

        // Add current quiz data to leaderboard
            const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            leaderboard.push({
                playerName: currentQuizData.playerName,
                score: currentQuizData.score
            });
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

            localStorage.removeItem('currentQuiz'); // Clear current quiz session
            console.log('Current quiz data removed from localStorage.');
        }
    }

    // OK/Error buttons logic (on module pages)
    okButtons.forEach(button => {
        console.log('Attaching event listener to OK button:', button);
        button.addEventListener('click', () => {
            let currentQuizData = JSON.parse(localStorage.getItem('currentQuiz')); // Retrieve here
            console.log('OK button clicked!');
            if (currentQuizData) {
                const points = parseInt(button.getAttribute('data-points'));
                console.log('OK button clicked. Points:', points);
                currentQuizData.score += points;
                console.log('New score:', currentQuizData.score);
                localStorage.setItem('currentQuiz', JSON.stringify(currentQuizData));
                console.log('Current quiz data saved to localStorage.');
                window.location.href = nextModule;
            } else {
                console.log('currentQuizData is null. Cannot process click.');
                alert('Please start the quiz from the main page.');
            }
        });
    });

    errorButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Error button clicked!');
            window.location.href = nextModule;
        });
    });
});