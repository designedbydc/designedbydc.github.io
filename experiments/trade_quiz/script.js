// Import leaderboard and challenge functionality
import {
    loadLeaderboard,
    addToLeaderboard,
    showLeaderboard,
    addLeaderboardButton,
    showChallengeModal,
    showChallengeInfo,
    checkForChallenge,
    isChallengeMode,
    challengeData,
    leaderboard
} from './leaderboard.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const difficultyContainer = document.getElementById('difficulty-container');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizMainContainer = document.getElementById('quiz-main-container');
    const loadingContainer = document.getElementById('loading-container');
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const quizContainer = document.getElementById('quiz-container');
    const scoreElement = document.getElementById('score');
    const currentQuestionElement = document.getElementById('current-question');
    const currentDifficultyElement = document.getElementById('current-difficulty');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const backgroundMusic = document.getElementById('background-music');
    const thinkingMusicContainer = document.getElementById('thinking-music-container');
    
    // Add new DOM elements
    const resumeQuizContainer = document.getElementById('resume-quiz-container');
    const resumeQuizBtn = document.getElementById('resume-quiz-btn');
    const resumeLevel = document.getElementById('resume-level');
    const resumeScore = document.getElementById('resume-score');
    const bestScoresPreview = document.getElementById('best-scores-preview');
    const bestScoresList = document.getElementById('best-scores-list');
    
    // Initialize
    initBadges();
    preloadSoundEffects();
    addSoundToggle();
    addAnimationToggle();
    addAnimationStyles();
    applyDarkMode();
    
    // Load leaderboard
    loadLeaderboard();
    
    // Check for challenge
    checkForChallenge();
    
    // Add leaderboard button
    addLeaderboardButton();
    
    // Check for resume state
    checkForResumeState();
    
    // Display best scores preview
    displayBestScores();
    
    // Event listeners
    startQuizBtn.addEventListener('click', () => {
        const traderName = document.getElementById('trader-name').value.trim();
        if (traderName) {
            localStorage.setItem('traderName', traderName);
            initQuiz();
        } else {
            alert('Please enter your name to start the quiz.');
        }
    });
    
    // Add keyboard navigation
    setupKeyboardNavigation();
    document.addEventListener('keydown', handleGlobalKeyboardNavigation);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        applyDarkMode();
    });
});

// Challenge variables
// Removing duplicate declarations since these variables are already defined elsewhere
// let isChallengeMode = false;
// let challengeData = null;

// Removing duplicate functions since they're already imported from leaderboard.js
// Function to generate a challenge code
// function generateChallengeCode() {
//     // Create a challenge object with current quiz state
//     const challenge = {
//         playerName: localStorage.getItem('traderName') || 'Anonymous',
//         score: score,
//         questionsAnswered: currentQuestionIndex,
//         timestamp: new Date().getTime()
//     };
//     
//     // Convert to base64 string
//     const challengeStr = JSON.stringify(challenge);
//     const challengeCode = btoa(challengeStr);
//     
//     return challengeCode;
// }

// Function to parse a challenge code
// function parseChallengeCode(code) {
//     try {
//         const challengeStr = atob(code);
//         const challenge = JSON.parse(challengeStr);
//         
//         // Validate challenge data
//         if (!challenge.playerName || !challenge.score || !challenge.questionsAnswered || !challenge.timestamp) {
//             throw new Error('Invalid challenge data');
//         }
//         
//         return challenge;
//     } catch (e) {
//         console.error('Error parsing challenge code:', e);
//         return null;
//     }
// }

// Function to create a shareable challenge link
// function createChallengeLink() {
//     const challengeCode = generateChallengeCode();
//     const url = new URL(window.location.href);
//     url.searchParams.set('challenge', challengeCode);
//     return url.toString();
// }

