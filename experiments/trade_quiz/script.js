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
    
    // Mock questions array organized by difficulty (easy -> medium -> hard)
    const mockQuestions = [
        // EASY questions (0-9)
        {
            question: "What is a stock?",
            options: [
                "A type of bond issued by companies",
                "A share of ownership in a company",
                "A loan given to a corporation",
                "A government-issued security"
            ],
            correctAnswer: "A share of ownership in a company"
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
            question: "What is a dividend?",
            options: [
                "A fee paid to stockbrokers",
                "A portion of a company's profit paid to shareholders",
                "A type of stock split",
                "A tax on stock profits"
            ],
            correctAnswer: "A portion of a company's profit paid to shareholders"
        },
        {
            question: "What is a limit order?",
            options: [
                "An order to buy or sell a security at a specific price or better",
                "A restriction on how many shares you can buy",
                "An order that must be executed by the end of the trading day",
                "A cap on how much you can invest"
            ],
            correctAnswer: "An order to buy or sell a security at a specific price or better"
        },
        {
            question: "What is a bull market?",
            options: [
                "A market where prices are falling",
                "A market where prices are rising",
                "A market exclusively for agricultural products",
                "A market regulated by specific broker firms"
            ],
            correctAnswer: "A market where prices are rising"
        },
        {
            question: "What is the NIFTY?",
            options: [
                "A mobile trading application",
                "The National Stock Exchange's benchmark index in India",
                "A type of dividend payment",
                "A strategy for buying stocks"
            ],
            correctAnswer: "The National Stock Exchange's benchmark index in India"
        },
        
        // MEDIUM questions (10-19)
        {
            question: "What is a stop-loss order?",
            options: [
                "An order to buy a stock when it reaches a certain price",
                "An order to sell a stock when it falls to a certain price",
                "A limit on how much you can lose in a trading day",
                "An order that automatically cancels at the end of the day"
            ],
            correctAnswer: "An order to sell a stock when it falls to a certain price"
        },
        {
            question: "What is market capitalization?",
            options: [
                "The maximum price a stock can reach in a day",
                "The total value of a company's outstanding shares",
                "The minimum investment required to enter a market",
                "The capital required to start a brokerage firm"
            ],
            correctAnswer: "The total value of a company's outstanding shares"
        },
        {
            question: "What is an IPO?",
            options: [
                "International Payment Option",
                "Internal Profit Organization",
                "Initial Public Offering",
                "Indexed Portfolio Optimization"
            ],
            correctAnswer: "Initial Public Offering"
        },
        {
            question: "What is diversification in investing?",
            options: [
                "Investing in multiple currencies",
                "Spreading investments across different asset classes to reduce risk",
                "Changing investment strategies frequently",
                "Investing only in diverse companies"
            ],
            correctAnswer: "Spreading investments across different asset classes to reduce risk"
        },
        {
            question: "What is a bear market?",
            options: [
                "A market where prices are rising steadily",
                "A market where prices are falling steadily",
                "A market dominated by aggressive investors",
                "A market with minimal government regulation"
            ],
            correctAnswer: "A market where prices are falling steadily"
        },
        {
            question: "What is a stock split?",
            options: [
                "Dividing a company's profits among shareholders",
                "When a company divides its existing shares into multiple shares",
                "Separating a company into two different companies",
                "Distributing shares to new investors"
            ],
            correctAnswer: "When a company divides its existing shares into multiple shares"
        },
        {
            question: "What does 'volume' refer to in stock trading?",
            options: [
                "The size of the company",
                "The number of shares traded in a given period",
                "The loudness of trading floor activity",
                "The market capitalization divided by share price"
            ],
            correctAnswer: "The number of shares traded in a given period"
        },
        {
            question: "What is a mutual fund?",
            options: [
                "A fund shared between two investors",
                "A pool of money from many investors that is invested in securities",
                "A government-managed retirement fund",
                "A joint bank account for multiple traders"
            ],
            correctAnswer: "A pool of money from many investors that is invested in securities"
        },
        {
            question: "What is an ETF?",
            options: [
                "Electronic Trading Format",
                "Exchange-Traded Fund",
                "Equity Trust Foundation",
                "Extended Time Finance"
            ],
            correctAnswer: "Exchange-Traded Fund"
        },
        {
            question: "What is a bond?",
            options: [
                "An ownership share in a company",
                "A debt security, similar to an IOU",
                "A type of insurance for investors",
                "A contract between two traders"
            ],
            correctAnswer: "A debt security, similar to an IOU"
        },
        
        // HARD questions (20-29)
        {
            question: "What is arbitrage?",
            options: [
                "A type of trading software",
                "The practice of taking advantage of price differences in different markets",
                "A method of currency conversion",
                "A high-risk investment strategy"
            ],
            correctAnswer: "The practice of taking advantage of price differences in different markets"
        },
        {
            question: "What is the difference between futures and options?",
            options: [
                "Futures are binding contracts, while options give the right but not obligation to buy/sell",
                "Futures are for commodities, options are for stocks only",
                "Futures expire in one year, options expire in one month",
                "Futures are regulated by the government, options are not"
            ],
            correctAnswer: "Futures are binding contracts, while options give the right but not obligation to buy/sell"
        },
        {
            question: "What is an 'order book' in trading?",
            options: [
                "A record of all orders placed by a single trader",
                "A list of all buy and sell orders for a specific security, organized by price level",
                "The official record of completed transactions",
                "A manual used by new traders to learn order types"
            ],
            correctAnswer: "A list of all buy and sell orders for a specific security, organized by price level"
        },
        {
            question: "What is meant by 'shorting' a stock?",
            options: [
                "Buying shares for a short period of time",
                "Setting a short limit on the maximum price to pay",
                "Borrowing shares to sell now and buy back later at a lower price",
                "Reducing your position in a particular stock"
            ],
            correctAnswer: "Borrowing shares to sell now and buy back later at a lower price"
        },
        {
            question: "What is the VIX?",
            options: [
                "A visualized index of trading patterns",
                "A volatility index that measures market fear",
                "A broker verification system",
                "A variable interest exchange system"
            ],
            correctAnswer: "A volatility index that measures market fear"
        },
        {
            question: "What is 'alpha' in investment terms?",
            options: [
                "The first stock in an index",
                "The return on an investment relative to a benchmark index",
                "The primary investor in a mutual fund",
                "The maximum potential gain of an investment"
            ],
            correctAnswer: "The return on an investment relative to a benchmark index"
        },
        {
            question: "What is a 'derivative'?",
            options: [
                "A direct investment in a company",
                "A financial security with a value dependent on an underlying asset",
                "A foreign exchange investment",
                "A dividend reinvestment program"
            ],
            correctAnswer: "A financial security with a value dependent on an underlying asset"
        },
        {
            question: "What is 'quantitative easing'?",
            options: [
                "Reducing trade volumes to stabilize markets",
                "A central bank strategy involving increased money supply to boost the economy",
                "Strict regulation of high-frequency trading",
                "Statistical analysis of market trends"
            ],
            correctAnswer: "A central bank strategy involving increased money supply to boost the economy"
        },
        {
            question: "What is the 'efficient market hypothesis'?",
            options: [
                "The theory that markets will always become more efficient over time",
                "The idea that market prices reflect all available information",
                "The concept that trading algorithms are more efficient than human traders",
                "A strategy for maximizing trading efficiency"
            ],
            correctAnswer: "The idea that market prices reflect all available information"
        },
        {
            question: "What is a 'straddle' in options trading?",
            options: [
                "Buying both call and put options with the same strike price and expiration date",
                "Trading two different stocks in the same sector",
                "Alternating between long and short positions",
                "A trading position that spans multiple markets"
            ],
            correctAnswer: "Buying both call and put options with the same strike price and expiration date"
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
        
        // Hide difficulty container and show quiz container
        difficultyContainer.classList.add('hidden');
        quizMainContainer.classList.remove('hidden');
        
        // Start with first question
        getNextQuestion();
    }
    
    // Event listener for start quiz button
    startQuizBtn.addEventListener('click', initQuiz);
    
    // Update the level display - function kept for compatibility but no longer updates UI
    function updateLevelDisplay() {
        // Question counter removed from UI
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
    
    // Get next question with progressive difficulty
    function getNextQuestion() {
        try {
            // Show loading spinner
            showLoading(true);
            
            // Calculate question difficulty based on current index
            // First 10 questions are easy, next 10 are medium, last 10 are hard
            let difficultyLevel;
            if (currentQuestionIndex < 10) {
                difficultyLevel = 'easy';
            } else if (currentQuestionIndex < 20) {
                difficultyLevel = 'medium';
            } else {
                difficultyLevel = 'hard';
            }
            
            // Categorize the mock questions by difficulty
            const easyQuestions = mockQuestions.slice(0, 10);
            const mediumQuestions = mockQuestions.slice(10, 20);
            const hardQuestions = mockQuestions.slice(20, 30);
            
            // Select the appropriate question pool based on difficulty
            let questionPool;
            switch (difficultyLevel) {
                case 'easy':
                    questionPool = easyQuestions;
                    break;
                case 'medium':
                    questionPool = mediumQuestions;
                    break;
                case 'hard':
                    questionPool = hardQuestions;
                    break;
                default:
                    questionPool = easyQuestions;
            }
            
            // Select a question from the appropriate pool
            // Use modulo to cycle through the available questions in each difficulty level
            const selectedQuestion = questionPool[currentQuestionIndex % 10];
            
            // Use setTimeout to simulate loading
            setTimeout(() => {
                showQuestion({
                    question: selectedQuestion.question,
                    options: selectedQuestion.options,
                    correctAnswer: selectedQuestion.correctAnswer
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
            if (isCorrect) {
                // Increment score
                score += 1;
                // Update odometer
                scoreOdometer.innerHTML = score;
                
                // Increment questions completed in level
                questionsCompletedInLevel += 1;
                
                // Check if level is complete
                if (questionsCompletedInLevel >= LEVELS[currentLevel].questionsRequired) {
                    // Level complete
                    if (currentLevel < LEVELS.length - 1) {
                        // Move to next level
                        currentLevel += 1;
                        questionsCompletedInLevel = 0;
                        
                        // Apply new level theme
                        applyLevelTheme(LEVELS[currentLevel]);
                        
                        // We no longer show level name messages
                        feedbackContainer.classList.add('hidden');
                    } else {
                        // Game complete
                        showFinalScore();
                        return;
                    }
                } else {
                    // Don't show the feedback container for correct answers
                    feedbackContainer.classList.add('hidden');
                }
                
                // Automatically proceed to next question after a short delay
                setTimeout(() => {
                    // Increment question index
                    currentQuestionIndex += 1;
                    
                    // Update level display - without showing level names
                    updateLevelDisplay();
                    
                    // Get next question
                    getNextQuestion();
                }, 800); // Reduced to 0.8 second delay since we're not showing feedback
                
            } else {
                // Game over - show feedback for incorrect answers
                feedbackContainer.classList.remove('hidden');
                
                // Clear any existing buttons in the feedback container
                const feedbackDiv = feedbackContainer.querySelector('div');
                // Keep only the feedback text paragraph and remove any other elements
                const feedbackParagraph = feedbackDiv.querySelector('#feedback-text');
                feedbackDiv.innerHTML = '';
                feedbackDiv.appendChild(feedbackParagraph);
                
                // Show feedback for incorrect answer
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
    
    // Show final score without level names
    function showFinalScore() {
        // Hide question container
        questionContainer.classList.add('hidden');
        
        // Create final score container
        const finalScoreContainer = document.createElement('div');
        finalScoreContainer.className = 'final-score-container fade-in';
        
        // Create content without mentioning levels
        finalScoreContainer.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Quiz Complete!</h2>
            <p class="mb-2">You've completed the Stock Market Trade Quiz!</p>
            <div class="my-6">
                <div class="final-score">${score} of 30</div>
                <p class="text-gray-600">Score</p>
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
        const shareText = `I scored ${score} of 30 in the Stock Market Trade Quiz! Can you beat my score?`;
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