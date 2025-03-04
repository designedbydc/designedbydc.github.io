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

    // Quiz state
    let currentLevel = 0; // Index into LEVELS array
    let questionsCompletedInLevel = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let missedQuestions = [];
    let userPerformance = [];
    let currentQuestion = null;
    let consecutiveCorrectAnswers = 0;
    
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

    // Start quiz button handler
    startQuizBtn.addEventListener('click', () => {
        const traderName = document.getElementById('trader-name').value.trim() || 'Trader';
        localStorage.setItem('traderName', traderName);
        
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
        currentDifficultyElement.textContent = LEVELS[currentLevel].name;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = (questionsCompletedInLevel / LEVELS[currentLevel].questionsRequired) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.style.backgroundColor = LEVELS[currentLevel].theme.primary;
        
        // Update timeline to reflect current level
        initTimeline();
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
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <button id="continue-btn" class="secondary-btn py-3 px-8">Continue Journey</button>
                <button id="view-progress-btn" class="secondary-btn py-3 px-8">View Progress</button>
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
        
        // Add event listeners for buttons
        document.getElementById('continue-btn').addEventListener('click', () => {
            // Remove level complete message
            levelCompleteContainer.remove();
            
            // Show quiz container
            quizContainer.classList.remove('hidden');
            
            // Get next question
            getNextQuestion();
        });
        
        document.getElementById('view-progress-btn').addEventListener('click', () => {
            showProgressSummary();
        });
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
        const toast = document.getElementById('achievement-toast');
        const iconElement = document.getElementById('achievement-icon');
        const titleElement = document.getElementById('achievement-title');
        const descriptionElement = document.getElementById('achievement-description');
        
        // Set content
        iconElement.textContent = icon;
        titleElement.textContent = title;
        descriptionElement.textContent = description;
        
        // Show toast
        toast.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.5s forwards';
            setTimeout(() => {
                toast.classList.add('hidden');
                toast.style.animation = '';
            }, 500);
        }, 5000);
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
        // Hide loading and feedback
        showLoading(false);
        feedbackContainer.classList.add('hidden');
        
        const questionElement = document.getElementById('question');
        const optionsContainer = document.getElementById('options-container');
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Set question text
        questionElement.textContent = questionData.question;
        
        // Handle the correct answer based on the data structure
        let correctAnswer, correctIndex;
        
        if (questionData.correctAnswer !== undefined) {
            // For mock data format (correctAnswer is the index)
            correctAnswer = questionData.options[questionData.correctAnswer];
            correctIndex = questionData.correctAnswer;
        } else {
            // For API response format (first option is assumed correct)
            correctAnswer = questionData.options[0];
            correctIndex = 0;
        }
        
        // Create a copy of all options
        const allOptions = [...questionData.options];
        
        // Shuffle the options array
        const shuffledOptions = shuffleArray(allOptions);
        
        // Find the new index of the correct answer after shuffling
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
        
        // Create option buttons with shuffled order
        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.dataset.index = index;
            
            // Ensure text color is visible - set explicitly
            button.style.color = 'var(--color-black)';
            button.style.backgroundColor = 'var(--color-white)';
            
            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                document.querySelectorAll('.option-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to clicked button
                button.classList.add('selected');
                
                // Check if the selected option is the correct answer
                const isCorrect = index === newCorrectIndex;
                
                // Provide immediate visual feedback
                if (isCorrect) {
                    button.style.borderColor = 'var(--color-green)';
                    button.style.backgroundColor = 'var(--color-accent-light)';
                } else {
                    button.style.borderColor = 'var(--color-error)';
                    button.style.backgroundColor = '#FFEBEE'; // Light red background
                }
                
                checkAnswer(isCorrect);
            });
            
            optionsContainer.appendChild(button);
        });
        
        // Store the correct index for reference
        currentQuestionData = {
            ...questionData,
            correctIndex: newCorrectIndex,
            shuffledOptions: shuffledOptions
        };
        
        // Show question container with animation
        quizContainer.classList.add('fade-in');
        
        // Update the timeline to reflect progress within the level
        updateTimeline(currentLevel, questionsCompletedInLevel);
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
        // Track user performance for level progression
        if (isCorrect) {
            consecutiveCorrectAnswers++;
            questionsCompletedInLevel++;
        } else {
            consecutiveCorrectAnswers = 0;
        }
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${(questionsCompletedInLevel / LEVELS[currentLevel].questionsRequired) * 100}%`;
        
        // Disable all option buttons
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.disabled = true;
            
            // Highlight the correct answer
            if (parseInt(button.dataset.index) === currentQuestionData.correctIndex) {
                button.style.borderColor = 'var(--color-green)';
                button.style.backgroundColor = 'var(--color-accent-light)';
            }
            
            // Highlight the selected incorrect answer in red
            if (!isCorrect && button.classList.contains('selected')) {
                button.style.borderColor = 'var(--color-error)';
                button.style.backgroundColor = '#FFEBEE'; // Light red background
            }
        });
        
        // Update feedback based on answer correctness
        feedbackContainer.classList.remove('hidden', 'feedback-correct', 'feedback-incorrect');
        feedbackContainer.classList.add(isCorrect ? 'feedback-correct' : 'feedback-incorrect');
        
        // Update score if correct
        if (isCorrect) {
            score++;
            document.getElementById('score').textContent = score;
        }
        
        // Super simple approach with basic HTML and direct onclick attribute
        feedbackText.innerHTML = `
            <div class="flex items-center mb-2">
                <span class="text-2xl mr-2">${isCorrect ? '✓' : '✗'}</span>
                <span class="font-semibold">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            ${!isCorrect ? `<p>The correct answer is: ${currentQuestionData.shuffledOptions[currentQuestionData.correctIndex]}</p>` : ''}
            <p class="${!isCorrect ? 'mt-2' : ''}">${currentQuestionData.explanation || (isCorrect ? 'Great job!' : 'Better luck next time!')}</p>
            <div class="text-center mt-6">
                <button onclick="goToNextQuestion()" id="next-question-btn" class="mt-4 next-btn py-2 px-6 text-white font-bold">Next Question</button>
            </div>
        `;
        
        // Add animation
        feedbackContainer.classList.add('fade-in');
        
        // Update the timeline to reflect progress within the level
        updateTimeline(currentLevel, questionsCompletedInLevel);
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
        if (show) {
            loadingContainer.classList.remove('hidden');
            quizContainer.classList.add('hidden');
        } else {
            loadingContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
        }
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
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
            let statusIcon = '';
            
            if (isCompleted) {
                statusClass = 'completed';
                statusIcon = '✓';
            } else if (isCurrent) {
                statusClass = 'current';
                statusIcon = '';
            } else {
                statusClass = 'future';
                statusIcon = '';
            }
            
            timelineItem.innerHTML = `
                <div class="timeline-marker ${statusClass}">${statusIcon}</div>
                <div class="timeline-content">
                    <div class="timeline-level ${statusClass}">
                        <span class="timeline-level-icon">${level.badge}</span>
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
            localStorage.setItem('lastQuizState', JSON.stringify(quizState));
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
                localStorage.setItem('bestScores', JSON.stringify(bestScores));
            }
        } catch (error) {
            console.error('Error updating best score:', error);
        }
    };

    // Check for saved quiz state and show resume option
    function checkForResumeState() {
        try {
            // Get fresh references to DOM elements
            const resumeQuizContainer = document.getElementById('resume-quiz-container');
            const resumeLevel = document.getElementById('resume-level');
            const resumeScore = document.getElementById('resume-score');
            
            if (!resumeQuizContainer || !resumeLevel || !resumeScore) {
                console.error('Resume quiz elements not found in the DOM');
                return;
            }
            
            if (lastQuizState) {
                const level = LEVELS[lastQuizState.currentLevel];
                const traderName = localStorage.getItem('traderName') || 'Trader';
                resumeLevel.textContent = `${traderName} - Level: ${level.name}`;
                resumeScore.textContent = `Score: ${lastQuizState.score}`;
                resumeQuizContainer.classList.remove('hidden');
                
                // Pre-fill the name input if resuming
                const traderNameInput = document.getElementById('trader-name');
                if (traderNameInput) {
                    traderNameInput.value = traderName;
                }
            } else if (resumeQuizContainer) {
                resumeQuizContainer.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error checking for resume state:', error);
        }
    }

    // Display best scores in the preview section
    function displayBestScores() {
        try {
            // Get fresh reference to DOM elements
            const bestScoresPreview = document.getElementById('best-scores-preview');
            const bestScoresList = document.getElementById('best-scores-list');
            
            if (!bestScoresPreview || !bestScoresList) {
                console.error('Best scores elements not found in the DOM');
                return;
            }
            
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
        const timeline = document.getElementById('timeline');
        const prevBtn = document.getElementById('timeline-prev');
        const nextBtn = document.getElementById('timeline-next');
        const scrollContainer = document.querySelector('.timeline-scroll-container');
        
        if (!timeline || !prevBtn || !nextBtn || !scrollContainer) {
            console.error('Timeline navigation elements not found');
            return;
        }
        
        let scrollPosition = 0;
        const scrollStep = 300; // pixels to scroll each time
        
        // Initial button state
        updateNavButtons();
        
        // Add event listeners to the buttons
        prevBtn.addEventListener('click', () => {
            scrollPosition = Math.max(scrollPosition - scrollStep, 0);
            timeline.style.transform = `translateX(-${scrollPosition}px)`;
            updateNavButtons();
        });
        
        nextBtn.addEventListener('click', () => {
            const maxScroll = timeline.scrollWidth - scrollContainer.clientWidth;
            scrollPosition = Math.min(scrollPosition + scrollStep, maxScroll);
            timeline.style.transform = `translateX(-${scrollPosition}px)`;
            updateNavButtons();
        });
        
        // Update button states based on scroll position
        function updateNavButtons() {
            prevBtn.disabled = scrollPosition <= 0;
            nextBtn.disabled = scrollPosition >= timeline.scrollWidth - scrollContainer.clientWidth;
            
            // Visual feedback for disabled state
            prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Reset position if we're scrolled too far after resize
            const maxScroll = timeline.scrollWidth - scrollContainer.clientWidth;
            if (scrollPosition > maxScroll) {
                scrollPosition = maxScroll > 0 ? maxScroll : 0;
                timeline.style.transform = `translateX(-${scrollPosition}px)`;
            }
            updateNavButtons();
        });
    }

    // Update the updateTimeline function to work with horizontal layout
    function updateTimeline(currentLevel, questionsCompletedInLevel) {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;
        
        // Clear existing timeline
        timeline.innerHTML = '';
        
        // Define level data
        const levels = [
            { name: "Novice", icon: "🔰", description: "Basic market concepts" },
            { name: "Apprentice", icon: "📊", description: "Understanding stocks" },
            { name: "Trader", icon: "��", description: "Trading strategies" },
            { name: "Analyst", icon: "📈", description: "Technical analysis" },
            { name: "Expert", icon: "🏆", description: "Advanced concepts" },
            { name: "Master", icon: "🌟", description: "Market mastery" }
        ];
        
        // Create timeline items
        levels.forEach((level, index) => {
            const levelNum = index + 1;
            const status = levelNum < currentLevel ? 'completed' : 
                          levelNum === currentLevel ? 'current' : 'future';
            
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const marker = document.createElement('div');
            marker.className = `timeline-marker ${status}`;
            if (status === 'completed') {
                marker.innerHTML = '✓';
            } else if (status === 'current') {
                // Show progress within current level
                const progress = Math.min(Math.round((questionsCompletedInLevel / QUESTIONS_PER_LEVEL) * 100), 100);
                marker.innerHTML = `<span style="font-size: 0.7em;">${progress}%</span>`;
            } else {
                marker.innerHTML = levelNum;
            }
            
            const content = document.createElement('div');
            content.className = 'timeline-content';
            
            const levelEl = document.createElement('div');
            levelEl.className = `timeline-level ${status}`;
            
            const levelIcon = document.createElement('span');
            levelIcon.className = 'timeline-level-icon';
            levelIcon.textContent = level.icon;
            
            const levelName = document.createElement('span');
            levelName.textContent = level.name;
            
            levelEl.appendChild(levelIcon);
            levelEl.appendChild(levelName);
            
            const description = document.createElement('div');
            description.className = 'timeline-description';
            description.textContent = level.description;
            
            content.appendChild(levelEl);
            content.appendChild(description);
            
            item.appendChild(marker);
            item.appendChild(content);
            timeline.appendChild(item);
        });
        
        // Initialize timeline navigation after updating the timeline
        initTimelineNavigation();
    }

    // Update showDifficultySelection function to show the timeline
    function showDifficultySelection() {
        // ... existing code ...
        
        // Show the timeline container
        const timelineContainer = document.getElementById('timeline-container');
        if (timelineContainer) {
            timelineContainer.style.display = 'block';
        }
        
        // Update the timeline with initial state
        updateTimeline(currentLevel, questionsCompletedInLevel);
        
        // ... existing code ...
    }
}); 