// Function to show challenge modal
// function showChallengeModal() {
//     // Create modal for challenge
//     const modal = document.createElement('div');
//     modal.id = 'challenge-modal';
//     modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
//     modal.setAttribute('role', 'dialog');
//     modal.setAttribute('aria-modal', 'true');
//     modal.setAttribute('aria-labelledby', 'challenge-title');
//     
//     const challengeLink = createChallengeLink();
//     
//     modal.innerHTML = `
//         <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-lg">
//             <div class="flex justify-between items-center mb-4">
//                 <h3 id="challenge-title" class="text-xl font-bold">Challenge a Friend</h3>
//                 <button id="close-challenge" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
//                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
//                     </svg>
//                 </button>
//             </div>
//             
//             <p class="mb-4">Share this link with a friend to challenge them to beat your score of <strong>${score}</strong>!</p>
//             
//             <div class="flex mb-4">
//                 <input id="challenge-link" type="text" value="${challengeLink}" readonly class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
//                 <button id="copy-challenge" class="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
//                     Copy
//                 </button>
//             </div>
//             
//             <div class="space-y-2">
//                 <button id="share-whatsapp" class="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center">
//                     <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
//                     </svg>
//                     Share on WhatsApp
//                 </button>
//                 
//                 <button id="share-twitter" class="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center">
//                     <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
//                     </svg>
//                     Share on Twitter
//                 </button>
//             </div>
//             
//             <button id="dismiss-challenge" class="mt-6 w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
//                 Close
//             </button>
//         </div>
//     `;
//     
//     document.body.appendChild(modal);
//     
//     // Add event listeners
//     document.getElementById('close-challenge').addEventListener('click', () => {
//         modal.remove();
//     });
//     
//     document.getElementById('dismiss-challenge').addEventListener('click', () => {
//         modal.remove();
//     });
//     
//     // Copy challenge link
//     document.getElementById('copy-challenge').addEventListener('click', () => {
//         const linkInput = document.getElementById('challenge-link');
//         linkInput.select();
//         document.execCommand('copy');
//         
//         // Show copied message
//         const copyButton = document.getElementById('copy-challenge');
//         const originalText = copyButton.textContent;
//         copyButton.textContent = 'Copied!';
//         setTimeout(() => {
//             copyButton.textContent = originalText;
//         }, 2000);
//     });
//     
//     // Share on WhatsApp
//     document.getElementById('share-whatsapp').addEventListener('click', () => {
//         const text = `I scored ${score} points in the Stock Market Quiz! Can you beat my score? Take the challenge: `;
//         const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + challengeLink)}`;
//         window.open(whatsappUrl, '_blank');
//     });
//     
//     // Share on Twitter
//     document.getElementById('share-twitter').addEventListener('click', () => {
//         const text = `I scored ${score} points in the Stock Market Quiz! Can you beat my score? Take the challenge: `;
//         const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + challengeLink)}`;
//         window.open(twitterUrl, '_blank');
//     });
//     
//     // Close on Escape key
//     modal.addEventListener('keydown', (event) => {
//         if (event.key === 'Escape') {
//             modal.remove();
//         }
//     });
//     
//     // Close on outside click
//     modal.addEventListener('click', (event) => {
//         if (event.target === modal) {
//             modal.remove();
//         }
//     });
//     
//     // Focus the dismiss button
//     document.getElementById('dismiss-challenge').focus();
// }

// Function to show challenge info
// function showChallengeInfo(challenge) {
//     // Create challenge info container
//     const infoContainer = document.createElement('div');
//     infoContainer.className = 'mb-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg';
//     
//     // Calculate how long ago the challenge was created
//     const now = new Date().getTime();
//     const challengeTime = challenge.timestamp;
//     const timeDiff = now - challengeTime;
//     const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
//     const daysAgo = Math.floor(hoursAgo / 24);
//     
//     let timeAgo = '';
//     if (daysAgo > 0) {
//         timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
//     } else if (hoursAgo > 0) {
//         timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
//     } else {
//         timeAgo = 'just now';
//     }
//     
//     infoContainer.innerHTML = `
//         <h3 class="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">Challenge from ${challenge.playerName}</h3>
//         <p class="text-purple-700 dark:text-purple-400">
//             ${challenge.playerName} scored <strong>${challenge.score}</strong> points 
//             by answering <strong>${challenge.questionsAnswered}</strong> questions ${timeAgo}.
//             Can you beat their score?
//         </p>
//     `;
//     
//     // Add to difficulty container
//     const difficultyContainer = document.getElementById('difficulty-container');
//     difficultyContainer.insertBefore(infoContainer, difficultyContainer.firstChild);
// }

