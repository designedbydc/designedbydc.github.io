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
        // EASY questions (0-9) - Basic Trade Setups
        {
            question: "In a bullish engulfing pattern, what is the ideal entry point?",
            options: [
                "At the open of the engulfing candle",
                "At the close of the engulfing candle",
                "Above the high of the engulfing candle with confirmation",
                "At the low of the previous candle"
            ],
            correctAnswer: "Above the high of the engulfing candle with confirmation"
        },
        {
            question: "When trading a breakout of a key resistance level, where should you place your stop loss?",
            options: [
                "At the breakout point",
                "Below the resistance level that was broken",
                "At a round number below entry",
                "At a fixed percentage from entry"
            ],
            correctAnswer: "Below the resistance level that was broken"
        },
        {
            question: "What is the ideal setup for a pullback trade in an uptrend?",
            options: [
                "Price pulling back to a previous resistance level that now acts as support",
                "Price making a new high",
                "Price breaking below the 200-day moving average",
                "Price forming a head and shoulders pattern"
            ],
            correctAnswer: "Price pulling back to a previous resistance level that now acts as support"
        },
        {
            question: "In a double bottom pattern, where is the optimal entry point?",
            options: [
                "At the second bottom",
                "After price breaks above the neckline (high between the two bottoms)",
                "At the midpoint between the two bottoms",
                "After the pattern completes a 50% retracement"
            ],
            correctAnswer: "After price breaks above the neckline (high between the two bottoms)"
        },
        {
            question: "When using the moving average crossover strategy, what signals a potential buy entry?",
            options: [
                "When price crosses above the moving average",
                "When the shorter-term MA crosses above the longer-term MA",
                "When both MAs are sloping downward",
                "When price touches the moving average"
            ],
            correctAnswer: "When the shorter-term MA crosses above the longer-term MA"
        },
        {
            question: "What is a valid entry signal for the 'trading the bounce off support' setup?",
            options: [
                "Entering as soon as price touches the support level",
                "Waiting for a candlestick confirmation pattern at the support level",
                "Entering after price breaks below support",
                "Entering at a fixed percentage above support"
            ],
            correctAnswer: "Waiting for a candlestick confirmation pattern at the support level"
        },
        {
            question: "In a range-bound market, what is the safest entry strategy?",
            options: [
                "Buy at the middle of the range",
                "Buy at support with confirmation and sell at resistance",
                "Always buy breakouts of the range",
                "Buy when RSI is at 50"
            ],
            correctAnswer: "Buy at support with confirmation and sell at resistance"
        },
        {
            question: "What is the proper entry technique for a bullish flag pattern?",
            options: [
                "At the start of the flag formation",
                "At the breakout above the upper trendline of the flag",
                "At the lowest point within the flag",
                "After the pattern fails"
            ],
            correctAnswer: "At the breakout above the upper trendline of the flag"
        },
        {
            question: "When using the RSI indicator for trade entries, what is considered an oversold condition that might signal a buy?",
            options: [
                "RSI above 70",
                "RSI below 30",
                "RSI at 50",
                "RSI crossing the 20-day moving average"
            ],
            correctAnswer: "RSI below 30"
        },
        {
            question: "What is a key characteristic of a valid 'higher low' entry in an uptrend?",
            options: [
                "The low must be exactly 10% higher than the previous low",
                "The low must be higher than the previous low while maintaining the overall uptrend structure",
                "The low must touch a moving average",
                "The low must form a specific candlestick pattern"
            ],
            correctAnswer: "The low must be higher than the previous low while maintaining the overall uptrend structure"
        },
        
        // MEDIUM questions (10-19) - Intermediate Trade Setups
        {
            question: "In the 'inside bar' setup, what is the aggressive entry strategy?",
            options: [
                "Buy at the open of the next bar after the inside bar",
                "Buy on a break above the inside bar's high (for bullish setup)",
                "Buy at the midpoint of the inside bar",
                "Buy at the close of the inside bar"
            ],
            correctAnswer: "Buy on a break above the inside bar's high (for bullish setup)"
        },
        {
            question: "What is the proper way to trade a 'three drives to a bottom' pattern?",
            options: [
                "Enter short at the third drive down",
                "Enter long after the third drive down shows reversal confirmation",
                "Enter long at the second drive down",
                "Enter short after the pattern completes"
            ],
            correctAnswer: "Enter long after the third drive down shows reversal confirmation"
        },
        {
            question: "When trading a head and shoulders pattern, where is the optimal entry for a short position?",
            options: [
                "At the formation of the right shoulder",
                "At the head",
                "After price breaks below the neckline with confirmation",
                "At the highest point of the pattern"
            ],
            correctAnswer: "After price breaks below the neckline with confirmation"
        },
        {
            question: "In a VWAP (Volume Weighted Average Price) reversion strategy, what is the entry signal?",
            options: [
                "When price crosses above VWAP",
                "When price deviates significantly from VWAP and shows signs of reverting back",
                "When VWAP flattens",
                "When volume spikes above average"
            ],
            correctAnswer: "When price deviates significantly from VWAP and shows signs of reverting back"
        },
        {
            question: "What is the proper entry technique for an 'evening star' candlestick pattern?",
            options: [
                "Buy at the close of the third candle",
                "Short after the third candle closes below the midpoint of the first candle",
                "Buy at the open of the pattern",
                "Short at the high of the second candle"
            ],
            correctAnswer: "Short after the third candle closes below the midpoint of the first candle"
        },
        {
            question: "In the 'failure test' setup (spring/upthrust), what is the entry signal?",
            options: [
                "When price breaks a support/resistance level and immediately reverses",
                "When price tests a level multiple times",
                "When price consolidates at a level",
                "When volume decreases at a level"
            ],
            correctAnswer: "When price breaks a support/resistance level and immediately reverses"
        },
        {
            question: "What is the correct entry for a 'cup and handle' pattern?",
            options: [
                "At the bottom of the cup",
                "At the start of the handle formation",
                "On the breakout above the handle's resistance",
                "At the midpoint of the cup"
            ],
            correctAnswer: "On the breakout above the handle's resistance"
        },
        {
            question: "When using the Fibonacci retracement tool in a trending market, which retracement level is often considered the 'golden pocket' for entries?",
            options: [
                "23.6% retracement",
                "38.2% retracement",
                "The 61.8%-78.6% zone",
                "100% retracement"
            ],
            correctAnswer: "The 61.8%-78.6% zone"
        },
        {
            question: "In a 'three black crows' bearish pattern, what is the appropriate trade setup?",
            options: [
                "Go long after the third black crow",
                "Go short after the third black crow forms, with confirmation",
                "Go short after the first black crow",
                "Wait for a reversal pattern to form"
            ],
            correctAnswer: "Go short after the third black crow forms, with confirmation"
        },
        {
            question: "What is the proper entry technique for trading a 'rounded bottom' (saucer) pattern?",
            options: [
                "At the lowest point of the pattern",
                "When the pattern is halfway complete",
                "After price breaks above the resistance level with confirmation",
                "At the first sign of upward movement"
            ],
            correctAnswer: "After price breaks above the resistance level with confirmation"
        },
        
        // HARD questions (20-29) - Advanced Trade Setups
        {
            question: "In an 'order block' trading strategy, what defines a valid buy-side order block?",
            options: [
                "Any area where price consolidated",
                "The last down candle before a significant upward move, often with high volume",
                "A series of doji candles",
                "A gap in price action"
            ],
            correctAnswer: "The last down candle before a significant upward move, often with high volume"
        },
        {
            question: "When trading the 'stop hunt' pattern, what is the optimal entry strategy?",
            options: [
                "Enter as soon as price hits a major support/resistance level",
                "Enter after price breaches a key level, triggers stops, and then reverses back",
                "Enter before the stop hunt occurs",
                "Enter based on indicator signals only"
            ],
            correctAnswer: "Enter after price breaches a key level, triggers stops, and then reverses back"
        },
        {
            question: "In the 'fair value gap' trading approach, what constitutes a valid entry setup?",
            options: [
                "Entering at any imbalance in the market",
                "Entering when price returns to fill an unfilled gap created by a strong imbalance, with confirmation",
                "Entering at the midpoint of the gap",
                "Entering after the gap is completely filled"
            ],
            correctAnswer: "Entering when price returns to fill an unfilled gap created by a strong imbalance, with confirmation"
        },
        {
            question: "What is the correct way to trade a 'liquidity grab' setup?",
            options: [
                "Enter in the direction of the grab as soon as it occurs",
                "Enter counter to the grab after confirmation of reversal",
                "Avoid trading during liquidity grabs",
                "Enter based on volume profile only"
            ],
            correctAnswer: "Enter counter to the grab after confirmation of reversal"
        },
        {
            question: "In the 'smart money concept' (SMC), what is the proper way to identify and trade a 'breaker block'?",
            options: [
                "Any support or resistance level",
                "A former support turned resistance or former resistance turned support after a break and retest",
                "Areas of high volume only",
                "Zones where multiple indicators converge"
            ],
            correctAnswer: "A former support turned resistance or former resistance turned support after a break and retest"
        },
        {
            question: "When trading the 'institutional candle' setup, what is the key entry strategy?",
            options: [
                "Enter at the open of any large candle",
                "Enter on a retracement to the 50% level of a large momentum candle",
                "Enter at the close of the institutional candle",
                "Enter based on the next candle's behavior only"
            ],
            correctAnswer: "Enter on a retracement to the 50% level of a large momentum candle"
        },
        {
            question: "In a 'market structure shift' trade setup, what signals a valid entry opportunity?",
            options: [
                "Any change in price direction",
                "When price breaks a significant higher low in an uptrend (or lower high in a downtrend) and shows confirmation",
                "When multiple indicators change direction",
                "When volume increases suddenly"
            ],
            correctAnswer: "When price breaks a significant higher low in an uptrend (or lower high in a downtrend) and shows confirmation"
        },
        {
            question: "What is the correct approach for trading the 'trapped traders' setup?",
            options: [
                "Enter in the same direction as the trapped traders",
                "Enter in the opposite direction of trapped traders after confirmation",
                "Avoid markets with trapped traders",
                "Enter based on news events only"
            ],
            correctAnswer: "Enter in the opposite direction of trapped traders after confirmation"
        },
        {
            question: "In the 'ICT (Inner Circle Trader) optimal trade entry' method, what is the key principle?",
            options: [
                "Entering at round numbers only",
                "Entering at the exact 50% retracement of a move",
                "Entering at untested liquidity levels where stop orders are likely to be clustered",
                "Entering based on indicator crossovers only"
            ],
            correctAnswer: "Entering at untested liquidity levels where stop orders are likely to be clustered"
        },
        {
            question: "When using the 'volume profile' for trade entries, what is considered the most significant zone for potential reversals?",
            options: [
                "Areas of highest volume (Point of Control)",
                "Areas of lowest volume (Low Volume Nodes)",
                "The Value Area High",
                "The Value Area Low"
            ],
            correctAnswer: "Areas of lowest volume (Low Volume Nodes)"
        }
    ];
    
    // Configuration
    const CONFIG = {
        // Set to true in production environment
        isProduction: window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'),
        openAI: {
            apiKey: '', // Your OpenAI API key - set this securely in production
            model: 'gpt-4o', // Using the latest GPT-4 model for better quality questions
            maxTokens: 500,
            temperature: 0.7
        },
        questionsPerDifficulty: 10,
        totalQuestions: 30
    };

    // Function to fetch questions from OpenAI API
    async function fetchQuestionsFromOpenAI(difficulty) {
        try {
            // Don't make actual API calls if API key is not set
            if (!CONFIG.openAI.apiKey && CONFIG.isProduction) {
                console.warn('OpenAI API key not set. Falling back to mock questions.');
                return null;
            }
            
            // In development without API key, return mock data
            if (!CONFIG.openAI.apiKey && !CONFIG.isProduction) {
                return null;
            }

            // Create prompt based on difficulty
            let prompt = `Generate ${CONFIG.questionsPerDifficulty} multiple-choice questions about trading setups`;
            
            switch(difficulty) {
                case 'easy':
                    prompt += ` focusing on basic trade setups like support/resistance, trend following, and simple candlestick patterns. Make these suitable for beginners.`;
                    break;
                case 'medium':
                    prompt += ` focusing on intermediate concepts like chart patterns, indicator-based entries, and multi-candlestick formations. These should be moderately challenging.`;
                    break;
                case 'hard':
                    prompt += ` focusing on advanced concepts like order blocks, liquidity grabs, smart money concepts, and institutional trading patterns. These should be challenging for experienced traders.`;
                    break;
            }
            
            prompt += ` Format each question as a JSON object with 'question', 'options' (array of 4 choices), and 'correctAnswer' (matching one of the options exactly). Return an array of these objects.`;

            // Make API request to OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.openAI.apiKey}`
                },
                body: JSON.stringify({
                    model: CONFIG.openAI.model,
                    messages: [
                        {
                            role: "system",
                            content: "You are a trading expert who creates educational quiz questions about trading setups and strategies."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: CONFIG.openAI.maxTokens,
                    temperature: CONFIG.openAI.temperature
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
            }

            const data = await response.json();
            
            // Parse the response to extract questions
            const content = data.choices[0].message.content;
            let questions;
            
            try {
                // Try to parse if the response is already JSON
                questions = JSON.parse(content);
            } catch (e) {
                // If not JSON, try to extract JSON from the text
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    questions = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse questions from OpenAI response');
                }
            }
            
            // Validate questions format
            if (!Array.isArray(questions)) {
                throw new Error('OpenAI did not return an array of questions');
            }
            
            return questions;
        } catch (error) {
            console.error('Error fetching questions from OpenAI:', error);
            return null;
        }
    }

    // Cache for API questions
    const questionCache = {
        easy: [],
        medium: [],
        hard: []
    };
    
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
            
            if (CONFIG.isProduction) {
                // In production: Use API questions
                getQuestionFromAPIOrCache(difficultyLevel);
            } else {
                // In development/testing: Use mock questions
                getQuestionFromMockData(difficultyLevel);
            }
        } catch (error) {
            console.error('Error getting next question:', error);
            showError('Failed to get the next question. Please try refreshing the page.');
            showLoading(false);
        }
    }
    
    // Get question from API or cache
    function getQuestionFromAPIOrCache(difficultyLevel) {
        // If we have cached questions for this difficulty, use them
        if (questionCache[difficultyLevel].length > 0) {
            const questionIndex = currentQuestionIndex % 10;
            if (questionIndex < questionCache[difficultyLevel].length) {
                const selectedQuestion = questionCache[difficultyLevel][questionIndex];
                displayQuestion(selectedQuestion);
                return;
            }
        }
        
        // Otherwise fetch from OpenAI
        fetchQuestionsFromOpenAI(difficultyLevel)
            .then(questions => {
                if (questions && questions.length > 0) {
                    // Cache the questions
                    questionCache[difficultyLevel] = questions;
                    const questionIndex = currentQuestionIndex % 10;
                    const selectedQuestion = questions[questionIndex % questions.length];
                    displayQuestion(selectedQuestion);
                } else {
                    // Fallback to mock questions if API fails
                    getQuestionFromMockData(difficultyLevel);
                }
            })
            .catch(error => {
                console.error('Error in OpenAI question fetch:', error);
                // Fallback to mock questions
                getQuestionFromMockData(difficultyLevel);
            });
    }

    // Get question from mock data
    function getQuestionFromMockData(difficultyLevel) {
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
        displayQuestion(selectedQuestion);
    }

    // Display the question to the user
    function displayQuestion(questionData) {
        setTimeout(() => {
            showQuestion({
                question: questionData.question,
                options: questionData.options,
                correctAnswer: questionData.correctAnswer
            });
            showLoading(false);
        }, 500);
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
            <p class="mb-2">You've completed the Trading Setups Quiz!</p>
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
        
        // Trigger confetti for scores above 20
        if (score > 20) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    // Share result on social media
    function shareResult(platform) {
        const shareUrl = window.location.href;
        const shareText = `I scored ${score} of 30 on the Trading Setups Quiz! Test your trading knowledge too!`;
        
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