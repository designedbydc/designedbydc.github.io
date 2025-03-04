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
    const timelineContainer = document.getElementById('timeline-container');
    const timeline = document.getElementById('timeline');
    
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

    // Initialize state variables
    let currentLevel = 0; // Index into LEVELS array
    let questionsCompletedInLevel = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let missedQuestions = [];
    let userPerformance = [];
    let currentQuestion = null;
    let consecutiveCorrectAnswers = 0;
    let currentQuestionData = null;
    let askedQuestions = [];
    let earnedBadges = [];
    let bestScores = {};
    let lastQuizState = null;
    
    // Track retry attempts to prevent infinite loops
    let retryAttempts = 0;
    const MAX_RETRY_ATTEMPTS = 3;
    const MAX_STORED_QUESTIONS = 500;

    // Mock questions for local testing
    const MOCK_QUESTIONS = [
        {
            question: "What is a stock?",
            options: ["A type of bond", "Ownership in a company", "A type of currency", "A government debt"],
            correctAnswer: 1,
            explanation: "A stock represents ownership in a company. When you buy a stock, you're purchasing a small piece of that company."
        },
        {
            question: "What does 'Bull Market' refer to?",
            options: ["A market where prices are falling", "A market where prices are rising", "A market with high volatility", "A market with low trading volume"],
            correctAnswer: 1,
            explanation: "A bull market refers to a financial market where prices are rising or expected to rise. The term is most often used to refer to the stock market but can be applied to anything that is traded, such as bonds, real estate, currencies, and commodities."
        },
        {
            question: "What is a P/E ratio?",
            options: ["Price to Earnings ratio", "Profit to Expense ratio", "Performance to Efficiency ratio", "Potential to Earnings ratio"],
            correctAnswer: 0,
            explanation: "P/E ratio stands for Price to Earnings ratio. It is a valuation ratio of a company's current share price compared to its per-share earnings. It is calculated by dividing the market value per share by the earnings per share."
        },
        {
            question: "What is a market order?",
            options: ["An order to buy or sell a stock at a specific price", "An order to buy or sell a stock at the current market price", "An order that expires at the end of the trading day", "An order that is executed only if the price reaches a certain level"],
            correctAnswer: 1,
            explanation: "A market order is an order to buy or sell a stock at the current market price. Market orders are used when certainty of execution is a priority over the price of execution."
        },
        {
            question: "What is diversification in investing?",
            options: ["Investing all money in one promising stock", "Spreading investments across various assets to reduce risk", "Frequently trading stocks to maximize profits", "Investing only in blue-chip companies"],
            correctAnswer: 1,
            explanation: "Diversification is a risk management strategy that mixes a wide variety of investments within a portfolio. The rationale behind this technique is that a portfolio constructed of different kinds of assets will, on average, yield higher long-term returns and lower the risk of any individual holding or security."
        }
    ];

    // Check if we're in a local environment
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
    
    // In-memory fallback storage when localStorage is not available
    const memoryStorage = new Map();
    
    // Safe localStorage wrapper functions
    function safeGetItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn(`Error accessing localStorage for key ${key}:`, error);
            return memoryStorage.get(key) || null;
        }
    }

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn(`Error setting localStorage for key ${key}:`, error);
            return false;
        }
    }

    // Try to load saved data from localStorage
    try {
        const savedAskedQuestions = safeGetItem('askedQuestions');
        if (savedAskedQuestions) {
            try {
                askedQuestions = JSON.parse(savedAskedQuestions);
            } catch (e) {
                console.warn('Failed to parse askedQuestions from localStorage');
            }
        }
        
        const savedEarnedBadges = safeGetItem('earnedBadges');
        if (savedEarnedBadges) {
            try {
                earnedBadges = JSON.parse(savedEarnedBadges);
            } catch (e) {
                console.warn('Failed to parse earnedBadges from localStorage');
            }
        }
        
        const savedBestScores = safeGetItem('bestScores');
        if (savedBestScores) {
            try {
                bestScores = JSON.parse(savedBestScores);
            } catch (e) {
                console.warn('Failed to parse bestScores from localStorage');
            }
        }
        
        const savedLastQuizState = safeGetItem('lastQuizState');
        if (savedLastQuizState) {
            try {
                lastQuizState = JSON.parse(savedLastQuizState);
            } catch (e) {
                console.warn('Failed to parse lastQuizState from localStorage');
            }
        }
    } catch (error) {
        console.warn('Error loading saved data from localStorage:', error);
    }

    // Start quiz button handler
    startQuizBtn.addEventListener('click', () => {
        const traderName = document.getElementById('trader-name').value.trim() || 'Trader';
        safeSetItem('traderName', traderName);
        
        difficultyContainer.classList.add('hidden');
        quizMainContainer.classList.remove('hidden');
        
        // Initialize quiz
        initQuiz();
        
        // Initialize timeline (replacing badges)
        initTimeline();
        
        // Get first question
        getNextQuestion();
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
        initTimeline();
        
        // Apply initial theme
        applyLevelTheme(currentLevel);
        
        // Get the next question
        getNextQuestion();
        
        // Update the timeline with current progress
        updateTimeline(currentLevel, questionsCompletedInLevel);
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
        try {
            // Add to asked questions array
            askedQuestions.push({
                question: question.question,
                timestamp: Date.now()
            });
            
            // Limit the size of the array to prevent localStorage issues
            if (askedQuestions.length > 100) {
                askedQuestions = askedQuestions.slice(-100);
            }
            
            // Save to localStorage
            safeSetItem('askedQuestions', JSON.stringify(askedQuestions));
        } catch (error) {
            console.error('Error storing asked question:', error);
        }
    }

    // Update the level display
    function updateLevelDisplay() {
        if (currentDifficultyElement) {
            currentDifficultyElement.textContent = LEVELS[currentLevel].name;
        }
        
        // Update timeline to reflect current level
        updateTimeline(currentLevel, questionsCompletedInLevel);
    }

    // Check if level progression is needed
    function checkLevelProgression() {
        // Check if user has completed enough questions for this level
        if (questionsCompletedInLevel >= LEVELS[currentLevel].questionsRequired) {
            // Check if there's a next level
            if (currentLevel < LEVELS.length - 1) {
                // Move to next level
                currentLevel++;
                questionsCompletedInLevel = 0;
                
                // Update level display
                updateLevelDisplay();
                
                // Apply new level theme
                applyLevelTheme(currentLevel);
                
                return true; // Level up occurred
            }
        }
        
        return false; // No level up
    }

    // Show level up message
    function showLevelUpMessage() {
        // Hide quiz container
        quizContainer.classList.add('hidden');
        
        // Remove any existing level complete message first
        const existingLevelComplete = document.querySelector('.level-complete');
        if (existingLevelComplete) {
            existingLevelComplete.remove();
        }
        
        // Create level complete message
        const levelCompleteContainer = document.createElement('div');
        levelCompleteContainer.className = 'level-complete text-center py-8';
        
        const completedLevel = LEVELS[currentLevel - 1]; // The level we just completed
        const nextLevel = LEVELS[currentLevel]; // The new level we're moving to
        
        levelCompleteContainer.innerHTML = `
            <div class="badge-showcase mb-6 animate-showcase-fade-in">
                <div class="text-6xl mb-4">${completedLevel.badge}</div>
                <h3 class="text-2xl font-bold mb-2">Level Complete!</h3>
                <p class="text-lg text-gray-600 mb-4">You've mastered the ${completedLevel.name} level</p>
            </div>
            <div class="mb-8">
                <h4 class="text-xl font-semibold mb-3">Next Level: ${nextLevel.name} ${nextLevel.badge}</h4>
                <p class="text-gray-600">${nextLevel.description}</p>
            </div>
            <div class="flex justify-center">
                <button id="continue-btn" class="secondary-btn py-3 px-8">Continue Journey</button>
            </div>
        `;
        
        // Insert level complete message
        quizMainContainer.insertBefore(levelCompleteContainer, quizContainer);
        
        // Award badge for completed level
        awardBadge(currentLevel - 1);
        
        // Trigger confetti celebration
        triggerConfetti();
        
        // Update timeline to show new progress
        updateTimeline(currentLevel, questionsCompletedInLevel);
        
        // Add event listener for continue button with a slight delay to ensure DOM is ready
        setTimeout(() => {
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                // Remove any existing event listeners first
                const newContinueBtn = continueBtn.cloneNode(true);
                continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
                
                // Add the event listener to the new button
                newContinueBtn.addEventListener('click', () => {
                    console.log('Continue button clicked');
                    // Remove level complete message
                    const levelCompleteToRemove = document.querySelector('.level-complete');
                    if (levelCompleteToRemove) {
                        levelCompleteToRemove.remove();
                    }
                    
                    // Show quiz container
                    quizContainer.classList.remove('hidden');
                    
                    // Get next question
                    getNextQuestion();
                });
            } else {
                console.error('Continue button not found in the DOM');
            }
        }, 100);
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

    // Show achievement toast with sharing
    function showAchievementToast(title, description, icon = '🏆') {
        try {
            const toast = document.getElementById('achievement-toast');
            const iconElement = document.getElementById('achievement-icon');
            const titleElement = document.getElementById('achievement-title');
            const descriptionElement = document.getElementById('achievement-description');
            
            if (!toast || !iconElement || !titleElement || !descriptionElement) {
                console.error('Achievement toast elements not found');
                return;
            }
            
            // Set content
            iconElement.textContent = icon;
            titleElement.textContent = title;
            descriptionElement.textContent = description;
            
            // Show toast
            toast.classList.remove('hidden');
            
            // Add share buttons event listeners
            const shareButtons = document.querySelectorAll('.share-btn');
            shareButtons.forEach(button => {
                const platform = button.dataset.platform;
                button.addEventListener('click', () => {
                    shareAchievement(platform, `${title}: ${description}`);
                });
            });
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 5000);
        } catch (error) {
            console.error('Error showing achievement toast:', error);
        }
    }

    // Show progress summary
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
                        <span class="font-bold">${completedLevels}</span>
                    </div>
                </div>
                
                ${bestScore ? `
                <div class="space-y-3 border-t border-gray-200 pt-4 mt-4">
                    <h4 class="font-bold text-lg mb-2">Best Score for ${currentLevelName}</h4>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Score:</span>
                        <span class="font-bold">${bestScore.score}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Accuracy:</span>
                        <span class="font-bold">${bestScore.accuracy}%</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Date Achieved:</span>
                        <span class="font-bold">${bestScore.date}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Current vs. Best:</span>
                        <span class="font-bold ${accuracy > bestScore.accuracy ? 'text-green-500' : 'text-gray-500'}">
                            ${accuracy > bestScore.accuracy ? `+${accuracy - bestScore.accuracy}%` : `${accuracy - bestScore.accuracy}%`}
                        </span>
                    </div>
                </div>
                ` : ''}
                
                <div class="space-y-3 border-t border-gray-200 pt-4 mt-4">
                    <h4 class="font-bold text-lg mb-2">Your Journey</h4>
                    <p class="text-gray-600">Current Level: ${LEVELS[currentLevel].name} ${LEVELS[currentLevel].badge}</p>
                    <p class="text-gray-600">Progress: ${questionsCompletedInLevel}/${LEVELS[currentLevel].questionsRequired} questions</p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-green-600 h-2.5 rounded-full" style="width: ${(questionsCompletedInLevel / LEVELS[currentLevel].questionsRequired) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        summary.classList.remove('hidden');
        
        // Close button event listener
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
            // Reset retry attempts for each new question request
            retryAttempts = 0;
            
            // Use mock data for local testing
            if (isLocalEnvironment) {
                console.log("Using mock data for local testing");
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get a random question from mock data
                const randomIndex = Math.floor(Math.random() * MOCK_QUESTIONS.length);
                const mockQuestion = MOCK_QUESTIONS[randomIndex];
                
                // Format mock question to match API response format
                const questionData = {
                    question: mockQuestion.question,
                    options: [...mockQuestion.options],
                    correctAnswer: mockQuestion.correctAnswer,
                    explanation: mockQuestion.explanation
                };
                
                // Store the question to avoid repeats
                storeAskedQuestion(questionData);
                
                // Show the question
                showQuestion(questionData);
                showLoading(false);
                return;
            }
            
            // Get recently asked questions for the prompt
            const recentQuestions = askedQuestions.slice(-20).map(q => q.question);
            
            // Prepare the prompt for OpenAI
            const prompt = `Generate a unique multiple-choice question about stock market trading at ${LEVELS[currentLevel].name} level. 

            The question should match the expertise level:
            - For Gully Investor: Focus on absolute basics and terminology
            - For higher levels: Gradually increase complexity
            - For Hedge Fund Maharathi: Include advanced concepts and strategic thinking

            The question MUST be significantly different from these recently asked questions:
            ${recentQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

            Return the response in JSON format with the following structure:
            {
                "question": "The question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0, // Index of the correct answer (0-3)
                "explanation": "Detailed explanation of why this answer is correct and others are wrong"
            }
            
            Make sure the question is:
            1. Appropriate for ${LEVELS[currentLevel].name} level
            2. Completely unique and not similar to any of the recent questions
            3. Tests a different concept or aspect than the recent questions`;
            
            // Call our API route instead of OpenAI directly
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch question from API');
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Parse the JSON response
            try {
                currentQuestion = JSON.parse(content);
                
                // Check if this question has been asked before
                if (isQuestionAskedBefore(currentQuestion)) {
                    console.log('Received a repeated question from API, requesting a new one');
                    
                    // Increment retry attempts
                    retryAttempts++;
                    if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
                        // If we've tried too many times, just use the question anyway
                        console.log('Max retry attempts reached, using repeated question');
                        askedQuestions.push(currentQuestion);
                        showQuestion(currentQuestion);
                        return;
                    }
                    
                    getNextQuestion(); // Try again with a different question
                    return;
                }
                
                // Add to asked questions list and store
                storeAskedQuestion(currentQuestion);
                
                showQuestion(currentQuestion);
            } catch (e) {
                throw new Error('Failed to parse question data from API');
            }
        } catch (error) {
            showError(`API Error: ${error.message}. Please try again later or contact support.`);
            showLoading(false);
            
            // Add a retry button
            quizContainer.innerHTML = `
                <div class="text-center p-6 bg-blue-50 rounded-lg">
                    <h2 class="text-xl font-bold text-blue-800 mb-4">Something went wrong</h2>
                    <p class="mb-4">We couldn't generate a new question. This might be due to a temporary issue.</p>
                    <button id="retry-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        Try Again
                    </button>
                    <button id="restart-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ml-2">
                        Start Over
                    </button>
                </div>
            `;
            
            document.getElementById('retry-btn').addEventListener('click', () => {
                getNextQuestion();
            });
            
            document.getElementById('restart-btn').addEventListener('click', () => {
                quizMainContainer.classList.add('hidden');
                difficultyContainer.classList.remove('hidden');
                
                // Clean up YouTube player when restarting
                cleanupYouTubePlayer();
                cleanupThinkingMusicPlayer();
            });
        }
    }

    // Show question
    function showQuestion(questionData) {
        try {
            // Store current question data
            currentQuestionData = questionData;
            
            // Display the question
            questionElement.textContent = questionData.question;
            
            // Clear previous options
            optionsContainer.innerHTML = '';
            
            // Handle different data formats (mock data vs API data)
            let allOptions = [];
            
            if (questionData.incorrectAnswers && Array.isArray(questionData.incorrectAnswers)) {
                // API format with incorrectAnswers array
                allOptions = [questionData.correctAnswer, ...questionData.incorrectAnswers];
            } else if (questionData.options && Array.isArray(questionData.options)) {
                // Mock data format with options array
                allOptions = [...questionData.options];
            } else {
                // Fallback for unexpected data format
                console.error('Invalid question data format:', questionData);
                showError('Question data is in an invalid format. Please try again.');
                return;
            }
            
            // Shuffle the options
            const shuffledOptions = shuffleArray(allOptions);
            
            // Store the index of the correct answer after shuffling
            const correctAnswerIndex = shuffledOptions.indexOf(questionData.correctAnswer);
            
            // Create and add option buttons
            shuffledOptions.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';
                button.textContent = option;
                
                // Add event listener to check answer
                button.addEventListener('click', () => {
                    // Disable all buttons to prevent multiple answers
                    const buttons = optionsContainer.querySelectorAll('button');
                    buttons.forEach(btn => {
                        btn.disabled = true;
                        
                        // Add visual feedback for correct/incorrect answers
                        if (btn === button) {
                            if (index === correctAnswerIndex) {
                                btn.className = 'w-full text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800';
                            } else {
                                btn.className = 'w-full text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900';
                            }
                        } else if (index === correctAnswerIndex) {
                            // Highlight the correct answer
                            btn.className = 'w-full text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800';
                        }
                    });
                    
                    // Check if the answer is correct
                    checkAnswer(index === correctAnswerIndex);
                });
                
                optionsContainer.appendChild(button);
            });
            
            // Show the quiz container
            showLoading(false);
            
        } catch (error) {
            console.error('Error showing question:', error);
            showError('Failed to display the question. Please try again.');
        }
    }
    
    // Function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Check answer
    function checkAnswer(isCorrect) {
        try {
            // Show feedback
            const feedbackContainer = document.getElementById('feedback-container');
            const feedbackText = document.getElementById('feedback-text');
            
            if (!feedbackContainer || !feedbackText) {
                console.error('Feedback elements not found');
                return;
            }
            
            feedbackContainer.classList.remove('hidden');
            
            // Set feedback text and style based on correctness
            if (isCorrect) {
                feedbackText.textContent = 'Correct! Well done!';
                feedbackContainer.querySelector('div').className = 'p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400';
                
                // Update score
                score++;
                scoreElement.textContent = score;
                
                // Increment consecutive correct answers
                consecutiveCorrectAnswers++;
                
                // Update best score
                updateBestScore();
            } else {
                feedbackText.textContent = 'Incorrect. The correct answer is: ' + currentQuestionData.correctAnswer;
                feedbackContainer.querySelector('div').className = 'p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400';
                
                // Reset consecutive correct answers
                consecutiveCorrectAnswers = 0;
            }
            
            // Increment questions completed in this level
            questionsCompletedInLevel++;
            
            // Update the current question display
            currentQuestionElement.textContent = currentQuestionIndex + 1;
            
            // Save quiz state
            saveQuizState();
            
            // Check if we should progress to the next level
            checkLevelProgression();
            
            // Get next question after a delay
            setTimeout(() => {
                getNextQuestion();
            }, 2000);
        } catch (error) {
            console.error('Error checking answer:', error);
            showError('An error occurred while checking your answer. Please try again.');
        }
    }
    
    // Super simple global function to go to next question
    window.goToNextQuestion = function() {
        console.log("Go to next question clicked");
        
        // Increment question index
        currentQuestionIndex++;
        
        // Save state
        window.saveQuizState();
        
        // Update best score
        window.updateBestScore();
        
        // Check level progression
        if (checkLevelProgression()) {
            // Level up - show message
            showLevelUpMessage();
        } else {
            // Continue with next question
            getNextQuestion();
        }
    };

    // Show/hide loading spinner
    function showLoading(show) {
        try {
            const loadingContainer = document.getElementById('loading-container');
            const quizContainer = document.getElementById('quiz-container');
            
            if (!loadingContainer || !quizContainer) {
                console.error('Loading or quiz container elements not found');
                return;
            }
            
            if (show) {
                loadingContainer.classList.remove('hidden');
                quizContainer.classList.add('hidden');
            } else {
                loadingContainer.classList.add('hidden');
                quizContainer.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error toggling loading state:', error);
        }
    }

    // Show error message
    function showError(message) {
        try {
            const errorContainer = document.getElementById('error-container');
            const errorMessage = document.getElementById('error-message');
            
            if (!errorContainer || !errorMessage) {
                console.error('Error container elements not found');
                return;
            }
            
            // Set error message
            errorMessage.textContent = message;
            
            // Show error container
            errorContainer.classList.remove('hidden');
            
            // Hide loading indicator
            showLoading(false);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }

    // Initialize timeline display (replacing badges)
    function initTimeline() {
        const timelineContainer = document.getElementById('timeline-container');
        const timeline = document.getElementById('timeline');
        
        if (!timelineContainer || !timeline) {
            console.error('Timeline elements not found in the DOM');
            return;
        }
        
        timeline.innerHTML = '';
        
        // Determine which levels are completed based on earned badges
        LEVELS.forEach((level, index) => {
            const isCompleted = earnedBadges.includes(index);
            const isCurrent = index === currentLevel;
            const isFuture = index > currentLevel;
            
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            // Determine the status class
            let statusClass = '';
            
            if (isCompleted) {
                statusClass = 'completed';
            } else if (isCurrent) {
                statusClass = 'current';
            } else {
                statusClass = 'future';
            }
            
            timelineItem.innerHTML = `
                <div class="timeline-marker ${statusClass}">${level.badge}</div>
                <div class="timeline-content">
                    <div class="timeline-level ${statusClass}">
                        <span>${level.name}</span>
                    </div>
                    <div class="timeline-description">
                        ${level.description}
                        ${isCompleted ? '<span class="text-green-500 ml-1">Completed</span>' : ''}
                        ${isCurrent ? '<span class="text-blue-500 ml-1">In Progress</span>' : ''}
                    </div>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        });
        
        timelineContainer.classList.remove('hidden');
    }

    // Apply level-specific theme
    function applyLevelTheme(level) {
        const root = document.documentElement;
        
        // Set level-specific colors based on Robinhood's aesthetic
        switch(level) {
            case 0: // Gully Investor
                root.style.setProperty('--color-accent', '#00C805'); // Robinhood green
                break;
            case 1: // Rookie Trader
                root.style.setProperty('--color-accent', '#00B8D9');
                break;
            case 2: // Market Enthusiast
                root.style.setProperty('--color-accent', '#36B37E');
                break;
            case 3: // Savvy Investor
                root.style.setProperty('--color-accent', '#00875A');
                break;
            case 4: // Technical Analyst
                root.style.setProperty('--color-accent', '#0052CC');
                break;
            case 5: // Chart Master
                root.style.setProperty('--color-accent', '#5243AA');
                break;
            case 6: // Swing Trader
                root.style.setProperty('--color-accent', '#FF5630');
                break;
            case 7: // Options Specialist
                root.style.setProperty('--color-accent', '#FF8B00');
                break;
            case 8: // Portfolio Manager
                root.style.setProperty('--color-accent', '#6554C0');
                break;
            case 9: // Hedge Fund Maharathi
                root.style.setProperty('--color-accent', '#172B4D');
                break;
            default:
                root.style.setProperty('--color-accent', '#00C805'); // Default Robinhood green
        }
        
        // Update accent light color based on the accent color
        const accentColor = getComputedStyle(root).getPropertyValue('--color-accent');
        const accentLight = accentColor + '15'; // Add 15% opacity
        root.style.setProperty('--color-accent-light', accentLight);
    }

    // Award badge for completed level
    function awardBadge(level) {
        if (!earnedBadges.includes(level)) {
            earnedBadges.push(level);
            localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
            
            // Update timeline display
            initTimeline();
            
            // Show achievement toast
            const levelInfo = LEVELS[level];
            showAchievementToast(
                `${levelInfo.badge} Level Completed!`, 
                `You've mastered the ${levelInfo.name} level!`,
                levelInfo.badge
            );
        }
    }

    // Save quiz state for resuming later
    window.saveQuizState = function() {
        try {
            const quizState = {
                currentLevel,
                questionsCompletedInLevel,
                currentQuestionIndex,
                score
            };
            
            safeSetItem('quizState', JSON.stringify(quizState));
            lastQuizState = quizState;
        } catch (error) {
            console.error('Error saving quiz state:', error);
        }
    };

    // Update best score for the current level
    window.updateBestScore = function() {
        try {
            const currentLevelName = LEVELS[currentLevel].name;
            const totalQuestions = currentQuestionIndex + 1;
            const accuracy = Math.round((score / totalQuestions) * 100);
            const currentDate = new Date().toLocaleDateString();
            
            // Check if we have a best score for this level
            if (!bestScores[currentLevelName] || bestScores[currentLevelName].accuracy < accuracy) {
                bestScores[currentLevelName] = {
                    score: score,
                    accuracy: accuracy,
                    date: currentDate
                };
                
                // Save to localStorage
                safeSetItem('bestScores', JSON.stringify(bestScores));
            }
        } catch (error) {
            console.error('Error updating best score:', error);
        }
    };

    // Check for saved quiz state and show resume option
    function checkForResumeState() {
        try {
            // Check if we have a saved quiz state
            const savedState = safeGetItem('quizState');
            if (!savedState) {
                return;
            }
            
            try {
                // Parse the saved state
                lastQuizState = JSON.parse(savedState);
                if (!lastQuizState || typeof lastQuizState !== 'object') {
                    console.warn('Invalid quiz state format:', lastQuizState);
                    return;
                }
            } catch (parseError) {
                console.error('Error parsing saved quiz state:', parseError);
                return;
            }
            
            // Get fresh references to DOM elements
            const difficultyContainer = document.getElementById('difficulty-container');
            if (!difficultyContainer) {
                console.warn('Difficulty container not found, cannot add resume option');
                return; // No container to add to
            }
            
            // Check if resume container already exists
            let resumeQuizContainer = document.getElementById('resume-quiz-container');
            
            // If the resume container doesn't exist, we'll add it dynamically
            if (!resumeQuizContainer) {
                // Create resume section
                const resumeSection = document.createElement('div');
                resumeSection.id = 'resume-quiz-container';
                resumeSection.className = 'mb-8 p-4 border border-green-200 bg-green-50 rounded-lg';
                
                const level = LEVELS[lastQuizState.currentLevel];
                if (!level) {
                    console.warn('Invalid level in saved state:', lastQuizState.currentLevel);
                    return;
                }
                
                const traderName = safeGetItem('traderName') || 'Trader';
                
                resumeSection.innerHTML = `
                    <h3 class="text-lg font-semibold mb-2">Resume Your Quiz</h3>
                    <p id="resume-level" class="mb-1">${traderName} - Level: ${level.name}</p>
                    <p id="resume-score" class="mb-3">Score: ${lastQuizState.score}</p>
                    <button id="resume-quiz-btn" class="secondary-btn py-2 px-4 w-full">Resume Previous Quiz</button>
                `;
                
                // Insert at the beginning of the difficulty container
                difficultyContainer.insertBefore(resumeSection, difficultyContainer.firstChild);
                
                // Add event listener for the resume button
                document.getElementById('resume-quiz-btn').addEventListener('click', () => {
                    difficultyContainer.classList.add('hidden');
                    quizMainContainer.classList.remove('hidden');
                    
                    // Initialize quiz with resume state
                    initQuiz(true);
                    
                    // Get next question
                    getNextQuestion();
                });
                
                // Pre-fill the name input if resuming
                const traderNameInput = document.getElementById('trader-name');
                if (traderNameInput) {
                    traderNameInput.value = traderName;
                }
            } else {
                // If the container exists, update it
                const resumeLevel = document.getElementById('resume-level');
                const resumeScore = document.getElementById('resume-score');
                
                if (resumeLevel && resumeScore) {
                    const level = LEVELS[lastQuizState.currentLevel];
                    const traderName = safeGetItem('traderName') || 'Trader';
                    resumeLevel.textContent = `${traderName} - Level: ${level.name}`;
                    resumeScore.textContent = `Score: ${lastQuizState.score}`;
                    resumeQuizContainer.classList.remove('hidden');
                    
                    // Pre-fill the name input if resuming
                    const traderNameInput = document.getElementById('trader-name');
                    if (traderNameInput) {
                        traderNameInput.value = traderName;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for resume state:', error);
        }
    }

    // Display best scores in the preview section
    function displayBestScores() {
        try {
            // If no best scores, nothing to display
            if (Object.keys(bestScores).length === 0) {
                return;
            }
            
            // Get fresh reference to DOM elements
            const bestScoresPreview = document.getElementById('best-scores-preview');
            
            // If the best scores preview doesn't exist, we'll add it dynamically
            if (!bestScoresPreview) {
                // We'll check if the difficulty container exists to add the best scores
                const difficultyContainer = document.getElementById('difficulty-container');
                if (!difficultyContainer) {
                    return; // No container to add to
                }
                
                // Create best scores section
                const bestScoresSection = document.createElement('div');
                bestScoresSection.id = 'best-scores-preview';
                bestScoresSection.className = 'mt-8 p-4 border border-blue-200 bg-blue-50 rounded-lg';
                
                bestScoresSection.innerHTML = `
                    <h3 class="text-lg font-semibold mb-3">Your Best Scores</h3>
                    <div id="best-scores-list" class="space-y-2">
                        <!-- Best scores will be inserted here -->
                    </div>
                `;
                
                // Insert before the feature cards
                const featureCards = difficultyContainer.querySelector('.grid');
                if (featureCards) {
                    difficultyContainer.insertBefore(bestScoresSection, featureCards);
                } else {
                    difficultyContainer.appendChild(bestScoresSection);
                }
                
                // Now populate the best scores
                const bestScoresList = document.getElementById('best-scores-list');
                if (bestScoresList) {
                    // Sort levels by their order in LEVELS array
                    const sortedLevels = Object.keys(bestScores).sort((a, b) => {
                        const indexA = LEVELS.findIndex(level => level.name === a);
                        const indexB = LEVELS.findIndex(level => level.name === b);
                        return indexA - indexB;
                    });
                    
                    // Display top 4 best scores
                    const topScores = sortedLevels.slice(0, 4);
                    
                    topScores.forEach(levelName => {
                        const score = bestScores[levelName];
                        const levelIndex = LEVELS.findIndex(level => level.name === levelName);
                        const levelBadge = levelIndex >= 0 ? LEVELS[levelIndex].badge : '🏆';
                        
                        const scoreItem = document.createElement('div');
                        scoreItem.className = 'flex items-center justify-between';
                        scoreItem.innerHTML = `
                            <div class="flex items-center">
                                <span class="text-xl mr-2">${levelBadge}</span>
                                <span class="font-medium">${levelName}</span>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold">${score.accuracy}%</div>
                                <div class="text-xs text-gray-500">${score.date}</div>
                            </div>
                        `;
                        
                        bestScoresList.appendChild(scoreItem);
                    });
                }
            } else {
                // If the container exists, update it
                const bestScoresList = document.getElementById('best-scores-list');
                
                if (bestScoresList) {
                    bestScoresList.innerHTML = '';
                    
                    // Sort levels by their order in LEVELS array
                    const sortedLevels = Object.keys(bestScores).sort((a, b) => {
                        const indexA = LEVELS.findIndex(level => level.name === a);
                        const indexB = LEVELS.findIndex(level => level.name === b);
                        return indexA - indexB;
                    });
                    
                    // Display top 4 best scores
                    const topScores = sortedLevels.slice(0, 4);
                    
                    topScores.forEach(levelName => {
                        const score = bestScores[levelName];
                        const levelIndex = LEVELS.findIndex(level => level.name === levelName);
                        const levelBadge = levelIndex >= 0 ? LEVELS[levelIndex].badge : '🏆';
                        
                        const scoreItem = document.createElement('div');
                        scoreItem.className = 'flex items-center justify-between';
                        scoreItem.innerHTML = `
                            <div class="flex items-center">
                                <span class="text-xl mr-2">${levelBadge}</span>
                                <span class="font-medium">${levelName}</span>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold">${score.accuracy}%</div>
                                <div class="text-xs text-gray-500">${score.date}</div>
                            </div>
                        `;
                        
                        bestScoresList.appendChild(scoreItem);
                    });
                    
                    bestScoresPreview.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error displaying best scores:', error);
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
        
        // Apply level-specific color to certificate
        const certificateLevel = document.getElementById('certificate-level');
        const certificateName = document.getElementById('certificate-trader-name');
        
        certificateLevel.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
        certificateName.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
        
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

    // Initial setup
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize timeline
        initTimeline();
        
        // Add event listeners for start button
        document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
        
        // Check for resume state
        checkForResumeState();
        
        // Display best scores
        displayBestScores();
    });

    /**
     * Initialize the timeline navigation
     */
    function initTimelineNavigation() {
        try {
            const timeline = document.getElementById('timeline');
            const timelineContainer = document.querySelector('.timeline-scroll-container');
            const prevButton = document.getElementById('timeline-prev');
            const nextButton = document.getElementById('timeline-next');
            
            if (!timeline || !timelineContainer || !prevButton || !nextButton) {
                console.error('Timeline navigation elements not found');
                return;
            }
            
            // Scroll to the current level
            const currentItem = timeline.querySelector('.timeline-marker.current');
            if (currentItem) {
                const itemRect = currentItem.getBoundingClientRect();
                const containerRect = timelineContainer.getBoundingClientRect();
                const scrollLeft = itemRect.left - containerRect.left - (containerRect.width / 2) + (itemRect.width / 2);
                
                timelineContainer.scrollLeft = scrollLeft;
            }
            
            // Update navigation buttons
            updateNavButtons();
            
            // Add event listeners for navigation buttons
            prevButton.addEventListener('click', () => {
                timelineContainer.scrollBy({
                    left: -200,
                    behavior: 'smooth'
                });
                setTimeout(updateNavButtons, 300);
            });
            
            nextButton.addEventListener('click', () => {
                timelineContainer.scrollBy({
                    left: 200,
                    behavior: 'smooth'
                });
                setTimeout(updateNavButtons, 300);
            });
            
            // Add scroll event listener to update buttons
            timelineContainer.addEventListener('scroll', updateNavButtons);
            
            function updateNavButtons() {
                const scrollLeft = timelineContainer.scrollLeft;
                const maxScrollLeft = timelineContainer.scrollWidth - timelineContainer.clientWidth;
                
                prevButton.disabled = scrollLeft <= 0;
                nextButton.disabled = scrollLeft >= maxScrollLeft;
                
                prevButton.classList.toggle('opacity-50', scrollLeft <= 0);
                nextButton.classList.toggle('opacity-50', scrollLeft >= maxScrollLeft);
            }
        } catch (error) {
            console.error('Error initializing timeline navigation:', error);
        }
    }

    // Update the updateTimeline function to work with horizontal layout
    function updateTimeline(currentLevel, questionsCompletedInLevel) {
        try {
            const timeline = document.getElementById('timeline');
            
            if (!timeline) {
                console.error('Timeline element not found');
                return;
            }
            
            timeline.innerHTML = '';
            
            // Determine which levels are completed based on earned badges
            LEVELS.forEach((level, index) => {
                const isCompleted = earnedBadges.includes(index);
                const isCurrent = index === currentLevel;
                const isFuture = index > currentLevel;
                
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                // Determine the status class
                let statusClass = '';
                
                if (isCompleted) {
                    statusClass = 'completed';
                } else if (isCurrent) {
                    statusClass = 'current';
                } else {
                    statusClass = 'future';
                }
                
                timelineItem.innerHTML = `
                    <div class="timeline-marker ${statusClass}">${level.badge}</div>
                    <div class="timeline-content">
                        <div class="timeline-level ${statusClass}">
                            <span>${level.name}</span>
                        </div>
                        <div class="timeline-description">
                            ${level.description}
                            ${isCompleted ? '<span class="text-green-500 ml-1">Completed</span>' : ''}
                            ${isCurrent ? '<span class="text-blue-500 ml-1">In Progress</span>' : ''}
                        </div>
                    </div>
                `;
                
                timeline.appendChild(timelineItem);
            });
            
            // Initialize timeline navigation
            initTimelineNavigation();
        } catch (error) {
            console.error('Error updating timeline:', error);
        }
    }

    // Show difficulty selection
    function showDifficultySelection() {
        try {
            // Get fresh references to DOM elements
            const difficultyContainer = document.getElementById('difficulty-container');
            const quizMainContainer = document.getElementById('quiz-main-container');
            const timelineContainer = document.getElementById('timeline-container');
            
            if (!difficultyContainer || !quizMainContainer || !timelineContainer) {
                console.error('Required containers not found');
                return;
            }
            
            // Reset quiz state
            currentLevel = 0;
            questionsCompletedInLevel = 0;
            currentQuestionIndex = 0;
            score = 0;
            consecutiveCorrectAnswers = 0;
            
            // Update the timeline with the current state
            updateTimeline(currentLevel, questionsCompletedInLevel);
            
            // Show difficulty selection, hide quiz container
            difficultyContainer.classList.remove('hidden');
            quizMainContainer.classList.add('hidden');
            timelineContainer.style.display = 'block';
            
            // Check for resume state and display best scores
            checkForResumeState();
            displayBestScores();
        } catch (error) {
            console.error('Error showing difficulty selection:', error);
        }
    }

    // Check for resume state and display best scores after DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize timeline
        updateTimeline(currentLevel, questionsCompletedInLevel);
        
        // Check for resume state and display best scores
        setTimeout(() => {
            checkForResumeState();
            displayBestScores();
        }, 100);
    });
}); 