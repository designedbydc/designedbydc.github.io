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

    // Quiz state
    let currentLevel = 0; // Index into LEVELS array
    let questionsCompletedInLevel = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let missedQuestions = [];
    let userPerformance = [];
    let currentQuestion = null;
    let consecutiveCorrectAnswers = 0;
    let timerInterval = null;
    let timeLeft = 45;
    
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

    // Get next question from OpenAI
    async function getNextQuestion() {
        showLoading(true);
        
        try {
            // Determine the difficulty level based on current question index
            const currentLevel = Math.min(Math.floor(currentQuestionIndex / 3), LEVELS.length - 1);
            const difficulty = LEVELS[currentLevel].name;
            
            // Create a prompt for the OpenAI API
            const prompt = `Generate a challenging stock market quiz question about ${difficulty} level concepts. 
            The question should test knowledge of stock market trading, investing principles, or financial concepts.
            
            Return ONLY a JSON object with the following structure:
            {
                "question": "The question text goes here?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctAnswer": 0, // Index of the correct option (0-3)
                "explanation": "Detailed explanation of why the answer is correct"
            }`;
            
            console.log(`Fetching question for difficulty: ${difficulty}`);
            
            // Make a request to the OpenAI API
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
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
                    
                    // Create a fallback question if we can't get one from the API
                    const fallbackQuestion = createFallbackQuestion(currentLevel);
                    currentQuestion = fallbackQuestion;
                    showQuestion(currentQuestion);
                    
                    // Show a warning toast that we're using a fallback question
                    showFallbackWarning();
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            showError(error);
            showLoading(false);
        }
    }

    // Function to create a fallback question when API fails
    function createFallbackQuestion(level) {
        // Array of pre-defined fallback questions for different levels
        const fallbackQuestions = [
            // Beginner level questions
            {
                question: "What does 'Bull Market' refer to?",
                options: [
                    "A market where prices are falling",
                    "A market where prices are rising",
                    "A market with high volatility",
                    "A market dominated by aggressive traders"
                ],
                correctAnswer: 1,
                explanation: "A Bull Market refers to a financial market in which prices are rising or expected to rise. This is typically characterized by investor optimism and confidence."
            },
            // Intermediate level questions
            {
                question: "What is the P/E ratio used for?",
                options: [
                    "Measuring a company's debt level",
                    "Calculating dividend yield",
                    "Valuing a company relative to its earnings",
                    "Determining market volatility"
                ],
                correctAnswer: 2,
                explanation: "The Price-to-Earnings (P/E) ratio is a valuation metric that compares a company's current share price to its per-share earnings. It helps investors determine if a stock is overvalued or undervalued relative to its earnings."
            },
            // Advanced level questions
            {
                question: "Which of the following is NOT a common hedging strategy?",
                options: [
                    "Purchasing put options",
                    "Diversification across asset classes",
                    "Dollar-cost averaging",
                    "Short selling correlated assets"
                ],
                correctAnswer: 2,
                explanation: "Dollar-cost averaging is an investment strategy where an investor divides the total amount to be invested across periodic purchases. While it can reduce the impact of volatility, it's not primarily a hedging strategy but rather an investment approach."
            }
        ];
        
        // Select a question based on the level
        const levelIndex = Math.min(level, 2); // Cap at index 2 (advanced)
        return fallbackQuestions[levelIndex];
    }
    
    // Function to show a warning that we're using a fallback question
    function showFallbackWarning() {
        const warningToast = document.createElement('div');
        warningToast.className = 'fixed bottom-4 left-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-md';
        warningToast.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm">Using a pre-defined question due to API issues. This won't affect your quiz progress.</p>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button class="close-warning inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-200 focus:outline-none">
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(warningToast);
        
        // Add event listener to close button
        warningToast.querySelector('.close-warning').addEventListener('click', () => {
            warningToast.remove();
        });
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (document.body.contains(warningToast)) {
                warningToast.remove();
            }
        }, 8000);
    }

    // Display the current question
    function showQuestion(questionData) {
        currentQuestion = questionData;
        currentHint = null; // Reset current hint
        
        // Update question display
        document.getElementById('question').textContent = questionData.question;
        
        // Clear previous options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Add new options with improved contrast
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            // Improved contrast for option buttons
            button.className = 'w-full text-left p-4 rounded-xl transition-colors duration-200 bg-white/15 dark:bg-gray-800/20 hover:bg-white/25 dark:hover:bg-gray-800/30 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white';
            
            // Add keyboard shortcut indicator with improved contrast
            const keyboardNumber = index + 1;
            button.innerHTML = `<span class="inline-block w-6 h-6 mr-2 text-xs font-bold text-center rounded-full bg-purple-600/30 dark:bg-purple-500/40 text-purple-900 dark:text-purple-100">${keyboardNumber}</span> ${option}`;
            
            button.onclick = () => checkAnswer(index);
            button.dataset.optionIndex = index;
            optionsContainer.appendChild(button);
        });
        
        // Add hint button for questions after level 3 (if hints are available)
        if (currentQuestionIndex >= 3 && hintsUsed < MAX_HINTS) {
            // Create hint container
            const hintContainer = document.createElement('div');
            hintContainer.className = 'mt-4 flex justify-end';
            
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
        }
        
        // Add keyboard shortcut tooltip with improved contrast
        if (!localStorage.getItem('keyboardShortcutTipShown')) {
            const tipContainer = document.createElement('div');
            tipContainer.className = 'mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg flex items-center';
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
        timerElement.classList.remove('text-red-500');

        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Start new timer
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft + 's';

            // Warning when 10 seconds or less remain
            if (timeLeft <= 10) {
                timerElement.classList.add('text-red-500');
            }

            // Time's up
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeUp();
            }
        }, 1000);
    }

    // Handle when time runs out
    function handleTimeUp() {
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
        // Hide quiz container
        document.getElementById('quiz-container').classList.add('hidden');
        
        // Create completion container
        const completionContainer = document.createElement('div');
        completionContainer.id = 'completion-container';
        completionContainer.className = 'p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg';
        
        // Calculate accuracy
        const totalQuestions = currentQuestionIndex;
        const accuracy = Math.round((score / totalQuestions) * 100);
        
        // Create completion content
        let reviewButton = '';
        if (incorrectQuestions.length > 0) {
            reviewButton = `
                <button id="review-incorrect" class="mt-4 w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                    Review ${incorrectQuestions.length} Incorrect ${incorrectQuestions.length === 1 ? 'Question' : 'Questions'}
                </button>
            `;
        }
        
        completionContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-center mb-6">Quiz Completed!</h2>
            
            <div class="space-y-4">
                <div class="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700 dark:text-gray-300">Final Score:</span>
                        <span class="text-xl font-bold text-purple-700 dark:text-purple-300">${score}</span>
                    </div>
                </div>
                
                <div class="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700 dark:text-gray-300">Questions Answered:</span>
                        <span class="font-bold text-blue-700 dark:text-blue-300">${totalQuestions}</span>
                    </div>
                </div>
                
                <div class="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700 dark:text-gray-300">Accuracy:</span>
                        <span class="font-bold text-green-700 dark:text-green-300">${accuracy}%</span>
                    </div>
                </div>
                
                <div class="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-700 dark:text-gray-300">Incorrect Answers:</span>
                        <span class="font-bold text-red-700 dark:text-red-300">${incorrectQuestions.length}</span>
                    </div>
                </div>
            </div>
            
            ${reviewButton}
            
            <button id="restart-quiz" class="mt-4 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                Start New Quiz
            </button>
        `;
        
        // Add completion container to the quiz main container
        document.getElementById('quiz-main-container').appendChild(completionContainer);
        
        // Add event listeners
        if (incorrectQuestions.length > 0) {
            document.getElementById('review-incorrect').addEventListener('click', startReviewMode);
        }
        
        document.getElementById('restart-quiz').addEventListener('click', () => {
            // Remove completion container
            completionContainer.remove();
            
            // Reset quiz state
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
}); 