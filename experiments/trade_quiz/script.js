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
    
    // Level configuration
    const LEVELS = [
        { 
            name: "Gully Investor", 
            questionsRequired: 3,
            theme: {
                primary: '#4CAF50',
                secondary: '#81C784',
                accent: '#2E7D32'
            },
            badge: '🌱',
            description: 'Starting from the streets'
        },
        { 
            name: "Chai Break Trader", 
            questionsRequired: 3,
            theme: {
                primary: '#FF9800',
                secondary: '#FFB74D',
                accent: '#F57C00'
            },
            badge: '☕',
            description: 'Trading between tea breaks'
        },
        { 
            name: "Dabba Trading Master", 
            questionsRequired: 3,
            theme: {
                primary: '#2196F3',
                secondary: '#64B5F6',
                accent: '#1976D2'
            },
            badge: '📦',
            description: 'Master of quick trades'
        },
        { 
            name: "Bazaar Pundit", 
            questionsRequired: 3,
            theme: {
                primary: '#9C27B0',
                secondary: '#BA68C8',
                accent: '#7B1FA2'
            },
            badge: '📊',
            description: 'Market wisdom personified'
        },
        { 
            name: "Dalal Street Veteran", 
            questionsRequired: 3,
            theme: {
                primary: '#F44336',
                secondary: '#E57373',
                accent: '#D32F2F'
            },
            badge: '🎯',
            description: 'Seasoned market player'
        },
        { 
            name: "Sher of Share Market", 
            questionsRequired: 3,
            theme: {
                primary: '#FFC107',
                secondary: '#FFD54F',
                accent: '#FFA000'
            },
            badge: '🦁',
            description: 'King of the market jungle'
        },
        { 
            name: "Trading Titan", 
            questionsRequired: 3,
            theme: {
                primary: '#607D8B',
                secondary: '#90A4AE',
                accent: '#455A64'
            },
            badge: '🏛️',
            description: 'Massive market influence'
        },
        { 
            name: "Crore-pati Portfolio Pro", 
            questionsRequired: 3,
            theme: {
                primary: '#E91E63',
                secondary: '#F06292',
                accent: '#C2185B'
            },
            badge: '💎',
            description: 'Master of wealth creation'
        },
        { 
            name: "Raja of Risk Analysis", 
            questionsRequired: 3,
            theme: {
                primary: '#673AB7',
                secondary: '#9575CD',
                accent: '#512DA8'
            },
            badge: '👑',
            description: 'Supreme risk manager'
        },
        { 
            name: "Hedge Fund Maharathi", 
            questionsRequired: 3,
            theme: {
                primary: '#00BCD4',
                secondary: '#4DD0E1',
                accent: '#0097A7'
            },
            badge: '🏆',
            description: 'Ultimate market warrior'
        }
    ];
    
    // Track if we have active YouTube players
    let activeYouTubePlayer = null;
    let activeThinkingMusicPlayer = null;

    // Initialize quiz state
    let currentQuestionIndex = 0;
    let score = 0;
    let correctAnswers = [];
    let incorrectAnswers = [];
    let reviewMode = false;
    let currentReviewIndex = 0;
    let animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';

    // Track all previously asked questions to prevent repetition - now using localStorage
    let askedQuestions = JSON.parse(localStorage.getItem('askedQuestions') || '[]');
    
    // Track retry attempts to prevent infinite loops
    let retryAttempts = 0;
    const MAX_RETRY_ATTEMPTS = 3;
    const MAX_STORED_QUESTIONS = 500;

    // Track earned badges and best scores
    let earnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
    let bestScores = JSON.parse(localStorage.getItem('bestScores') || '{}');
    let lastQuizState = JSON.parse(localStorage.getItem('lastQuizState') || null);

    // Add hint system variables
    let hintsUsed = 0;
    let currentHint = null;
    const MAX_HINTS = 3; // Maximum hints per quiz

    // Add points system variables
    let basePoints = 100;
    let timeBonus = 0;
    let streakMultiplier = 1;
    let lastPointsEarned = 0;

    // Add review mode variables
    let incorrectQuestions = [];
    let isReviewMode = false;
    let currentReviewIndex = 0;

    // Add sound effect variables
    let soundEffectsEnabled = true;
    const soundEffects = {
        correct: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'),
        incorrect: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'),
        levelUp: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'),
        timerWarning: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alert-quick-chime-766.mp3'),
        timerEnd: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-failure-drum-roll-651.mp3')
    };
    
    // Apply dark mode to all elements by default
    applyDarkMode();

    // Start quiz button handler
    startQuizBtn.addEventListener('click', () => {
        // Get and validate trader name
        const traderNameInput = document.getElementById('trader-name');
        const traderName = traderNameInput.value.trim();
        
        if (!traderName) {
            // Show error if name is empty
            traderNameInput.classList.add('border-red-500');
            const errorMsg = document.createElement('p');
            errorMsg.className = 'text-red-500 text-sm mt-1';
            errorMsg.textContent = 'Please enter your name to start the quiz';
            
            // Remove any existing error message
            const existingError = traderNameInput.parentElement.querySelector('.text-red-500');
            if (existingError) {
                existingError.remove();
            }
            
            traderNameInput.parentElement.appendChild(errorMsg);
            return;
        }
        
        // Store trader name
        localStorage.setItem('traderName', traderName);
        
        // Hide difficulty container and show quiz
        difficultyContainer.classList.add('hidden');
        quizMainContainer.classList.remove('hidden');
        
        // Start fresh quiz
        initQuiz(false);
    });

    // Initialize the quiz
    function initQuiz(isResume = false) {
        // Clean up any YouTube player
        cleanupYouTubePlayer();
        cleanupThinkingMusicPlayer();
        
        if (isResume && lastQuizState) {
            // Restore the last quiz state
            currentLevel = lastQuizState.currentLevel;
            questionsCompletedInLevel = lastQuizState.questionsCompletedInLevel;
            currentQuestionIndex = lastQuizState.currentQuestionIndex;
            score = lastQuizState.score;
        } else {
            // Start fresh
            currentLevel = 0;
            questionsCompletedInLevel = 0;
            currentQuestionIndex = 0;
            score = 0;
        }
        
        missedQuestions = [];
        userPerformance = [];
        consecutiveCorrectAnswers = 0;
        
        // Load asked questions from localStorage
        askedQuestions = JSON.parse(localStorage.getItem('askedQuestions') || '[]');
        
        // Reset retry attempts
        retryAttempts = 0;
        
        scoreElement.textContent = score;
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        updateLevelDisplay();
        
        // Initialize badges display
        initBadges();
        
        // Apply initial theme
        applyLevelTheme(currentLevel);
        
        // Get the next question
        getNextQuestion();
        
        // Preload sound effects
        preloadSoundEffects();
        
        // Add sound toggle to UI
        addSoundToggle();
        
        // Add animation styles
        addAnimationStyles();
        
        // Add animation toggle to UI
        addAnimationToggle();
        
        // Load leaderboard
        loadLeaderboard();
        
        // Add leaderboard button to UI
        addLeaderboardButton();
        
        // Check for challenge in URL
        checkForChallenge();
    }
    
    // Clean up YouTube player
    function cleanupYouTubePlayer() {
        if (activeYouTubePlayer && activeYouTubePlayer.parentNode) {
            activeYouTubePlayer.parentNode.removeChild(activeYouTubePlayer);
            activeYouTubePlayer = null;
        }
    }
    
    // Clean up thinking music player
    function cleanupThinkingMusicPlayer() {
        if (activeThinkingMusicPlayer && activeThinkingMusicPlayer.parentNode) {
            activeThinkingMusicPlayer.parentNode.removeChild(activeThinkingMusicPlayer);
            activeThinkingMusicPlayer = null;
        }
    }

    // Play background music
    function playBackgroundMusic() {
        console.log('Background music disabled');
    }
    
    // Play thinking music while waiting for answer
    function playThinkingMusic() {
        console.log('Thinking music disabled');
    }

    // Check if a question has been asked before
    function isQuestionAskedBefore(question) {
        // Check if the exact same question text exists in our asked questions array
        return askedQuestions.some(askedQuestion => {
            const normalizedNewQuestion = question.question.trim().toLowerCase();
            const normalizedAskedQuestion = askedQuestion.question.trim().toLowerCase();
            
            // Check for high similarity (exact match or very similar)
            return normalizedNewQuestion === normalizedAskedQuestion ||
                   (normalizedNewQuestion.length > 20 && // Only check similarity for longer questions
                    (normalizedNewQuestion.includes(normalizedAskedQuestion) ||
                     normalizedAskedQuestion.includes(normalizedNewQuestion)));
        });
    }

    // Store a new question in history
    function storeAskedQuestion(question) {
        askedQuestions.push(question);
        
        // Remove oldest questions if we exceed the maximum
        if (askedQuestions.length > MAX_STORED_QUESTIONS) {
            askedQuestions = askedQuestions.slice(-MAX_STORED_QUESTIONS);
        }
        
        // Save to localStorage
        localStorage.setItem('askedQuestions', JSON.stringify(askedQuestions));
    }

    // Update the level display
    function updateLevelDisplay() {
        const currentLevelInfo = LEVELS[currentLevel];
        const progressText = `${questionsCompletedInLevel}/${currentLevelInfo.questionsRequired}`;
        currentDifficultyElement.textContent = `${currentLevelInfo.name} (${progressText})`;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${(questionsCompletedInLevel / currentLevelInfo.questionsRequired) * 100}%`;
    }

    // Check if player should advance to next level
    function checkLevelProgression() {
        const currentLevelInfo = LEVELS[currentLevel];
        if (questionsCompletedInLevel >= currentLevelInfo.questionsRequired) {
            if (currentLevel < LEVELS.length - 1) {
                // Show level up message
                showLevelUpMessage();
                currentLevel++;
                questionsCompletedInLevel = 0;
            }
        }
        updateLevelDisplay();
    }

    // Show level up message
    function showLevelUpMessage() {
        const nextLevel = LEVELS[currentLevel + 1];
        feedbackContainer.classList.remove('hidden', 'feedback-incorrect');
        feedbackContainer.classList.add('feedback-correct');
        
        // Award badge for completed level
        awardBadge(currentLevel);
        
        // Trigger confetti effect
        triggerConfetti();
        
        // Show achievement toast with sharing
        showAchievementToast(
            LEVELS[currentLevel].name, 
            `You've mastered the ${LEVELS[currentLevel].name} level!`,
            LEVELS[currentLevel].badge
        );
        
        // Generate and show certificate
        showCertificate(currentLevel);
        
        feedbackText.innerHTML = `
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-4">🎉 Level Complete! 🎉</h3>
                <div class="badge-showcase mb-6">
                    <div class="text-6xl mb-2">${LEVELS[currentLevel].badge}</div>
                    <p class="text-lg">You've earned the ${LEVELS[currentLevel].name} badge!</p>
                </div>
                <p class="text-lg mb-6">Next level: <strong>${nextLevel.name}</strong></p>
                <button id="continue-btn" class="secondary-btn dark-mode py-3 px-8 transition duration-300">
                    Continue Journey
                </button>
                <button id="view-progress" class="text-sm text-gray-500 hover:text-gray-700 mt-4 block w-full">
                    View Progress
                </button>
            </div>
        `;

        // Add event listeners
        setTimeout(() => {
            const continueBtn = document.getElementById('continue-btn');
            const viewProgressBtn = document.getElementById('view-progress');
            
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    feedbackContainer.classList.add('hidden');
                    currentLevel++;
                    questionsCompletedInLevel = 0;
                    applyLevelTheme(currentLevel);
                    updateLevelDisplay();
                    getNextQuestion();
                });
            }
            
            if (viewProgressBtn) {
                viewProgressBtn.addEventListener('click', showProgressSummary);
            }
        }, 100);

        // If all levels are completed, clear the saved state
        if (currentLevel === LEVELS.length - 1) {
            localStorage.removeItem('lastQuizState');
        }
        
        // Play level up sound
        playSound('levelUp');
    }

    // Confetti effect
    function triggerConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    // Show achievement toast
    function showAchievementToast(title, description, icon = '🏆') {
        const toast = document.getElementById('achievement-toast');
        const achievementTitle = document.getElementById('achievement-title');
        const achievementDescription = document.getElementById('achievement-description');
        const achievementIcon = document.getElementById('achievement-icon');

        achievementTitle.textContent = title;
        achievementDescription.textContent = description;
        achievementIcon.textContent = icon;

        toast.classList.remove('hidden');
        toast.classList.add('animate-slide-in');

        setTimeout(() => {
            toast.classList.remove('animate-slide-in');
            toast.classList.add('animate-slide-out');
            setTimeout(() => {
                toast.classList.add('hidden');
                toast.classList.remove('animate-slide-out');
            }, 300);
        }, 3000);
    }

    // Show progress summary with best scores
    function showProgressSummary() {
        const summary = document.getElementById('progress-summary');
        const stats = document.getElementById('progress-stats');
        
        // Calculate current statistics
        const totalQuestions = currentQuestionIndex + 1;
        const accuracy = Math.round((score / totalQuestions) * 100);
        const completedLevels = earnedBadges.length;
        
        // Get best score for current level
        const currentLevelName = LEVELS[currentLevel].name;
        const bestScore = bestScores[currentLevelName];
        
        stats.innerHTML = `
            <div class="space-y-6">
                <div class="space-y-3">
                    <h4 class="font-bold text-lg mb-2">Current Session</h4>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Total Questions:</span>
                        <span class="font-bold">${totalQuestions}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Correct Answers:</span>
                        <span class="font-bold">${score}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Accuracy:</span>
                        <span class="font-bold">${accuracy}%</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Levels Completed:</span>
                        <span class="font-bold">${completedLevels}/10</span>
                    </div>
                </div>
                
                ${bestScore ? `
                    <div class="space-y-3 pt-4 border-t">
                        <h4 class="font-bold text-lg mb-2">Best Score - ${currentLevelName}</h4>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Score:</span>
                            <span class="font-bold">${bestScore.accuracy}%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Achieved:</span>
                            <span class="font-bold">${new Date(bestScore.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        summary.classList.remove('hidden');
        
        // Add close button event listener
        document.getElementById('close-progress').addEventListener('click', () => {
            summary.classList.add('hidden');
        });
    }

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const summary = document.getElementById('progress-summary');
            if (!summary.classList.contains('hidden')) {
                summary.classList.add('hidden');
            }
        }
    });

    // Update getNextQuestion to add transition animation
    async function getNextQuestion() {
        // Add fade-out animation to current question if not first question
        if (currentQuestionIndex > 0) {
            const quizContainer = document.getElementById('quiz-container');
            if (animationsEnabled) {
                quizContainer.classList.add('animate-fade-out');
                
                // Wait for animation to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                quizContainer.classList.remove('animate-fade-out');
            }
        }
        
        showLoading(true);
        
        try {
            // Check if we have a cached question
            if (cachedQuestions && cachedQuestions.length > 0) {
                const nextQuestion = cachedQuestions.shift();
                showQuestion(nextQuestion);
                
                // If we're running low on cached questions, fetch more in the background
                if (cachedQuestions.length < 2) {
                    fetchMoreQuestions();
                }
                
                return;
            }
            
            // Fetch a new question from the API
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `Generate a multiple-choice question about stock market trading or investing concepts. The question should be appropriate for someone at level ${currentQuestionIndex + 1} of knowledge (where 1 is beginner and 10 is expert).
                    
                    Format the response as a valid JSON object with the following structure:
                    {
                        "question": "The question text goes here?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": 0, // Index of the correct answer (0-3)
                        "explanation": "Explanation of why the correct answer is correct"
                    }
                    
                    Make sure the question is challenging but fair, and the explanation is educational.`
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch question from API');
            }
            
            const data = await response.json();
            
            // Validate that we have the expected data structure
            if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                console.error('Invalid API response structure:', data);
                throw new Error('Unexpected API response format');
            }
            
            const content = data.choices[0].message.content;
            
            // Parse the JSON response
            try {
                currentQuestion = JSON.parse(content);
                
                // Validate the parsed question data
                if (!currentQuestion.question || !Array.isArray(currentQuestion.options) || 
                    currentQuestion.options.length !== 4 || typeof currentQuestion.correctAnswer !== 'number' ||
                    !currentQuestion.explanation) {
                    console.error('Invalid question format:', currentQuestion);
                    throw new Error('Question data is missing required fields');
                }
                
                // Show the question immediately without checking for duplicates
                showQuestion(currentQuestion);
            } catch (e) {
                console.error('Question parsing error:', e);
                console.error('Raw content:', content);
                
                // Try to clean up the content and parse it
                try {
                    const cleanContent = content.trim()
                        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')  // Remove control characters
                        .replace(/\n/g, ' ')  // Replace newlines with spaces
                        .replace(/\s+/g, ' '); // Normalize whitespace
                    
                    currentQuestion = JSON.parse(cleanContent);
                    
                    if (!currentQuestion.question || !Array.isArray(currentQuestion.options)) {
                        throw new Error('Invalid question format after cleanup');
                    }
                    
                    showQuestion(currentQuestion);
                    return;
                } catch (cleanupError) {
                    console.error('Failed to clean up response:', cleanupError);
                    throw new Error('Failed to parse question data. The response was not in the expected format.');
                }
            }
        } catch (error) {
            showError(error);
            showLoading(false);
        }
    }
    
    // Function to fetch more questions in the background
    async function fetchMoreQuestions() {
        if (!cachedQuestions) {
            cachedQuestions = [];
        }
        
        try {
            // Fetch a new question from the API
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `Generate a multiple-choice question about stock market trading or investing concepts. The question should be appropriate for someone at level ${currentQuestionIndex + 2} of knowledge (where 1 is beginner and 10 is expert).
                    
                    Format the response as a valid JSON object with the following structure:
                    {
                        "question": "The question text goes here?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": 0, // Index of the correct answer (0-3)
                        "explanation": "Explanation of why the correct answer is correct"
                    }
                    
                    Make sure the question is challenging but fair, and the explanation is educational.`
                }),
            });
            
            if (!response.ok) {
                console.error('Failed to fetch cached question');
                return;
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            const question = JSON.parse(content);
            
            // Validate the question
            if (question.question && Array.isArray(question.options) && 
                question.options.length === 4 && typeof question.correctAnswer === 'number' &&
                question.explanation) {
                cachedQuestions.push(question);
            }
        } catch (error) {
            console.error('Error fetching cached question:', error);
        }
    }

    // Display the current question
    function showQuestion(questionData) {
        currentQuestion = questionData;
        currentHint = null; // Reset current hint
        
        // Update question display
        const questionElement = document.getElementById('question');
        questionElement.textContent = questionData.question;
        
        // Clear previous options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Add animation to question
        if (animationsEnabled) {
            questionElement.classList.add('animate-fade-in');
            // Remove animation class after animation completes
            setTimeout(() => {
                questionElement.classList.remove('animate-fade-in');
            }, 500);
        }
        
        // Add new options with improved contrast
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            // Improved contrast for option buttons
            button.className = 'w-full text-left p-4 rounded-xl transition-colors duration-200 bg-white/15 dark:bg-gray-800/20 hover:bg-white/25 dark:hover:bg-gray-800/30 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white staggered-item';
            
            // Add keyboard shortcut indicator with improved contrast
            const keyboardNumber = index + 1;
            button.innerHTML = `<span class="inline-block w-6 h-6 mr-2 text-xs font-bold text-center rounded-full bg-purple-600/30 dark:bg-purple-500/40 text-purple-900 dark:text-purple-100">${keyboardNumber}</span> ${option}`;
            
            button.onclick = () => checkAnswer(index);
            button.dataset.optionIndex = index;
            optionsContainer.appendChild(button);
        });
        
        // Apply staggered animation to options
        const optionButtons = optionsContainer.querySelectorAll('button');
        animateStaggered(optionButtons, 'animate-slide-in-right', 100);
        
        // Add hint button for questions after level 3 (if hints are available)
        if (currentQuestionIndex >= 3 && hintsUsed < MAX_HINTS) {
            // Create hint container
            const hintContainer = document.createElement('div');
            hintContainer.className = 'mt-4 flex justify-end staggered-item';
            
            // Create hint button with improved contrast
            const hintButton = document.createElement('button');
            hintButton.id = 'hint-button';
            hintButton.className = 'px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center';
            hintButton.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Use Hint (${MAX_HINTS - hintsUsed} left)
            `;
            
            hintButton.onclick = showHint;
            hintContainer.appendChild(hintButton);
            
            // Add hint container after options
            optionsContainer.parentNode.insertBefore(hintContainer, optionsContainer.nextSibling);
            
            // Animate hint button
            setTimeout(() => {
                hintContainer.classList.add('animate-fade-in');
                hintContainer.style.opacity = 1;
            }, optionButtons.length * 100 + 100);
        }
        
        // Add keyboard shortcut tooltip with improved contrast
        if (!localStorage.getItem('keyboardShortcutTipShown')) {
            const tipContainer = document.createElement('div');
            tipContainer.className = 'mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg flex items-center staggered-item';
            tipContainer.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <span>Pro Tip: You can use keys <strong>1-4</strong> on your keyboard to select answers quickly!</span>
                <button id="dismiss-tip" class="ml-auto text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            
            // Add the tip after the options
            optionsContainer.parentNode.insertBefore(tipContainer, optionsContainer.nextSibling);
            
            // Animate tip
            setTimeout(() => {
                tipContainer.classList.add('animate-fade-in');
                tipContainer.style.opacity = 1;
            }, optionButtons.length * 100 + 200);
            
            // Add event listener to dismiss button
            document.getElementById('dismiss-tip').addEventListener('click', () => {
                tipContainer.remove();
                localStorage.setItem('keyboardShortcutTipShown', 'true');
            });
        }
        
        // Hide feedback container
        document.getElementById('feedback-container').classList.add('hidden');
        
        // Start timer for first 6 questions
        if (currentQuestionIndex < 6) {
            startTimer();
        } else {
            // Hide timer for later questions
            const timerElement = document.getElementById('timer');
            if (timerElement && timerElement.parentElement) {
                timerElement.parentElement.classList.add('hidden');
            }
        }
        
        // Add keyboard event listener for answering with number keys
        document.addEventListener('keydown', handleKeyboardAnswer);
    }

    // Handle keyboard shortcuts for answering
    function handleKeyboardAnswer(event) {
        // Only process if we're showing a question and not waiting for next question
        if (!currentQuestion || document.getElementById('feedback-container').classList.contains('hidden') === false) {
            return;
        }
        
        // Check if key pressed is 1-4
        if (event.key >= '1' && event.key <= '4') {
            const optionIndex = parseInt(event.key) - 1;
            
            // Make sure this is a valid option
            if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
                // Remove the event listener to prevent multiple answers
                document.removeEventListener('keydown', handleKeyboardAnswer);
                
                // Highlight the selected option briefly
                const optionButtons = document.querySelectorAll('#options-container button');
                if (optionButtons[optionIndex]) {
                    optionButtons[optionIndex].classList.add('ring-2', 'ring-purple-500');
                    
                    // Small delay to show the highlight before checking answer
                    setTimeout(() => {
                        checkAnswer(optionIndex);
                    }, 200);
                }
            }
        }
    }

    // Start the timer
    function startTimer() {
        // Reset and show timer
        timeLeft = 45;
        const timerElement = document.getElementById('timer');
        timerElement.parentElement.classList.remove('hidden');
        timerElement.textContent = timeLeft + 's';
        
        // Clear any existing interval
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Start the timer
        timerInterval = setInterval(() => {
            timeLeft--;
            
            // Play warning sound when 10 seconds remain
            if (timeLeft === 10) {
                playSound('timerWarning');
            }
            
            // Update timer display
            timerElement.textContent = timeLeft + 's';
            
            // Change color when time is running low
            if (timeLeft <= 10) {
                timerElement.classList.add('text-red-600', 'dark:text-red-400');
            } else {
                timerElement.classList.remove('text-red-600', 'dark:text-red-400');
            }
            
            // Handle time up
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                handleTimeUp();
            }
        }, 1000);
    }

    // Handle when time runs out
    function handleTimeUp() {
        // Play timer end sound
        playSound('timerEnd');
        
        // Disable all option buttons
        const optionsContainer = document.getElementById('options-container');
        const optionButtons = optionsContainer.querySelectorAll('button');
        optionButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('pointer-events-none');
            button.classList.remove('hover:bg-white/25', 'dark:hover:bg-gray-800/30');
        });
        
        // Reset streak
        consecutiveCorrectAnswers = 0;
        streakMultiplier = 1;
        
        // Get correct answer index
        const correctIndex = currentQuestion.correctAnswer;
        
        // Add green background to correct answer
        optionButtons[correctIndex].classList.remove('bg-white/15', 'dark:bg-gray-800/20');
        optionButtons[correctIndex].classList.add('bg-green-600', 'dark:bg-green-700', 'text-white');
        
        // Add explanation below the options
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700';
        
        explanationDiv.innerHTML = `
            <div class="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-center">
                <span class="text-lg font-bold text-yellow-700 dark:text-yellow-300">Time's up!</span>
                <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    No points awarded for this question
                </div>
            </div>
            <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">Explanation:</h3>
            <p class="text-gray-800 dark:text-gray-200">${currentQuestion.explanation}</p>
        `;
        
        // Add a button to proceed to next question
        const nextButton = document.createElement('button');
        nextButton.className = 'mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors';
        nextButton.textContent = 'Next Question';
        nextButton.onclick = () => {
            currentQuestionIndex++;
            document.getElementById('current-question').textContent = currentQuestionIndex + 1;
            
            // Check if we should level up
            checkLevelProgression();
            
            // Get next question
            getNextQuestion();
        };
        
        explanationDiv.appendChild(nextButton);
        optionsContainer.parentNode.appendChild(explanationDiv);
    }

    // Modify checkAnswer to use higher contrast colors
    function checkAnswer(selectedIndex) {
        // Remove keyboard event listener when answer is checked
        document.removeEventListener('keydown', handleKeyboardAnswer);
        
        // Clear timer if it's running
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Get correct answer index
        const correctIndex = currentQuestion.correctAnswer;
        
        const isCorrect = selectedIndex === correctIndex;
        
        // Play sound effect
        playSound(isCorrect ? 'correct' : 'incorrect');
        
        // Track incorrect questions for review
        if (!isCorrect && !isReviewMode) {
            // Store a copy of the current question with the user's answer
            const questionForReview = {
                ...currentQuestion,
                userAnswer: selectedIndex
            };
            incorrectQuestions.push(questionForReview);
        }
        
        // Track user performance
        if (isCorrect) {
            // Calculate points with time bonus and streak multiplier
            calculatePoints();
            
            score += lastPointsEarned;
            document.getElementById('score').textContent = score;
            
            consecutiveCorrectAnswers++;
            if (consecutiveCorrectAnswers >= 3) {
                streakMultiplier = Math.min(3, 1 + (consecutiveCorrectAnswers - 3) * 0.5);
            }
        } else {
            consecutiveCorrectAnswers = 0;
            streakMultiplier = 1;
        }
        
        // Disable all option buttons and remove hover effects
        const optionsContainer = document.getElementById('options-container');
        const optionButtons = optionsContainer.querySelectorAll('button');
        optionButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('pointer-events-none');
            button.classList.remove('hover:bg-white/25', 'dark:hover:bg-gray-800/30');
        });
        
        // Add appropriate styling to selected and correct answers with improved contrast
        if (isCorrect) {
            // If correct, add green background to selected button
            optionButtons[selectedIndex].classList.remove('bg-white/15', 'dark:bg-gray-800/20');
            optionButtons[selectedIndex].classList.add('bg-green-600', 'dark:bg-green-700', 'text-white');
        } else {
            // If incorrect, add red background to selected button
            optionButtons[selectedIndex].classList.remove('bg-white/15', 'dark:bg-gray-800/20');
            optionButtons[selectedIndex].classList.add('bg-red-600', 'dark:bg-red-700', 'text-white');
            
            // Add green background to correct answer
            optionButtons[correctIndex].classList.remove('bg-white/15', 'dark:bg-gray-800/20');
            optionButtons[correctIndex].classList.add('bg-green-600', 'dark:bg-green-700', 'text-white');
            
            // Add explanation below the options with proper dark mode support and improved contrast
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700';
            
            // Add points info if correct
            let pointsInfo = '';
            if (isCorrect) {
                pointsInfo = `
                    <div class="mb-3 p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-center">
                        <span class="text-lg font-bold text-purple-800 dark:text-purple-200">+${lastPointsEarned} points</span>
                        <div class="text-xs text-purple-700 dark:text-purple-300 mt-1">
                            Base: ${basePoints} × Time Bonus: ${timeBonus > 0 ? `+${timeBonus}%` : '0%'} × Streak: ${streakMultiplier.toFixed(1)}x
                        </div>
                    </div>
                `;
            }
            
            explanationDiv.innerHTML = `
                ${pointsInfo}
                <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">Explanation:</h3>
                <p class="text-gray-800 dark:text-gray-200">${currentQuestion.explanation}</p>
            `;
            
            // Add a button to proceed to next question with improved contrast
            const nextButton = document.createElement('button');
            nextButton.className = 'mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors';
            
            if (isReviewMode) {
                // In review mode, show different text based on whether there are more questions to review
                if (currentReviewIndex < incorrectQuestions.length - 1) {
                    nextButton.textContent = 'Next Review Question';
                } else {
                    nextButton.textContent = 'Finish Review';
                }
            } else {
                nextButton.textContent = 'Next Question';
            }
            
            nextButton.onclick = () => {
                if (isReviewMode) {
                    // Move to next review question or finish review
                    currentReviewIndex++;
                    if (currentReviewIndex < incorrectQuestions.length) {
                        showReviewQuestion(currentReviewIndex);
                    } else {
                        // End review mode
                        finishReviewMode();
                    }
                } else {
                    // Normal quiz flow
                    currentQuestionIndex++;
                    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
                    
                    // Check if we should level up
                    checkLevelProgression();
                    
                    // Get next question
                    getNextQuestion();
                }
            };
            
            explanationDiv.appendChild(nextButton);
            optionsContainer.parentNode.appendChild(explanationDiv);
        }
        
        // Update progress
        checkLevelProgression();
        
        // If correct, automatically proceed to next question after delay
        if (isCorrect) {
            setTimeout(() => {
                if (isReviewMode) {
                    // Move to next review question or finish review
                    currentReviewIndex++;
                    if (currentReviewIndex < incorrectQuestions.length) {
                        showReviewQuestion(currentReviewIndex);
                    } else {
                        // End review mode
                        finishReviewMode();
                    }
                } else {
                    // Normal quiz flow
                    currentQuestionIndex++;
                    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
                    getNextQuestion();
                }
            }, 1500);
        }
    }

    // Function to calculate points based on time and streak
    function calculatePoints() {
        // Base points for a correct answer
        let points = basePoints;
        
        // Add time bonus if timer is active
        if (currentQuestionIndex < 6 && timeLeft > 0) {
            // Calculate time bonus percentage (up to 100% bonus for very fast answers)
            timeBonus = Math.round((timeLeft / 45) * 100);
            points += Math.round((basePoints * timeBonus) / 100);
        } else {
            timeBonus = 0;
        }
        
        // Apply streak multiplier (starts at 1x, increases after 3 consecutive correct answers)
        points = Math.round(points * streakMultiplier);
        
        // Store last points earned
        lastPointsEarned = points;
        
        return points;
    }

    // Show/hide loading spinner
    function showLoading(show) {
        if (show) {
            loadingContainer.classList.remove('hidden');
            quizContainer.classList.add('hidden');
        } else {
            loadingContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
        }
    }

    // Show error message
    function showError(error) {
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        const quizContainer = document.getElementById('quiz-container');
        
        // Hide quiz container and show error container
        quizContainer.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        
        // Format the error message
        const message = `We couldn't generate a new question. This might be due to a temporary issue. ${error.message}`;
        errorMessage.textContent = message;
        
        // Create error actions container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'mt-6 flex flex-col sm:flex-row gap-4 justify-center';
        
        // Create retry button
        const retryButton = document.createElement('button');
        retryButton.className = 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200';
        retryButton.textContent = 'Try Again';
        retryButton.onclick = () => {
            errorContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
            getNextQuestion();
        };
        
        // Create start over button
        const startOverButton = document.createElement('button');
        startOverButton.className = 'px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200';
        startOverButton.textContent = 'Start Over';
        startOverButton.onclick = () => {
            // Clean up YouTube player if it exists
            if (window.player) {
                window.player.destroy();
                window.player = null;
            }
            // Stop music if playing
            if (window.musicPlayer) {
                window.musicPlayer.pause();
                window.musicPlayer.currentTime = 0;
            }
            // Reset quiz state
            currentQuestionIndex = 0;
            score = 0;
            consecutiveCorrectAnswers = 0;
            askedQuestions = [];
            localStorage.removeItem('askedQuestions');
            
            // Hide error and show quiz
            errorContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
            
            // Start fresh
            startQuiz();
        };
        
        // Create contact support link
        const supportLink = document.createElement('a');
        supportLink.className = 'px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 text-center';
        supportLink.textContent = 'Contact Support';
        const encodedError = encodeURIComponent(`Error Details:\n${error.message}\n\nTimestamp: ${new Date().toISOString()}`);
        supportLink.href = `mailto:support@example.com?subject=Quiz%20Error%20Report&body=${encodedError}`;
        
        // Add buttons to actions container
        actionsContainer.appendChild(retryButton);
        actionsContainer.appendChild(startOverButton);
        actionsContainer.appendChild(supportLink);
        
        // Clear previous actions if any
        const existingActions = errorContainer.querySelector('.mt-6');
        if (existingActions) {
            existingActions.remove();
        }
        
        // Add new actions
        errorContainer.appendChild(actionsContainer);
    }

    // Apply dark mode to all elements
    function applyDarkMode() {
        document.body.classList.add('dark-mode');
        
        // Apply dark mode to all theme-card elements
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => card.classList.add('dark-mode'));
        
        // Apply dark mode to all buttons
        const buttons = document.querySelectorAll('.secondary-btn, .option-btn');
        buttons.forEach(button => button.classList.add('dark-mode'));
    }

    // Add event listener for theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Toggle dark mode for buttons
            const buttons = document.querySelectorAll('.secondary-btn, .option-btn');
            buttons.forEach(button => button.classList.toggle('dark-mode'));
            
            // Toggle dark mode for theme cards
            const themeCards = document.querySelectorAll('.theme-card');
            themeCards.forEach(card => card.classList.toggle('dark-mode'));
        });
    }

    // Initialize badges display
    function initBadges() {
        const badgesContainer = document.getElementById('badges-container');
        badgesContainer.innerHTML = '';
        
        LEVELS.forEach((level, index) => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge-item text-center p-2';
            
            const isEarned = earnedBadges.includes(index);
            badgeElement.innerHTML = `
                <div class="badge-icon text-4xl mb-2 ${isEarned ? 'earned' : 'locked'}" title="${level.name}">
                    ${isEarned ? level.badge : '🔒'}
                </div>
                <div class="badge-name text-xs font-medium ${isEarned ? 'text-gray-800' : 'text-gray-400'}">
                    ${level.name}
                </div>
            `;
            
            if (isEarned) {
                badgeElement.setAttribute('title', level.description);
            }
            
            badgesContainer.appendChild(badgeElement);
        });
        
        badgesContainer.classList.remove('hidden');
    }

    // Apply level-specific theme
    function applyLevelTheme(level) {
        const theme = LEVELS[level].theme;
        const root = document.documentElement;
        
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-secondary', theme.secondary);
        root.style.setProperty('--color-accent', theme.accent);
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.backgroundColor = theme.primary;
        progressBar.style.width = `${(questionsCompletedInLevel / LEVELS[level].questionsRequired) * 100}%`;
    }

    // Award badge for completing a level
    function awardBadge(level) {
        if (!earnedBadges.includes(level)) {
            earnedBadges.push(level);
            localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
            initBadges();
        }
    }

    // Check for saved quiz state and show resume option
    function checkForResumeState() {
        // First check for our new detailed quiz state
        if (restoreQuizState()) {
            return true;
        }
        
        // Fall back to the original resume state check
        const resumeState = localStorage.getItem('resumeState');
        if (resumeState) {
            try {
                const state = JSON.parse(resumeState);
                currentQuestionIndex = state.questionIndex;
                score = state.score;
                document.getElementById('current-question').textContent = currentQuestionIndex + 1;
                document.getElementById('score').textContent = score;
                updateLevelDisplay();
                return true;
            } catch (e) {
                console.error('Error parsing resume state:', e);
                localStorage.removeItem('resumeState');
            }
        }
        return false;
    }

    // Display best scores in the preview section
    function displayBestScores() {
        if (Object.keys(bestScores).length === 0) {
            bestScoresPreview.classList.add('hidden');
            return;
        }

        bestScoresPreview.classList.remove('hidden');
        bestScoresList.innerHTML = '';

        // Sort levels by their order in LEVELS array
        const sortedLevels = Object.keys(bestScores).sort((a, b) => {
            const indexA = LEVELS.findIndex(level => level.name === a);
            const indexB = LEVELS.findIndex(level => level.name === b);
            return indexA - indexB;
        });

        // Display top 4 best scores
        sortedLevels.slice(0, 4).forEach(levelName => {
            const score = bestScores[levelName];
            const scoreElement = document.createElement('div');
            scoreElement.className = 'flex justify-between items-center text-gray-600 dark:text-gray-400';
            scoreElement.innerHTML = `
                <span>${levelName}:</span>
                <span class="font-medium">${score.accuracy}%</span>
            `;
            bestScoresList.appendChild(scoreElement);
        });

        if (sortedLevels.length > 4) {
            const moreElement = document.createElement('div');
            moreElement.className = 'text-center text-gray-500 dark:text-gray-400 mt-2';
            moreElement.textContent = `+${sortedLevels.length - 4} more levels`;
            bestScoresList.appendChild(moreElement);
        }
    }

    // Add resume quiz button handler
    if (resumeQuizBtn) {
        resumeQuizBtn.addEventListener('click', () => {
            difficultyContainer.classList.add('hidden');
            quizMainContainer.classList.remove('hidden');
            initQuiz(true);
        });
    }

    // Check for resume state and display best scores when page loads
    checkForResumeState();
    displayBestScores();

    // Update the window beforeunload event to save state
    window.addEventListener('beforeunload', () => {
        if (currentQuestionIndex > 0) {
            saveQuizState();
        }
    });

    // Social sharing functionality
    function shareAchievement(platform, achievement) {
        const text = `I just earned the ${achievement.title} badge in the Stock Market Trade Quiz! 🎯`;
        const url = window.location.href;
        
        let shareUrl;
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    // Add share button event listeners
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            const achievement = {
                title: document.getElementById('achievement-title').textContent,
                description: document.getElementById('achievement-description').textContent
            };
            shareAchievement(platform, achievement);
        });
    });

    // Certificate generation and handling
    function showCertificate(level) {
        const modal = document.getElementById('certificate-modal');
        const levelInfo = LEVELS[level];
        const accuracy = Math.round((score / (currentQuestionIndex + 1)) * 100);
        const traderName = localStorage.getItem('traderName') || 'Trader';
        
        // Update certificate content
        document.getElementById('certificate-trader-name').textContent = traderName;
        document.getElementById('certificate-level').textContent = levelInfo.name;
        document.getElementById('certificate-badge').textContent = levelInfo.badge;
        document.getElementById('certificate-date').textContent = new Date().toLocaleDateString();
        document.getElementById('certificate-accuracy').textContent = `${accuracy}%`;
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Add event listeners for certificate actions
        setupCertificateListeners(levelInfo, accuracy);
    }

    function setupCertificateListeners(levelInfo, accuracy) {
        const modal = document.getElementById('certificate-modal');
        const closeBtn = document.getElementById('close-certificate');
        const downloadBtn = document.getElementById('download-certificate');
        const shareBtn = document.getElementById('share-certificate');
        
        closeBtn.onclick = () => modal.classList.add('hidden');
        
        downloadBtn.onclick = () => {
            // Use html2canvas to capture the certificate
            html2canvas(document.getElementById('certificate-content')).then(canvas => {
                const link = document.createElement('a');
                link.download = `${levelInfo.name.replace(/\s+/g, '_')}_Certificate.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        };
        
        shareBtn.onclick = () => {
            const text = `I've completed the ${levelInfo.name} level in the Stock Market Trade Quiz with ${accuracy}% accuracy! 🎓`;
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: 'My Trading Achievement',
                    text: text,
                    url: url
                }).catch(console.error);
            } else {
                // Fallback to clipboard copy
                navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
                    alert('Certificate sharing link copied to clipboard!');
                }).catch(console.error);
            }
        };
        
        // Close modal on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }

    // Save quiz state when user leaves the page
    window.addEventListener('beforeunload', saveQuizState);
    
    // Function to save current quiz state
    function saveQuizState() {
        // Only save if we're in the middle of a quiz
        if (currentQuestionIndex > 0) {
            const quizState = {
                currentQuestionIndex,
                score,
                consecutiveCorrectAnswers,
                askedQuestions,
                hintsUsed,
                streakMultiplier,
                incorrectQuestions,
                lastActive: new Date().getTime()
            };
            
            localStorage.setItem('quizState', JSON.stringify(quizState));
            console.log('Quiz state saved');
        }
    }
    
    // Function to restore quiz state
    function restoreQuizState() {
        const savedState = localStorage.getItem('quizState');
        
        if (savedState) {
            try {
                const quizState = JSON.parse(savedState);
                
                // Check if the saved state is recent (within 24 hours)
                const now = new Date().getTime();
                const lastActive = quizState.lastActive || 0;
                const hoursSinceLastActive = (now - lastActive) / (1000 * 60 * 60);
                
                if (hoursSinceLastActive <= 24) {
                    // Restore quiz state
                    currentQuestionIndex = quizState.currentQuestionIndex;
                    score = quizState.score;
                    consecutiveCorrectAnswers = quizState.consecutiveCorrectAnswers || 0;
                    askedQuestions = quizState.askedQuestions || [];
                    hintsUsed = quizState.hintsUsed || 0;
                    streakMultiplier = quizState.streakMultiplier || 1;
                    incorrectQuestions = quizState.incorrectQuestions || [];
                    
                    // Update UI
                    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
                    document.getElementById('score').textContent = score;
                    updateLevelDisplay();
                    
                    // Show resume dialog
                    showResumeDialog();
                    return true;
                } else {
                    // Clear old state if it's more than 24 hours old
                    localStorage.removeItem('quizState');
                }
            } catch (e) {
                console.error('Error restoring quiz state:', e);
                localStorage.removeItem('quizState');
            }
        }
        
        return false;
    }
    
    // Show dialog to resume quiz
    function showResumeDialog() {
        const resumeDialog = document.createElement('div');
        resumeDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        resumeDialog.id = 'resume-dialog';
        
        resumeDialog.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 text-center">
                <h3 class="text-xl font-bold mb-4">Resume Your Quiz?</h3>
                <p class="mb-6">We noticed you were in the middle of a quiz. Would you like to continue where you left off?</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button id="resume-yes" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Yes, Continue
                    </button>
                    <button id="resume-no" class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        No, Start Over
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(resumeDialog);
        
        // Add event listeners
        document.getElementById('resume-yes').addEventListener('click', () => {
            resumeDialog.remove();
            difficultyContainer.classList.add('hidden');
            quizMainContainer.classList.remove('hidden');
            getNextQuestion();
        });
        
        document.getElementById('resume-no').addEventListener('click', () => {
            resumeDialog.remove();
            localStorage.removeItem('quizState');
            currentQuestionIndex = 0;
            score = 0;
            consecutiveCorrectAnswers = 0;
            askedQuestions = [];
            incorrectQuestions = [];
            hintsUsed = 0;
            streakMultiplier = 1;
            
            // Show difficulty selection
            document.getElementById('quiz-main-container').classList.add('hidden');
            document.getElementById('difficulty-container').classList.remove('hidden');
        });
    }

    // Function to show hint
    function showHint() {
        if (hintsUsed >= MAX_HINTS || !currentQuestion) return;
        
        hintsUsed++;
        
        // Update hint button text
        const hintButton = document.getElementById('hint-button');
        if (hintButton) {
            hintButton.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Hint Used (${MAX_HINTS - hintsUsed} left)
            `;
            hintButton.disabled = true;
            hintButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        // Generate hint based on the question
        let hintText = "";
        const correctIndex = currentQuestion.correctAnswer;
        const correctAnswer = currentQuestion.options[correctIndex];
        
        // Different hint strategies
        const hintStrategy = Math.floor(Math.random() * 3);
        
        switch (hintStrategy) {
            case 0:
                // Eliminate one wrong answer
                let wrongOptions = [];
                currentQuestion.options.forEach((_, index) => {
                    if (index !== correctIndex) {
                        wrongOptions.push(index);
                    }
                });
                
                // Randomly select one wrong answer to eliminate
                const eliminateIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                const eliminateOption = currentQuestion.options[eliminateIndex];
                
                hintText = `One of the incorrect options is: "${eliminateOption}"`;
                
                // Visually mark the eliminated option
                const optionButtons = document.querySelectorAll('#options-container button');
                optionButtons[eliminateIndex].classList.add('opacity-50');
                optionButtons[eliminateIndex].innerHTML += ' <span class="text-red-500 ml-2">(Hint: Not this one)</span>';
                break;
                
            case 1:
                // Give a conceptual hint based on the explanation
                if (currentQuestion.explanation) {
                    // Extract a portion of the explanation as a hint
                    const words = currentQuestion.explanation.split(' ');
                    if (words.length > 8) {
                        const hintWords = words.slice(0, 8).join(' ');
                        hintText = `Hint: ${hintWords}...`;
                    } else {
                        hintText = "Hint: Think about the key concepts related to this question.";
                    }
                } else {
                    hintText = "Hint: Consider the fundamental principles related to this topic.";
                }
                break;
                
            case 2:
                // First letter hint
                hintText = `The correct answer starts with the letter "${correctAnswer.charAt(0)}".`;
                break;
        }
        
        // Create and show hint message
        const hintDisplay = document.createElement('div');
        hintDisplay.className = 'mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg';
        hintDisplay.innerHTML = `
            <div class="flex items-start">
                <svg class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <span>${hintText}</span>
            </div>
        `;
        
        // Store current hint
        currentHint = hintText;
        
        // Add hint display after the hint button
        const hintContainer = hintButton.parentNode;
        hintContainer.parentNode.insertBefore(hintDisplay, hintContainer.nextSibling);
    }

    // Function to show quiz completion screen with review option
    function showQuizCompletion() {
        // Calculate total questions and accuracy
        const totalQuestions = correctAnswers.length + incorrectAnswers.length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers.length / totalQuestions) * 100) : 0;
        
        // Get player name from localStorage or use default
        const playerName = localStorage.getItem('traderName') || 'Anonymous';
        
        // Add to leaderboard if score is greater than 0
        if (score > 0) {
            addToLeaderboard(playerName, score, totalQuestions, accuracy);
        }
        
        // Get player's rank
        const playerRank = leaderboard.findIndex(entry => entry.playerName === playerName && entry.score === score) + 1;
        
        // Create leaderboard message
        let leaderboardMessage = '';
        if (playerRank === 1) {
            leaderboardMessage = '<div class="text-green-600 dark:text-green-400 font-bold mb-4">🏆 Congratulations! You have the top score on the leaderboard!</div>';
        } else if (playerRank > 0) {
            leaderboardMessage = `<div class="text-blue-600 dark:text-blue-400 mb-4">Your score ranks #${playerRank} on the leaderboard!</div>`;
        }
        
        // Create challenge result message if in challenge mode
        let challengeMessage = '';
        if (isChallengeMode && challengeData) {
            if (score > challengeData.score) {
                challengeMessage = `
                    <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg mb-4">
                        <p class="font-bold text-green-700 dark:text-green-300">
                            🎉 You beat ${challengeData.playerName}'s score of ${challengeData.score}!
                        </p>
                    </div>
                `;
            } else if (score === challengeData.score) {
                challengeMessage = `
                    <div class="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
                        <p class="font-bold text-blue-700 dark:text-blue-300">
                            🤝 You tied with ${challengeData.playerName} with a score of ${challengeData.score}!
                        </p>
                    </div>
                `;
            } else {
                challengeMessage = `
                    <div class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4">
                        <p class="font-bold text-red-700 dark:text-red-300">
                            😢 You scored ${score}, which is ${challengeData.score - score} points less than ${challengeData.playerName}'s score of ${challengeData.score}.
                        </p>
                    </div>
                `;
            }
        }
        
        // Create completion container
        const completionContainer = document.createElement('div');
        completionContainer.className = 'bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-auto';
        completionContainer.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-center">Quiz Completed!</h2>
            ${challengeMessage}
            ${leaderboardMessage}
            <div class="text-center mb-6">
                <div class="text-4xl font-bold mb-2">${score}</div>
                <div class="text-gray-600 dark:text-gray-400">Final Score</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <div class="text-2xl font-bold">${totalQuestions}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Questions Answered</div>
                </div>
                <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                    <div class="text-2xl font-bold">${accuracy}%</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
            </div>
            
            ${incorrectAnswers.length > 0 ? `
                <div class="mb-6">
                    <div class="text-red-600 dark:text-red-400 mb-2">Incorrect Answers: ${incorrectAnswers.length}</div>
                </div>
            ` : ''}
            
            <div class="flex flex-wrap gap-2 justify-center">
                <button id="view-leaderboard" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    View Leaderboard
                </button>
                
                <button id="challenge-friend" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Challenge a Friend
                </button>
                
                ${incorrectAnswers.length > 0 ? `
                    <button id="review-incorrect" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                        Review Incorrect
                    </button>
                ` : ''}
                
                <button id="restart-quiz" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Restart Quiz
                </button>
            </div>
        `;
        
        // Clear quiz container and append completion container
        quizContainer.innerHTML = '';
        quizContainer.appendChild(completionContainer);
        
        // Add event listeners
        document.getElementById('view-leaderboard').addEventListener('click', showLeaderboard);
        
        document.getElementById('challenge-friend').addEventListener('click', () => {
            showChallengeModal(score, correctAnswers, incorrectAnswers);
        });
        
        if (incorrectAnswers.length > 0) {
            document.getElementById('review-incorrect').addEventListener('click', () => {
                reviewMode = true;
                currentReviewIndex = 0;
                showReviewQuestion();
            });
        }
        
        document.getElementById('restart-quiz').addEventListener('click', () => {
            // Reset quiz state
            score = 0;
            currentQuestionIndex = 0;
            correctAnswers = [];
            incorrectAnswers = [];
            reviewMode = false;
            
            // Show difficulty selection
            showDifficultySelection();
        });
    }
    
    // Function to start review mode
    function startReviewMode() {
        isReviewMode = true;
        currentReviewIndex = 0;
        
        // Update UI to show review mode
        document.getElementById('completion-container').remove();
        document.getElementById('quiz-container').classList.remove('hidden');
        
        // Add review mode indicator
        const statsContainer = document.getElementById('stats');
        const reviewIndicator = document.createElement('div');
        reviewIndicator.id = 'review-indicator';
        reviewIndicator.className = 'w-full text-center mt-2 py-1 px-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm';
        reviewIndicator.textContent = 'REVIEW MODE';
        statsContainer.appendChild(reviewIndicator);
        
        // Show first review question
        showReviewQuestion(currentReviewIndex);
    }
    
    // Function to show a review question
    function showReviewQuestion(index) {
        if (index >= incorrectQuestions.length) {
            finishReviewMode();
            return;
        }
        
        const reviewQuestion = incorrectQuestions[index];
        currentQuestion = reviewQuestion;
        
        // Update question display
        document.getElementById('question').textContent = reviewQuestion.question;
        
        // Update review progress
        document.getElementById('current-question').textContent = `${index + 1}/${incorrectQuestions.length}`;
        
        // Clear previous options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Add options with indicators for previous answer
        reviewQuestion.options.forEach((option, i) => {
            const button = document.createElement('button');
            button.className = 'w-full text-left p-4 rounded-xl transition-colors duration-200 bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20 focus:outline-none focus:ring-2 focus:ring-purple-500';
            
            // Add keyboard shortcut indicator
            const keyboardNumber = i + 1;
            
            // Add indicator for previous answer
            let previousAnswerIndicator = '';
            if (i === reviewQuestion.userAnswer) {
                previousAnswerIndicator = '<span class="ml-2 text-red-500">(Your previous answer)</span>';
            } else if (i === reviewQuestion.correctAnswer) {
                previousAnswerIndicator = '<span class="ml-2 text-green-500">(Correct answer)</span>';
            }
            
            button.innerHTML = `<span class="inline-block w-6 h-6 mr-2 text-xs font-bold text-center rounded-full bg-purple-500/20 dark:bg-purple-400/20">${keyboardNumber}</span> ${option}${previousAnswerIndicator}`;
            
            button.onclick = () => checkAnswer(i);
            button.dataset.optionIndex = i;
            optionsContainer.appendChild(button);
        });
        
        // Hide feedback container
        document.getElementById('feedback-container').classList.add('hidden');
        
        // Add keyboard event listener for answering with number keys
        document.addEventListener('keydown', handleKeyboardAnswer);
    }
    
    // Function to finish review mode
    function finishReviewMode() {
        isReviewMode = false;
        
        // Remove review indicator
        const reviewIndicator = document.getElementById('review-indicator');
        if (reviewIndicator) {
            reviewIndicator.remove();
        }
        
        // Show completion screen again
        showQuizCompletion();
    }

    // Add keyboard navigation support
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', handleGlobalKeyboardNavigation);
    }
    
    // Handle global keyboard navigation
    function handleGlobalKeyboardNavigation(event) {
        // Skip if we're in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Handle different keys
        switch (event.key) {
            case 'Escape':
                // Close modals or dialogs
                const modals = [
                    document.getElementById('certificate-modal'),
                    document.getElementById('progress-summary'),
                    document.getElementById('achievement-toast')
                ];
                
                for (const modal of modals) {
                    if (modal && !modal.classList.contains('hidden')) {
                        modal.classList.add('hidden');
                        event.preventDefault();
                        return;
                    }
                }
                break;
                
            case 'h':
                // Show hint if available
                if (event.ctrlKey || event.metaKey) {
                    const hintButton = document.getElementById('hint-button');
                    if (hintButton && !hintButton.disabled) {
                        hintButton.click();
                        event.preventDefault();
                    }
                }
                break;
                
            case 'n':
                // Next question (if next button is visible)
                if (event.ctrlKey || event.metaKey) {
                    const nextButton = document.querySelector('#quiz-container button:last-child');
                    if (nextButton && nextButton.textContent.includes('Next')) {
                        nextButton.click();
                        event.preventDefault();
                    }
                }
                break;
                
            case 'r':
                // Restart quiz (if restart button is visible)
                if (event.ctrlKey || event.metaKey) {
                    const restartButton = document.getElementById('restart-quiz');
                    if (restartButton) {
                        restartButton.click();
                        event.preventDefault();
                    }
                }
                break;
        }
    }
    
    // Initialize keyboard navigation
    setupKeyboardNavigation();

    // Preload sound effects
    function preloadSoundEffects() {
        Object.values(soundEffects).forEach(audio => {
            audio.load();
            audio.volume = 0.5; // Set default volume
        });
    }
    
    // Function to play sound effect
    function playSound(soundName) {
        if (!soundEffectsEnabled) return;
        
        const sound = soundEffects[soundName];
        if (sound) {
            // Reset the audio to the beginning if it's already playing
            sound.pause();
            sound.currentTime = 0;
            
            // Play the sound
            sound.play().catch(error => {
                console.warn('Could not play sound effect:', error);
            });
        }
    }
    
    // Add sound toggle to the UI
    function addSoundToggle() {
        const statsContainer = document.getElementById('stats');
        
        const soundToggle = document.createElement('div');
        soundToggle.className = 'text-gray-700 w-auto flex items-center ml-auto';
        soundToggle.innerHTML = `
            <button id="sound-toggle" class="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Toggle sound effects">
                <svg id="sound-on-icon" class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
                </svg>
                <svg id="sound-off-icon" class="w-6 h-6 text-gray-600 dark:text-gray-400 hidden" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        
        statsContainer.appendChild(soundToggle);
        
        // Add event listener to toggle sound
        document.getElementById('sound-toggle').addEventListener('click', toggleSound);
        
        // Check if sound preference is saved
        const savedSoundPreference = localStorage.getItem('soundEffectsEnabled');
        if (savedSoundPreference !== null) {
            soundEffectsEnabled = savedSoundPreference === 'true';
            updateSoundToggleIcon();
        }
    }
    
    // Function to toggle sound effects
    function toggleSound() {
        soundEffectsEnabled = !soundEffectsEnabled;
        localStorage.setItem('soundEffectsEnabled', soundEffectsEnabled);
        updateSoundToggleIcon();
    }
    
    // Update sound toggle icon
    function updateSoundToggleIcon() {
        const soundOnIcon = document.getElementById('sound-on-icon');
        const soundOffIcon = document.getElementById('sound-off-icon');
        
        if (soundEffectsEnabled) {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add('hidden');
        } else {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
        }
    }
    
    // Add animation preferences
    let animationsEnabled = true;
    
    // Function to add animation settings
    function addAnimationToggle() {
        const statsContainer = document.getElementById('stats');
        
        const animationToggle = document.createElement('div');
        animationToggle.className = 'text-gray-700 w-auto flex items-center ml-2';
        animationToggle.innerHTML = `
            <button id="animation-toggle" class="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Toggle animations">
                <svg id="animation-on-icon" class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                </svg>
                <svg id="animation-off-icon" class="w-6 h-6 text-gray-600 dark:text-gray-400 hidden" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        
        statsContainer.appendChild(animationToggle);
        
        // Add event listener to toggle animations
        document.getElementById('animation-toggle').addEventListener('click', toggleAnimations);
        
        // Check if animation preference is saved
        const savedAnimationPreference = localStorage.getItem('animationsEnabled');
        if (savedAnimationPreference !== null) {
            animationsEnabled = savedAnimationPreference === 'true';
            updateAnimationToggleIcon();
        }
    }
    
    // Function to toggle animations
    function toggleAnimations() {
        animationsEnabled = !animationsEnabled;
        localStorage.setItem('animationsEnabled', animationsEnabled);
        updateAnimationToggleIcon();
    }
    
    // Update animation toggle icon
    function updateAnimationToggleIcon() {
        const animationOnIcon = document.getElementById('animation-on-icon');
        const animationOffIcon = document.getElementById('animation-off-icon');
        
        if (animationsEnabled) {
            animationOnIcon.classList.remove('hidden');
            animationOffIcon.classList.add('hidden');
        } else {
            animationOnIcon.classList.add('hidden');
            animationOffIcon.classList.remove('hidden');
        }
    }
    
    // Add CSS for animations
    function addAnimationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
            
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(30px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-30px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .animate-fade-in {
                animation: fadeIn 0.5s ease-out forwards;
            }
            
            .animate-fade-out {
                animation: fadeOut 0.3s ease-in forwards;
            }
            
            .animate-slide-in-right {
                animation: slideInRight 0.4s ease-out forwards;
            }
            
            .animate-slide-in-left {
                animation: slideInLeft 0.4s ease-out forwards;
            }
            
            .animate-pulse {
                animation: pulse 0.5s ease-in-out;
            }
            
            .staggered-item {
                opacity: 0;
            }
            
            .reduced-motion {
                animation: none !important;
                transition: none !important;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Function to apply staggered animation to elements
    function animateStaggered(elements, animationClass, delayBetween = 100) {
        if (!animationsEnabled) {
            elements.forEach(el => {
                el.style.opacity = 1;
            });
            return;
        }
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
                element.style.opacity = 1;
            }, index * delayBetween);
        });
    }

    // Leaderboard variables
    const MAX_LEADERBOARD_ENTRIES = 10;
    let leaderboard = [];

    // Challenge variables
    let isChallengeMode = false;
    let challengeData = null;

    // Function to load leaderboard from localStorage
    function loadLeaderboard() {
        try {
            const savedLeaderboard = localStorage.getItem('quizLeaderboard');
            if (savedLeaderboard) {
                leaderboard = JSON.parse(savedLeaderboard);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Reset leaderboard if there's an error
            leaderboard = [];
        }
    }

    // Function to save leaderboard to localStorage
    function saveLeaderboard() {
        try {
            localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
        }
    }

    // Function to add an entry to the leaderboard
    function addToLeaderboard(playerName, score, questionsAnswered, accuracy) {
        // Create new entry
        const entry = {
            playerName: playerName,
            score: score,
            questionsAnswered: questionsAnswered,
            accuracy: accuracy,
            date: new Date().toISOString()
        };
        
        // Add to leaderboard
        leaderboard.push(entry);
        
        // Sort by score (highest first)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Trim to max entries
        if (leaderboard.length > MAX_LEADERBOARD_ENTRIES) {
            leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
        }
        
        // Save to localStorage
        saveLeaderboard();
        
        // Return position (1-based index)
        return leaderboard.findIndex(item => 
            item.playerName === entry.playerName && 
            item.score === entry.score
        ) + 1;
    }

    // Function to show leaderboard
    function showLeaderboard() {
        // Create modal for leaderboard
        const modal = document.createElement('div');
        modal.id = 'leaderboard-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'leaderboard-title');
        
        // Create leaderboard table
        let tableRows = '';
        
        if (leaderboard.length === 0) {
            tableRows = `
                <tr>
                    <td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">
                        No scores yet. Be the first to complete the quiz!
                    </td>
                </tr>
            `;
        } else {
            leaderboard.forEach((entry, index) => {
                // Format date
                const date = new Date(entry.date);
                const formattedDate = date.toLocaleDateString();
                
                // Determine row class based on position
                let rowClass = '';
                let medal = '';
                
                if (index === 0) {
                    rowClass = 'bg-yellow-100 dark:bg-yellow-900/30';
                    medal = '🥇';
                } else if (index === 1) {
                    rowClass = 'bg-gray-100 dark:bg-gray-700/50';
                    medal = '🥈';
                } else if (index === 2) {
                    rowClass = 'bg-orange-100 dark:bg-orange-900/30';
                    medal = '🥉';
                }
                
                tableRows += `
                    <tr class="${rowClass}">
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                            ${index + 1}${medal ? ' ' + medal : ''}
                        </td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                            ${entry.playerName}
                        </td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-right">
                            ${entry.score}
                        </td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-right">
                            ${entry.accuracy}%
                        </td>
                    </tr>
                `;
            });
        }
        
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 id="leaderboard-title" class="text-xl font-bold">Leaderboard</h3>
        modal.setAttribute('aria-labelledby', 'challenge-title');
        
        const challengeLink = createChallengeLink();
        
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h3 id="challenge-title" class="text-xl font-bold">Challenge a Friend</h3>
                    <button id="close-challenge" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <p class="mb-4">Share this link with a friend to challenge them to beat your score of <strong>${score}</strong>!</p>
                
                <div class="flex mb-4">
                    <input id="challenge-link" type="text" value="${challengeLink}" readonly class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <button id="copy-challenge" class="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Copy
                    </button>
                </div>
                
                <div class="space-y-2">
                    <button id="share-whatsapp" class="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                        </svg>
                        Share on WhatsApp
                    </button>
                    
                    <button id="share-twitter" class="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                        Share on Twitter
                    </button>
                </div>
                
                <button id="dismiss-challenge" class="mt-6 w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-challenge').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('dismiss-challenge').addEventListener('click', () => {
            modal.remove();
        });
        
        // Copy challenge link
        document.getElementById('copy-challenge').addEventListener('click', () => {
            const linkInput = document.getElementById('challenge-link');
            linkInput.select();
            document.execCommand('copy');
            
            // Show copied message
            const copyButton = document.getElementById('copy-challenge');
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        });
        
        // Share on WhatsApp
        document.getElementById('share-whatsapp').addEventListener('click', () => {
            const text = `I scored ${score} points in the Stock Market Quiz! Can you beat my score? Take the challenge: `;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + challengeLink)}`;
            window.open(whatsappUrl, '_blank');
        });
        
        // Share on Twitter
        document.getElementById('share-twitter').addEventListener('click', () => {
            const text = `I scored ${score} points in the Stock Market Quiz! Can you beat my score? Take the challenge: `;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + challengeLink)}`;
            window.open(twitterUrl, '_blank');
        });
        
        // Close on Escape key
        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                modal.remove();
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        });
        
        // Focus the dismiss button
        document.getElementById('dismiss-challenge').focus();
    }
    
    // Function to show challenge info
    function showChallengeInfo(challenge) {
        // Create challenge info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'mb-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg';
        
        // Calculate how long ago the challenge was created
        const now = new Date().getTime();
        const challengeTime = challenge.timestamp;
        const timeDiff = now - challengeTime;
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysAgo = Math.floor(hoursAgo / 24);
        
        let timeAgo = '';
        if (daysAgo > 0) {
            timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        } else if (hoursAgo > 0) {
            timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        } else {
            timeAgo = 'just now';
        }
        
        infoContainer.innerHTML = `
            <h3 class="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">Challenge from ${challenge.playerName}</h3>
            <p class="text-purple-700 dark:text-purple-400">
                ${challenge.playerName} scored <strong>${challenge.score}</strong> points 
                by answering <strong>${challenge.questionsAnswered}</strong> questions ${timeAgo}.
                Can you beat their score?
            </p>
        `;
        
        // Add to difficulty container
        const difficultyContainer = document.getElementById('difficulty-container');
        difficultyContainer.insertBefore(infoContainer, difficultyContainer.firstChild);
    }
    
    // Function to check for challenge in URL
    function checkForChallenge() {
        const urlParams = new URLSearchParams(window.location.search);
        const challengeCode = urlParams.get('challenge');
        
        if (challengeCode) {
            const challenge = parseChallengeCode(challengeCode);
            if (challenge) {
                // Store challenge data
                challengeData = challenge;
                isChallengeMode = true;
                
                // Show challenge info
                showChallengeInfo(challenge);
                
                // Clean URL
                const url = new URL(window.location.href);
                url.searchParams.delete('challenge');
                window.history.replaceState({}, document.title, url.toString());
            }
        }
    }

    // Challenge variables
    let isChallengeMode = false;
    let challengeData = null;

    // Function to generate a challenge code
    function generateChallengeCode(playerName, score, questionsAnswered) {
        const challenge = {
            playerName: playerName,
            score: score,
            questionsAnswered: questionsAnswered,
            timestamp: new Date().getTime()
        };
        
        // Convert to base64
        return btoa(JSON.stringify(challenge));
    }

    // Function to parse a challenge code
    function parseChallengeCode(code) {
        try {
            // Decode from base64
            const decoded = atob(code);
            const challenge = JSON.parse(decoded);
            
            // Validate challenge data
            if (!challenge.playerName || 
                typeof challenge.score !== 'number' || 
                typeof challenge.questionsAnswered !== 'number' ||
                !challenge.timestamp) {
                console.error('Invalid challenge data:', challenge);
                return null;
            }
            
            return challenge;
        } catch (error) {
            console.error('Error parsing challenge code:', error);
            return null;
        }
    }

    // Function to create a challenge link
    function createChallengeLink() {
        // Get player name from localStorage or use default
        const playerName = localStorage.getItem('playerName') || 'Anonymous';
        
        // Calculate total questions
        const totalQuestions = correctAnswers.length + incorrectAnswers.length;
        
        // Generate challenge code
        const challengeCode = generateChallengeCode(playerName, score, totalQuestions);
        
        // Create URL with challenge code
        const url = new URL(window.location.href);
        url.searchParams.set('challenge', challengeCode);
        
        return url.toString();
    }
}); 