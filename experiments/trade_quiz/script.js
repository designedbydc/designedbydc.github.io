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
    const MAX_STORED_QUESTIONS = 500; // Maximum number of questions to store in history

    // Track earned badges
    let earnedBadges = JSON.parse(localStorage.getItem('earnedBadges') || '[]');
    
    // Apply dark mode to all elements by default
    applyDarkMode();

    // Start quiz button handler
    startQuizBtn.addEventListener('click', () => {
        // Hide difficulty container and show quiz
        difficultyContainer.classList.add('hidden');
        quizMainContainer.classList.remove('hidden');
        
        // Start the quiz
        initQuiz();
    });

    // Initialize the quiz
    function initQuiz() {
        // Clean up any YouTube player
        cleanupYouTubePlayer();
        cleanupThinkingMusicPlayer();
        
        currentQuestionIndex = 0;
        currentLevel = 0;
        questionsCompletedInLevel = 0;
        score = 0;
        missedQuestions = [];
        userPerformance = [];
        consecutiveCorrectAnswers = 0;
        
        // Load asked questions from localStorage instead of resetting
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
        
        // Get the first question
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
            </div>
        `;

        // Add event listener to the continue button
        setTimeout(() => {
            const continueBtn = document.getElementById('continue-btn');
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
        }, 100);
    }

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

    // Display the current question
    function showQuestion(questionData) {
        showLoading(false);
        
        questionElement.textContent = questionData.question;
        optionsContainer.innerHTML = '';
        
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('w-full', 'text-left', 'p-4', 'rounded-2xl', 
                'transition', 'duration-300', 'border', 
                'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'option-btn', 'dark-mode');
            
            button.addEventListener('click', () => checkAnswer(index));
            optionsContainer.appendChild(button);
        });
        
        feedbackContainer.classList.add('hidden');
        quizContainer.classList.add('fade-in');
    }

    // Check if the selected answer is correct
    function checkAnswer(selectedIndex) {
        const isCorrect = selectedIndex === currentQuestion.correctAnswer;
        
        // Track user performance
        userPerformance.push(isCorrect);
        
        // Update consecutive correct answers counter
        if (isCorrect) {
            consecutiveCorrectAnswers++;
            questionsCompletedInLevel++;
        } else {
            consecutiveCorrectAnswers = 0;
        }
        
        // Disable all option buttons
        const optionButtons = optionsContainer.querySelectorAll('button');
        optionButtons.forEach(button => {
            button.disabled = true;
        });
        
        if (isCorrect) {
            score++;
            scoreElement.textContent = score;
            optionButtons[selectedIndex].style.borderColor = LEVELS[currentLevel].theme.primary;
            optionButtons[selectedIndex].style.borderWidth = '2px';
            
            feedbackContainer.classList.remove('hidden', 'feedback-incorrect');
            feedbackContainer.classList.add('feedback-correct');
            
            // Check for level progression
            checkLevelProgression();
            
            if (questionsCompletedInLevel < LEVELS[currentLevel].questionsRequired) {
                feedbackText.textContent = "Correct! Well done.";
                // Move to the next question after a delay for correct answers
                setTimeout(() => {
                    currentQuestionIndex++;
                    currentQuestionElement.textContent = currentQuestionIndex + 1;
                    getNextQuestion();
                }, 2000);
            }
        } else {
            optionButtons[selectedIndex].style.borderColor = LEVELS[currentLevel].theme.accent;
            optionButtons[selectedIndex].style.borderWidth = '2px';
            optionButtons[currentQuestion.correctAnswer].style.borderColor = LEVELS[currentLevel].theme.primary;
            optionButtons[currentQuestion.correctAnswer].style.borderWidth = '2px';
            
            feedbackContainer.classList.remove('hidden', 'feedback-correct');
            feedbackContainer.classList.add('feedback-incorrect');
            
            // Create a container for the explanation and next button
            const explanationHTML = `
                <div>
                    <p class="mb-4 text-lg">${currentQuestion.explanation}</p>
                    <div class="text-center mt-6">
                        <button id="next-question-btn" class="secondary-btn dark-mode py-3 px-8 transition duration-300">
                            Next Question
                        </button>
                    </div>
                </div>
            `;
            
            feedbackText.innerHTML = `<strong class="text-xl block mb-3">Incorrect</strong> ${explanationHTML}`;
            
            // Add event listener to the next question button
            setTimeout(() => {
                const nextQuestionBtn = document.getElementById('next-question-btn');
                if (nextQuestionBtn) {
                    nextQuestionBtn.addEventListener('click', () => {
                        currentQuestionIndex++;
                        currentQuestionElement.textContent = currentQuestionIndex + 1;
                        getNextQuestion();
                    });
                }
            }, 100);
            
            // Add this question to missed questions for later review
            missedQuestions.push(currentQuestion);
        }
        
        feedbackContainer.classList.add('fade-in');
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
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
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
}); 