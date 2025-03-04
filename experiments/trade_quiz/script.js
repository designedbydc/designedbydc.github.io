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
                            <span class="font-bold">${bestScore.score}/${bestScore.questionsAnswered}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Best Accuracy:</span>
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
            // Reset retry attempts for each new question request
            retryAttempts = 0;
            
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
        
        // Randomize the order of options
        const correctAnswer = questionData.options[0]; // Store the correct answer (first option)
        const allOptions = [...questionData.options]; // Create a copy of all options
        
        // Shuffle the options array
        const shuffledOptions = shuffleArray(allOptions);
        
        // Find the new index of the correct answer after shuffling
        const correctIndex = shuffledOptions.indexOf(correctAnswer);
        
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
                const isCorrect = index === correctIndex;
                
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
            correctIndex: correctIndex,
            shuffledOptions: shuffledOptions
        };
        
        // Show question container with animation
        quizContainer.classList.add('fade-in');
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
        
        if (isCorrect) {
            score++;
            document.getElementById('score').textContent = score;
            feedbackText.innerHTML = `
                <div class="flex items-center mb-2">
                    <span class="text-2xl mr-2">✓</span>
                    <span class="font-semibold">Correct!</span>
                </div>
                <p>${currentQuestionData.explanation || 'Great job!'}</p>
                <button id="next-question-btn" onclick="window.handleNextQuestion()" class="mt-4 next-btn py-2 px-6 text-white font-bold">Next Question</button>
            `;
        } else {
            feedbackText.innerHTML = `
                <div class="flex items-center mb-2">
                    <span class="text-2xl mr-2">✗</span>
                    <span class="font-semibold">Incorrect</span>
                </div>
                <p>The correct answer is: ${currentQuestionData.shuffledOptions[currentQuestionData.correctIndex]}</p>
                <p class="mt-2">${currentQuestionData.explanation || 'Better luck next time!'}</p>
                <button id="next-question-btn" onclick="window.handleNextQuestion()" class="mt-4 next-btn py-2 px-6 text-white font-bold">Next Question</button>
            `;
        }
        
        feedbackContainer.classList.add('fade-in');
    }
    
    // Handle next question - now simplified since we're using event delegation
    // Make it globally accessible for the inline onclick handler
    window.handleNextQuestion = function() {
        console.log("Next question button clicked"); // Debug log
        
        currentQuestionIndex++;
        
        // Save quiz state after each answer
        saveQuizState();
        
        // Update best score if applicable
        updateBestScore();
        
        // Check if level progression is needed
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
        } else {
            resumeQuizContainer.classList.add('hidden');
        }
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
        // Initialize badges
        initBadges();
        
        // Add event listeners for start button
        document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
        
        // Check for resume state
        checkForResumeState();
        
        // Add global event delegation for dynamically created elements
        document.addEventListener('click', function(event) {
            // Next question button handling
            if (event.target && event.target.id === 'next-question-btn') {
                handleNextQuestion();
            }
        });
        
        // Display best scores
        displayBestScores();
    });
}); 