// Function to check for challenge in URL
// function checkForChallenge() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const challengeCode = urlParams.get('challenge');
//     
//     if (challengeCode) {
//         const challenge = parseChallengeCode(challengeCode);
//         if (challenge) {
//             // Store challenge data
//             challengeData = challenge;
//             isChallengeMode = true;
//             
//             // Show challenge info
//             showChallengeInfo(challenge);
//             
//             // Clean URL
//             const url = new URL(window.location.href);
//             url.searchParams.delete('challenge');
//             window.history.replaceState({}, document.title, url.toString());
//         }
//     }
// }

function showQuizCompletion() {
    // Calculate total questions and accuracy
    const totalQuestions = currentQuestionIndex;
    const accuracy = totalQuestions > 0 ? Math.round((score / (totalQuestions * 10)) * 100) : 0;
    
    // Get player name
    const playerName = localStorage.getItem('traderName') || 'Anonymous';
    
    // Add to leaderboard if score is greater than 0
    let leaderboardPosition = 0;
    let leaderboardMessage = '';
    
    if (score > 0) {
        leaderboardPosition = addToLeaderboard(playerName, score, totalQuestions, accuracy);
        
        if (leaderboardPosition === 1) {
            leaderboardMessage = `<p class="text-green-600 dark:text-green-400 font-bold mb-4">🎉 Congratulations! You're #1 on the leaderboard!</p>`;
        } else {
            leaderboardMessage = `<p class="text-blue-600 dark:text-blue-400 mb-4">You're #${leaderboardPosition} on the leaderboard!</p>`;
        }
    }
    
    // Create challenge result message if in challenge mode
    let challengeResultMessage = '';
    if (isChallengeMode && challengeData) {
        if (score > challengeData.score) {
            challengeResultMessage = `
                <div class="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
                    <p class="text-green-700 dark:text-green-400">
                        🎉 You beat ${challengeData.playerName}'s score of ${challengeData.score}!
                    </p>
                </div>
            `;
        } else if (score === challengeData.score) {
            challengeResultMessage = `
                <div class="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mb-4">
                    <p class="text-yellow-700 dark:text-yellow-400">
                        You tied with ${challengeData.playerName}'s score of ${challengeData.score}!
                    </p>
                </div>
            `;
        } else {
            challengeResultMessage = `
                <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg mb-4">
                    <p class="text-red-700 dark:text-red-400">
                        You scored ${score}, which is ${challengeData.score - score} points less than ${challengeData.playerName}'s score of ${challengeData.score}.
                    </p>
                </div>
            `;
        }
    }
    
    // Create completion container
    const completionContainer = document.createElement('div');
    completionContainer.className = 'text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg';
    completionContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Quiz Completed!</h2>
        
        ${challengeResultMessage}
        ${leaderboardMessage}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 class="font-bold text-lg text-blue-700 dark:text-blue-400">Final Score</h3>
                <p class="text-3xl font-bold">${score}</p>
            </div>
            
            <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 class="font-bold text-lg text-purple-700 dark:text-purple-400">Questions Answered</h3>
                <p class="text-3xl font-bold">${totalQuestions}</p>
            </div>
            
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 class="font-bold text-lg text-green-700 dark:text-green-400">Accuracy</h3>
                <p class="text-3xl font-bold">${accuracy}%</p>
            </div>
            
            <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 class="font-bold text-lg text-red-700 dark:text-red-400">Incorrect Answers</h3>
                <p class="text-3xl font-bold">${incorrectAnswers.length}</p>
            </div>
        </div>
        
        <div class="flex flex-wrap justify-center gap-3 mb-6">
            <button id="challenge-friend-btn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                Challenge a Friend
            </button>
            
            <button id="view-leaderboard-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                View Leaderboard
            </button>
            
            <button id="review-incorrect-btn" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors ${incorrectAnswers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                Review Incorrect Answers
            </button>
            
            <button id="restart-quiz-btn" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Restart Quiz
            </button>
        </div>
    `;
    
    // Clear quiz container and add completion container
    quizContainer.innerHTML = '';
    quizContainer.appendChild(completionContainer);
    
    // Add event listeners
    document.getElementById('challenge-friend-btn').addEventListener('click', () => {
        showChallengeModal();
    });
    
    document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
        showLeaderboard();
    });
    
    document.getElementById('review-incorrect-btn').addEventListener('click', () => {
        if (incorrectAnswers.length > 0) {
            showIncorrectAnswers();
        }
    });
    
    document.getElementById('restart-quiz-btn').addEventListener('click', () => {
        resetQuiz();
        showDifficultySelection();
    });
}

// ... existing code ...