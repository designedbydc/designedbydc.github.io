document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const difficultyContainer = document.getElementById('difficulty-container');
    const quizMainContainer = document.getElementById('quiz-main-container');
    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const currentQuestionSpan = document.getElementById('current-question');
    const currentDifficultySpan = document.getElementById('current-difficulty');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const quizContainer = document.getElementById('quiz-container');
    
    // Initialize Odometer
    const scoreOdometer = document.getElementById('score-odometer');
    let odometerInstance = new Odometer({
        el: scoreOdometer,
        value: 0,
        format: 'd',
        theme: 'minimal'
    });
    
    // Quiz State
    let currentLevel = 0; // 0-based index for the levels array
    let questionsCompletedInLevel = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let currentQuestion = null;
    
    // Define the levels
    const LEVELS = [
        {
            name: "Gully Investor",
            questionsRequired: 3,
            theme: {
                primary: "#10B981",
                secondary: "#D1FAE5",
                accent: "#059669"
            },
            badge: "💼",
            description: "Starting out with the basics of market trading"
        },
        {
            name: "Chai Break Trader",
            questionsRequired: 3,
            theme: {
                primary: "#3B82F6",
                secondary: "#DBEAFE",
                accent: "#1D4ED8"
            },
            badge: "☕",
            description: "Trading between coffee breaks"
        },
        {
            name: "Dabba Trading Master",
            questionsRequired: 3,
            theme: {
                primary: "#8B5CF6",
                secondary: "#EDE9FE",
                accent: "#6D28D9"
            },
            badge: "📊",
            description: "Navigating unofficial trading networks"
        },
        {
            name: "Bazaar Pundit",
            questionsRequired: 3,
            theme: {
                primary: "#EC4899",
                secondary: "#FCE7F3",
                accent: "#BE185D"
            },
            badge: "🎯",
            description: "Knowledgeable about market movements"
        },
        {
            name: "Dalal Street Veteran",
            questionsRequired: 3,
            theme: {
                primary: "#F59E0B",
                secondary: "#FEF3C7",
                accent: "#D97706"
            },
            badge: "🏛️",
            description: "Experienced in the Indian stock market"
        },
        {
            name: "Sher of Share Market",
            questionsRequired: 3,
            theme: {
                primary: "#EF4444",
                secondary: "#FEE2E2",
                accent: "#B91C1C"
            },
            badge: "🦁",
            description: "King of the stock market jungle"
        },
        {
            name: "Trading Titan",
            questionsRequired: 3,
            theme: {
                primary: "#14B8A6",
                secondary: "#CCFBF1",
                accent: "#0F766E"
            },
            badge: "🏆",
            description: "Dominant force in trading"
        },
        {
            name: "Crore-pati Portfolio Pro",
            questionsRequired: 3,
            theme: {
                primary: "#F97316",
                secondary: "#FFEDD5",
                accent: "#C2410C"
            },
            badge: "💰",
            description: "Managing multi-crore investments"
        },
        {
            name: "Raja of Risk Analysis",
            questionsRequired: 3,
            theme: {
                primary: "#06B6D4",
                secondary: "#CFFAFE",
                accent: "#0E7490"
            },
            badge: "📈",
            description: "Expert at calculating risks and rewards"
        },
        {
            name: "Hedge Fund Maharathi",
            questionsRequired: 3,
            theme: {
                primary: "#84CC16",
                secondary: "#ECFCCB",
                accent: "#4D7C0F"
            },
            badge: "🏰",
            description: "Master of complex investment strategies"
        }
    ];
    
    // Mock questions
    const mockQuestions = [
        {
            question: "What is the main function of the stock market?",
            options: [
                "To provide a platform for companies to raise capital",
                "To enable government to regulate businesses",
                "To allow only institutional investors to trade",
                "To restrict foreign investments"
            ],
            correctAnswer: "To provide a platform for companies to raise capital"
        },
        {
            question: "What does the term 'bull market' refer to?",
            options: [
                "A market dominated by sellers",
                "A market with rising stock prices",
                "A market controlled by regulatory agencies",
                "A market for agricultural commodities"
            ],
            correctAnswer: "A market with rising stock prices"
        },
        {
            question: "What is a stock dividend?",
            options: [
                "A cash payment to shareholders",
                "Additional shares given to shareholders",
                "A tax on stock profits",
                "The company's annual profit"
            ],
            correctAnswer: "Additional shares given to shareholders"
        },
        {
            question: "What is an IPO?",
            options: [
                "International Purchase Order",
                "Initial Public Offering",
                "Insider Price Option",
                "Investment Portfolio Optimization"
            ],
            correctAnswer: "Initial Public Offering"
        },
        {
            question: "Which of these is NOT a major stock exchange in India?",
            options: [
                "Bombay Stock Exchange (BSE)",
                "National Stock Exchange (NSE)",
                "Delhi Stock Exchange (DSE)",
                "Metropolitan Stock Exchange (MSE)"
            ],
            correctAnswer: "Delhi Stock Exchange (DSE)"
        },
        {
            question: "What is a market order?",
            options: [
                "An order to buy or sell a security at the best available current price",
                "An order to buy or sell when a security reaches a specific price",
                "An order that must be executed before the market opens",
                "An order placed by market regulators"
            ],
            correctAnswer: "An order to buy or sell a security at the best available current price"
        },
        {
            question: "What is the meaning of 'day trading'?",
            options: [
                "Trading only during specific hours of the day",
                "Buying and selling securities within the same trading day",
                "Trading that occurs automatically at midnight",
                "A trading strategy that requires waiting for a full day"
            ],
            correctAnswer: "Buying and selling securities within the same trading day"
        },
        {
            question: "What is the SENSEX?",
            options: [
                "A sensor that monitors electronic stock transfers",
                "A benchmark index of 30 stocks on the Bombay Stock Exchange",
                "A government regulatory committee",
                "The Securities and Exchange Board of India's transaction tax"
            ],
            correctAnswer: "A benchmark index of 30 stocks on the Bombay Stock Exchange"
        },
        {
            question: "What is a blue-chip stock?",
            options: [
                "A newly issued stock",
                "A stock that has lost significant value",
                "A stock of a well-established, financially sound company",
                "A stock that pays high dividends"
            ],
            correctAnswer: "A stock of a well-established, financially sound company"
        },
        {
            question: "What does P/E ratio stand for?",
            options: [
                "Profit/Equity ratio",
                "Price/Earnings ratio",
                "Percentage/Evaluation ratio",
                "Public/Enterprise ratio"
            ],
            correctAnswer: "Price/Earnings ratio"
        },
        {
            question: "What is a bear market?",
            options: [
                "A market for wildlife stocks",
                "A market where prices are falling",
                "A market that opens only in certain seasons",
                "A market that trades using cryptocurrency"
            ],
            correctAnswer: "A market where prices are falling"
        },
        {
            question: "What is a stock split?",
            options: [
                "Dividing a company into two separate entities",
                "Increasing the number of shares by dividing existing ones",
                "Selling a portion of company stocks to investors",
                "Sharing profits with stockholders"
            ],
            correctAnswer: "Increasing the number of shares by dividing existing ones"
        },
        {
            question: "What is a demat account?",
            options: [
                "A dematerialized account where shares are held electronically",
                "A demonstration account for practice trading",
                "An account with limited trading privileges",
                "A special account for foreign investors"
            ],
            correctAnswer: "A dematerialized account where shares are held electronically"
        },
        {
            question: "What is a limit order?",
            options: [
                "An order with a maximum quantity limit",
                "An order that expires at a specific time",
                "An order to buy or sell at a specified price or better",
                "An order that requires approval from market regulators"
            ],
            correctAnswer: "An order to buy or sell at a specified price or better"
        },
        {
            question: "What does SEBI stand for?",
            options: [
                "Stock Exchange Board of India",
                "Securities and Exchange Board of India",
                "Share Exchange Bureau of Investment",
                "State Equity Business Institute"
            ],
            correctAnswer: "Securities and Exchange Board of India"
        },
        {
            question: "What is market capitalization?",
            options: [
                "The total value of a company's assets minus liabilities",
                "The total market value of a company's outstanding shares",
                "The maximum capital a company can raise",
                "The total investment made by the company founders"
            ],
            correctAnswer: "The total market value of a company's outstanding shares"
        },
        {
            question: "What is a futures contract?",
            options: [
                "A contract for employment with a company in the future",
                "An agreement to buy or sell an asset at a predetermined price on a specific future date",
                "A technology contract for future software updates",
                "A contract that predicts future market conditions"
            ],
            correctAnswer: "An agreement to buy or sell an asset at a predetermined price on a specific future date"
        },
        {
            question: "What is diversification in investment?",
            options: [
                "Investing only in diverse industries",
                "Spreading investments across various assets to reduce risk",
                "Changing investment strategies frequently",
                "Investing in international markets only"
            ],
            correctAnswer: "Spreading investments across various assets to reduce risk"
        },
        {
            question: "What is a dividend yield?",
            options: [
                "The total amount of dividends paid by a company",
                "The annual dividend per share divided by the stock's price per share",
                "The growth rate of a dividend",
                "The tax paid on dividend income"
            ],
            correctAnswer: "The annual dividend per share divided by the stock's price per share"
        },
        {
            question: "What is insider trading?",
            options: [
                "Trading within the company premises",
                "Trading based on material, non-public information",
                "Trading between company employees",
                "Trading company shares during working hours"
            ],
            correctAnswer: "Trading based on material, non-public information"
        },
        {
            question: "What is a stock's beta?",
            options: [
                "A measure of a stock's volatility compared to the market",
                "The testing phase before a stock is publicly traded",
                "The initial price of a stock",
                "The maximum price a stock can reach"
            ],
            correctAnswer: "A measure of a stock's volatility compared to the market"
        },
        {
            question: "What does ROI stand for in investing?",
            options: [
                "Rate of Inflation",
                "Return on Investment",
                "Risk of Investment",
                "Record of Income"
            ],
            correctAnswer: "Return on Investment"
        },
        {
            question: "What is a stop-loss order?",
            options: [
                "An order to stop all trading activity",
                "An order to sell when a stock reaches a certain price to limit losses",
                "An order that prevents more than a specified loss in a day",
                "A regulation that stops trading when market losses are too high"
            ],
            correctAnswer: "An order to sell when a stock reaches a certain price to limit losses"
        },
        {
            question: "What is a mutual fund?",
            options: [
                "A fund that invests only in bonds",
                "A pool of money invested in various securities by a professional fund manager",
                "A government-run investment program",
                "A fund for mutual benefit societies"
            ],
            correctAnswer: "A pool of money invested in various securities by a professional fund manager"
        },
        {
            question: "What is an ETF?",
            options: [
                "Electronic Trading Facility",
                "Exchange-Traded Fund",
                "Equity Transfer Fee",
                "Extended Time Finance"
            ],
            correctAnswer: "Exchange-Traded Fund"
        },
        {
            question: "What is shorting a stock?",
            options: [
                "Buying a stock for a short period",
                "Selling shares you don't own in anticipation of a price drop",
                "Reducing the number of shares in a company",
                "Trading stocks in shortened market hours"
            ],
            correctAnswer: "Selling shares you don't own in anticipation of a price drop"
        },
        {
            question: "What is a margin call?",
            options: [
                "A call from a broker demanding additional funds when a margin account falls below required amount",
                "A phone call to place a margin order",
                "A call to increase the profit margin",
                "A notification about profit margins"
            ],
            correctAnswer: "A call from a broker demanding additional funds when a margin account falls below required amount"
        },
        {
            question: "What is meant by 'going long' in the stock market?",
            options: [
                "Holding stocks for a very long time",
                "Buying stocks with the expectation that their value will increase",
                "Investing in companies with long histories",
                "Making long-term predictions about market movements"
            ],
            correctAnswer: "Buying stocks with the expectation that their value will increase"
        },
        {
            question: "What is a stock's 'float'?",
            options: [
                "The number of shares available for trading by the public",
                "The maximum price a stock can reach",
                "How quickly a stock's price changes",
                "The amount a stock's price fluctuates daily"
            ],
            correctAnswer: "The number of shares available for trading by the public"
        },
        {
            question: "What is fundamental analysis in stock investing?",
            options: [
                "Analyzing the basic structure of the stock market",
                "Evaluating a company's financial health, management, and competitive advantages",
                "Studying the fundamentals of trading psychology",
                "Basic analysis suitable for beginner investors"
            ],
            correctAnswer: "Evaluating a company's financial health, management, and competitive advantages"
        }
    ];
    
    // Initialize quiz
    function initQuiz() {
        // Reset quiz state
        currentLevel = 0;
        questionsCompletedInLevel = 0;
        currentQuestionIndex = 0;
        score = 0;
        
        // Apply theme of the first level
        applyLevelTheme(LEVELS[currentLevel]);
        
        // Update level display
        updateLevelDisplay();
        
        // Hide difficulty container and show quiz container
        difficultyContainer.classList.add('hidden');
        quizMainContainer.classList.remove('hidden');
        
        // Start with first question
        getNextQuestion();
    }
    
    // Event listener for start quiz button
    startQuizBtn.addEventListener('click', initQuiz);
    
    // Update the level display
    function updateLevelDisplay() {
        currentDifficultySpan.textContent = LEVELS[currentLevel].name;
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
        // Update odometer instead of scoreSpan
        scoreOdometer.innerHTML = score;
    }
    
    // Apply theme based on current level
    function applyLevelTheme(level) {
        document.documentElement.style.setProperty('--primary-color', level.theme.primary);
        document.documentElement.style.setProperty('--secondary-color', level.theme.secondary);
        document.documentElement.style.setProperty('--accent-color', level.theme.accent);
    }

    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Get next question
    function getNextQuestion() {
        try {
            // Show loading spinner
            showLoading(true);
            
            // For simplicity, we'll use mock questions and shuffle them
            const shuffledQuestions = shuffleArray(mockQuestions);
            const mockQuestion = shuffledQuestions[currentQuestionIndex % shuffledQuestions.length];
            
            // Use setTimeout to simulate loading
            setTimeout(() => {
                showQuestion({
                    question: mockQuestion.question,
                    options: mockQuestion.options,
                    correctAnswer: mockQuestion.correctAnswer
                });
                showLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error getting next question:', error);
            showError('Failed to get the next question. Please try refreshing the page.');
            showLoading(false);
        }
    }
    
    // Show question
    function showQuestion(questionData) {
        try {
            // Store current question
            currentQuestion = questionData;
            
            // Set question text
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
            
            // Create and add option buttons
            shuffledOptions.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                
                // Add event listener to check answer
                button.addEventListener('click', () => {
                    // Disable all buttons to prevent multiple answers
                    const buttons = optionsContainer.querySelectorAll('button');
                    buttons.forEach(btn => {
                        btn.disabled = true;
                    });
                    
                    // Add visual feedback for the selected button
                    button.classList.add('selected');
                    
                    // Check if answer is correct
                    const isCorrect = option === questionData.correctAnswer;
                    
                    // Apply appropriate styling
                    if (isCorrect) {
                        button.classList.add('correct');
                    } else {
                        button.classList.add('incorrect');
                        
                        // Highlight the correct answer
                        buttons.forEach(btn => {
                            if (btn.textContent === questionData.correctAnswer) {
                                btn.classList.add('correct');
                            }
                        });
                    }
                    
                    // Process the answer
                    checkAnswer(isCorrect);
                });
                
                optionsContainer.appendChild(button);
            });
            
            // Hide feedback if it was visible
            feedbackContainer.classList.add('hidden');
            
        } catch (error) {
            console.error('Error displaying question:', error);
            showError('Failed to display the question. Please try refreshing the page.');
        }
    }
    
    // Check answer and handle progression
    function checkAnswer(isCorrect) {
        try {
            // Show feedback
            feedbackContainer.classList.remove('hidden');
            
            // Clear any existing buttons in the feedback container
            const feedbackDiv = feedbackContainer.querySelector('div');
            // Keep only the feedback text paragraph and remove any other elements
            const feedbackParagraph = feedbackDiv.querySelector('#feedback-text');
            feedbackDiv.innerHTML = '';
            feedbackDiv.appendChild(feedbackParagraph);
            
            if (isCorrect) {
                // Increment score
                score += 1;
                // Update odometer
                scoreOdometer.innerHTML = score;
                
                // Increment questions completed in level
                questionsCompletedInLevel += 1;
                
                // Show feedback
                feedbackText.textContent = 'Correct! Great job!';
                feedbackDiv.className = 'p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400';
                
                // Check if level is complete
                if (questionsCompletedInLevel >= LEVELS[currentLevel].questionsRequired) {
                    // Level complete
                    if (currentLevel < LEVELS.length - 1) {
                        // Move to next level
                        currentLevel += 1;
                        questionsCompletedInLevel = 0;
                        
                        // Apply new level theme
                        applyLevelTheme(LEVELS[currentLevel]);
                        
                        // Show level up feedback
                        feedbackText.textContent = `Level complete! You've advanced to ${LEVELS[currentLevel].name}!`;
                    } else {
                        // Game complete
                        showFinalScore();
                        return;
                    }
                }
                
                // Add button to continue to next question
                const nextButton = document.createElement('button');
                nextButton.textContent = 'Next Question';
                nextButton.className = 'mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800';
                nextButton.addEventListener('click', () => {
                    // Increment question index
                    currentQuestionIndex += 1;
                    
                    // Update level display
                    updateLevelDisplay();
                    
                    // Get next question
                    getNextQuestion();
                });
                
                feedbackDiv.appendChild(nextButton);
                
            } else {
                // Game over
                feedbackText.textContent = `Incorrect! The correct answer is: ${currentQuestion.correctAnswer}`;
                feedbackDiv.className = 'p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400';
                
                // Add button to restart quiz
                const restartButton = document.createElement('button');
                restartButton.textContent = 'Try Again';
                restartButton.className = 'mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800';
                restartButton.addEventListener('click', initQuiz);
                
                feedbackDiv.appendChild(restartButton);
            }
        } catch (error) {
            console.error('Error processing answer:', error);
            showError('Failed to process your answer. Please try refreshing the page.');
        }
    }
    
    // Show final score
    function showFinalScore() {
        // Hide question container
        questionContainer.classList.add('hidden');
        
        // Create final score container
        const finalScoreContainer = document.createElement('div');
        finalScoreContainer.className = 'final-score-container fade-in';
        
        // Create content
        finalScoreContainer.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Quiz Complete!</h2>
            <p class="mb-2">You've completed all 10 levels of the Stock Market Trade Quiz!</p>
            <div class="my-6">
                <span class="final-score">${score}/30</span>
                <p class="text-gray-600">Total Score</p>
            </div>
            <div class="mt-6 mb-2">
                <button id="restart-quiz" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Play Again
                </button>
            </div>
            <div class="share-buttons">
                <button class="share-btn bg-blue-400 hover:bg-blue-500 text-white" onclick="shareResult('twitter')">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                </button>
                <button class="share-btn bg-blue-700 hover:bg-blue-800 text-white" onclick="shareResult('linkedin')">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                    </svg>
                </button>
                <button class="share-btn bg-green-600 hover:bg-green-700 text-white" onclick="shareResult('whatsapp')">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // Replace feedback container with final score
        feedbackContainer.classList.add('hidden');
        questionContainer.parentNode.appendChild(finalScoreContainer);
        
        // Reset odometer to zero when showing final score
        scoreOdometer.innerHTML = 0;
        
        // Add event listener to restart button
        document.getElementById('restart-quiz').addEventListener('click', () => {
            // Remove final score container
            finalScoreContainer.remove();
            
            // Show question container
            questionContainer.classList.remove('hidden');
            
            // Restart quiz
            initQuiz();
        });
    }
    
    // Share result function
    function shareResult(platform) {
        const shareText = `I scored ${score}/30 in the Stock Market Trade Quiz! Can you beat my score?`;
        const shareUrl = window.location.href;
        
        let shareLink = '';
        
        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
                break;
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                break;
            default:
                console.error('Unknown share platform:', platform);
                return;
        }
        
        window.open(shareLink, '_blank');
    }
    
    // Make share function available globally
    window.shareResult = shareResult;
    
    // Show/hide loading container
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
    
    // Auto-start quiz instead of showing the difficulty selection screen
    initQuiz();
}); 