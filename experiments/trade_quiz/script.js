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
    
    // Track if we have active YouTube players
    let activeYouTubePlayer = null;
    let activeThinkingMusicPlayer = null;

    // Quiz state
    let currentDifficulty = 'beginner';
    let currentQuestionIndex = 0;
    let score = 0;
    let missedQuestions = [];
    let userPerformance = [];
    let currentQuestion = null;
    let consecutiveCorrectAnswers = 0;
    
    // Track all previously asked questions to prevent repetition
    let askedQuestions = [];
    
    // Track retry attempts to prevent infinite loops
    let retryAttempts = 0;
    const MAX_RETRY_ATTEMPTS = 3;

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
        // Clean up any existing YouTube player
        cleanupYouTubePlayer();
        cleanupThinkingMusicPlayer();
        
        currentQuestionIndex = 0;
        score = 0;
        missedQuestions = [];
        userPerformance = [];
        consecutiveCorrectAnswers = 0;
        currentDifficulty = 'beginner';
        
        // Reset the list of asked questions when starting a new quiz
        askedQuestions = [];
        
        // Reset retry attempts
        retryAttempts = 0;
        
        scoreElement.textContent = score;
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        currentDifficultyElement.textContent = 'Beginner';
        
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
        return askedQuestions.some(askedQuestion => 
            askedQuestion.question.trim().toLowerCase() === question.question.trim().toLowerCase()
        );
    }

    // Get next question from OpenAI
    async function getNextQuestion() {
        showLoading(true);
        
        try {
            // Reset retry attempts for each new question request
            retryAttempts = 0;
            
            // Determine difficulty based on user performance
            updateDifficultyBasedOnPerformance();
            
            // If we have missed questions, prioritize them
            if (missedQuestions.length > 0 && Math.random() < 0.3) {
                // 30% chance to get a missed question
                const randomIndex = Math.floor(Math.random() * missedQuestions.length);
                currentQuestion = missedQuestions[randomIndex];
                
                // Remove the question from missed questions
                missedQuestions.splice(randomIndex, 1);
                
                // Check if this missed question has already been asked again
                if (isQuestionAskedBefore(currentQuestion)) {
                    console.log('Skipping repeated missed question');
                    
                    // Increment retry attempts
                    retryAttempts++;
                    if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
                        // If we've tried too many times, just use the question anyway
                        console.log('Max retry attempts reached, using repeated question');
                        showQuestion(currentQuestion);
                        return;
                    }
                    
                    getNextQuestion(); // Try again with a different question
                    return;
                }
                
                // Add to asked questions list
                askedQuestions.push(currentQuestion);
                
                showQuestion(currentQuestion);
                return;
            }
            
            // Prepare the prompt for OpenAI
            const prompt = `Generate a multiple-choice question about stock market trading at ${currentDifficulty} level. 
            Return the response in JSON format with the following structure:
            {
                "question": "The question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0, // Index of the correct answer (0-3)
                "explanation": "Detailed explanation of why this answer is correct and others are wrong"
            }
            
            Make sure the question is challenging but fair for a ${currentDifficulty} level trader.
            
            ${askedQuestions.length > 0 ? 'IMPORTANT: Do not generate any of these questions that have already been asked: ' + 
            askedQuestions.slice(-10).map(q => '"' + q.question + '"').join(', ') : ''}`;
            
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
                
                // Add to asked questions list
                askedQuestions.push(currentQuestion);
                
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

    // Update difficulty based on performance
    function updateDifficultyBasedOnPerformance() {
        // Only update difficulty after the first question
        if (currentQuestionIndex > 0) {
            // Check if we should increase difficulty
            if (consecutiveCorrectAnswers >= 3 && currentDifficulty !== 'advanced') {
                if (currentDifficulty === 'beginner') {
                    currentDifficulty = 'intermediate';
                } else if (currentDifficulty === 'intermediate') {
                    currentDifficulty = 'advanced';
                }
                // Update UI
                currentDifficultyElement.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
                // Reset counter
                consecutiveCorrectAnswers = 0;
            }
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
            optionButtons[selectedIndex].style.borderColor = 'var(--color-pink)';
            optionButtons[selectedIndex].style.borderWidth = '2px';
            
            feedbackContainer.classList.remove('hidden', 'feedback-incorrect');
            feedbackContainer.classList.add('feedback-correct');
            feedbackText.textContent = "Correct! Well done.";
            
            // Move to the next question after a delay for correct answers
            setTimeout(() => {
                currentQuestionIndex++;
                currentQuestionElement.textContent = currentQuestionIndex + 1;
                getNextQuestion();
            }, 4000);
        } else {
            optionButtons[selectedIndex].style.borderColor = 'var(--color-dark-purple)';
            optionButtons[selectedIndex].style.borderWidth = '2px';
            optionButtons[currentQuestion.correctAnswer].style.borderColor = 'var(--color-pink)';
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
}); 