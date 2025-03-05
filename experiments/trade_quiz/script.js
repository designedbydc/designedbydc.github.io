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
    const scoreOdometer = document.getElementById('score-odometer');
    const scoreContainer = document.getElementById('score-container');
    const finalScoreContainer = document.getElementById('final-score-container');
    const finalScoreMessage = document.getElementById('final-score-message');
    const finalScoreValue = document.getElementById('final-score-value');
    const restartButton = document.getElementById('restart-button');
    const shareContainer = document.getElementById('share-container');
    
    // Initialize Odometer
    let odometerInstance = new Odometer({
        el: scoreOdometer,
        value: 0,
        format: 'd',
        theme: 'minimal'
    });
    
    // Initialize variables
    let currentQuestionIndex = 0;
    let score = 0;
    let currentLevel = 0;
    let questionCache = {}; // Cache for questions from API
    let questionsCompletedInLevel = 0;
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
    
    // Mock questions by difficulty
    const MOCK_QUESTIONS_EASY = mockQuestions.slice(0, 10);
    const MOCK_QUESTIONS_MEDIUM = mockQuestions.slice(10, 20);
    const MOCK_QUESTIONS_HARD = mockQuestions.slice(20);
    
    // Configuration
    const CONFIG = {
        // Set to true in production environment
        isProduction: window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'),
        openAI: {
            model: 'gpt-4o', // Using the latest GPT-4 model for better quality questions
            maxTokens: 500,
            temperature: 0.7
        },
        questionsPerDifficulty: 10,
        totalQuestions: 30
    };

    // Function to get OpenAI API key
    async function getOpenAIApiKey() {
        if (!CONFIG.isProduction) {
            return ''; // In development, we'll use mock questions
        }
        
        try {
            // In production, fetch the API key from a server endpoint
            // This endpoint should be implemented on your server to securely provide the API key
            const response = await fetch('/api/openai-key');
            if (!response.ok) {
                throw new Error('Failed to fetch API key');
            }
            const data = await response.json();
            return data.apiKey || '';
        } catch (error) {
            console.error('Error fetching API key:', error);
            return '';
        }
    }

    // Function to fetch questions from OpenAI API
    async function fetchQuestionsFromOpenAI(difficulty) {
        try {
            // Get API key from server
            const apiKey = await getOpenAIApiKey();
            
            // Don't make actual API calls if API key is not available
            if (!apiKey) {
                console.log('OpenAI API key not available. Falling back to mock questions.');
                return getQuestionFromMockData(difficulty);
            }
            
            // Construct prompt based on difficulty
            let prompt = '';
            switch (difficulty) {
                case 'easy':
                    prompt = 'Create 1 basic trading setup question for beginners about stock market trading. The question should be multiple choice with 4 options and only one correct answer. Format the response as JSON with fields: question, options (array of 4 strings), and correctAnswer (string matching one of the options).';
                    break;
                case 'medium':
                    prompt = 'Create 1 intermediate trading setup question about stock market trading strategies or technical analysis. The question should be multiple choice with 4 options and only one correct answer. Format the response as JSON with fields: question, options (array of 4 strings), and correctAnswer (string matching one of the options).';
                    break;
                case 'hard':
                    prompt = 'Create 1 advanced trading setup question about complex trading strategies, market psychology, or professional trading setups. The question should be multiple choice with 4 options and only one correct answer. Format the response as JSON with fields: question, options (array of 4 strings), and correctAnswer (string matching one of the options).';
                    break;
                default:
                    prompt = 'Create 1 trading setup question about stock market trading. The question should be multiple choice with 4 options and only one correct answer. Format the response as JSON with fields: question, options (array of 4 strings), and correctAnswer (string matching one of the options).';
            }
            
            // Make API request to OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: CONFIG.openAI.model,
                    messages: [
                        {
                            role: "system",
                            content: "You are a trading expert creating quiz questions about trading setups and strategies."
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
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract the content from the response
            const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            
            if (!content) {
                throw new Error('No content in API response');
            }
            
            // Try to parse the JSON from the content
            try {
                // Find JSON in the response - it might be wrapped in markdown code blocks
                let jsonStr = content;
                
                // If the content contains markdown code blocks, extract the JSON
                const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    jsonStr = jsonMatch[1];
                }
                
                // Parse the JSON
                const questionData = JSON.parse(jsonStr);
                
                // Validate the question data
                if (!questionData.question || !Array.isArray(questionData.options) || !questionData.correctAnswer) {
                    console.error('Invalid question data format from API:', questionData);
                    return getQuestionFromMockData(difficulty);
                }
                
                // Ensure correctAnswer is one of the options
                if (!questionData.options.includes(questionData.correctAnswer)) {
                    console.error('Correct answer not found in options:', questionData);
                    return getQuestionFromMockData(difficulty);
                }
                
                return questionData;
            } catch (parseError) {
                console.error('Error parsing question data from API:', parseError);
                console.log('Raw content:', content);
                return getQuestionFromMockData(difficulty);
            }
        } catch (error) {
            console.error('Error fetching questions from OpenAI:', error);
            return getQuestionFromMockData(difficulty);
        }
    }

    // Initialize quiz
    function initQuiz() {
        // Reset quiz state
        currentQuestionIndex = 0;
        score = 0;
        currentLevel = 0;
        questionsCompletedInLevel = 0;
        questionCache = {};
        
        // Update level display
        updateLevelDisplay();
        
        // Get first question
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
    
    // Get next question
    async function getNextQuestion() {
        // Determine difficulty level based on current question index
        let difficultyLevel;
        if (currentQuestionIndex < 10) {
            difficultyLevel = 'easy';
        } else if (currentQuestionIndex < 20) {
            difficultyLevel = 'medium';
        } else {
            difficultyLevel = 'hard';
        }
        
        try {
            // Get question from API or cache
            const questionData = await getQuestionFromAPIOrCache(difficultyLevel);
            
            // Display the question
            if (questionData) {
                displayQuestion(questionData);
            } else {
                showError('Failed to load question. Please try again.');
            }
        } catch (error) {
            console.error('Error getting next question:', error);
            showError('Failed to load question. Please try again.');
        }
    }
    
    // Get question from API or cache
    async function getQuestionFromAPIOrCache(difficultyLevel) {
        // If we're in development mode or API is not available, use mock data
        if (!CONFIG.isProduction) {
            return getQuestionFromMockData(difficultyLevel);
        }
        
        // Check if we have cached questions for this difficulty
        if (!questionCache[difficultyLevel] || questionCache[difficultyLevel].length === 0) {
            // Fetch new questions from API
            showLoading(true);
            try {
                const apiQuestion = await fetchQuestionsFromOpenAI(difficultyLevel);
                
                // If API call failed or returned no questions, use mock data
                if (!apiQuestion) {
                    showLoading(false);
                    return getQuestionFromMockData(difficultyLevel);
                }
                
                // Initialize cache for this difficulty if needed
                if (!questionCache[difficultyLevel]) {
                    questionCache[difficultyLevel] = [];
                }
                
                // Add the question to cache
                questionCache[difficultyLevel].push(apiQuestion);
            } catch (error) {
                console.error('Error fetching questions from API:', error);
                showError('Failed to load questions. Using backup questions instead.');
                showLoading(false);
                return getQuestionFromMockData(difficultyLevel);
            }
            showLoading(false);
        }
        
        // Return and remove the first question from cache
        return questionCache[difficultyLevel].shift();
    }

    // Get question from mock data
    function getQuestionFromMockData(difficultyLevel) {
        let mockQuestions;
        
        // Select questions based on difficulty
        switch (difficultyLevel) {
            case 'easy':
                mockQuestions = MOCK_QUESTIONS_EASY;
                break;
            case 'medium':
                mockQuestions = MOCK_QUESTIONS_MEDIUM;
                break;
            case 'hard':
                mockQuestions = MOCK_QUESTIONS_HARD;
                break;
            default:
                mockQuestions = MOCK_QUESTIONS_EASY;
        }
        
        // Shuffle the questions to get a random one
        const shuffledQuestions = shuffleArray([...mockQuestions]);
        
        // Return the first question
        return shuffledQuestions[0];
    }

    // Display question
    function displayQuestion(questionData) {
        // Hide loading spinner
        showLoading(false);
        
        // If we have a valid question, display it
        if (questionData && questionData.question) {
            showQuestion(questionData);
        } else {
            console.error('Invalid question data:', questionData);
            showError('Failed to load a valid question. Please try again.');
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
    
    // Check if the answer is correct
    function checkAnswer(isCorrect) {
        // Disable all option buttons to prevent multiple selections
        const optionButtons = optionsContainer.querySelectorAll('button');
        optionButtons.forEach(button => {
            button.disabled = true;
        });
        
        if (isCorrect) {
            // Correct answer
            score++;
            questionsCompletedInLevel++;
            currentQuestionIndex++;
            
            // Update score display
            scoreOdometer.innerHTML = score;
            
            // Check if level is complete
            if (questionsCompletedInLevel >= LEVELS[currentLevel].questionsRequired) {
                // Level complete, move to next level
                currentLevel++;
                questionsCompletedInLevel = 0;
                
                // Check if all levels are complete
                if (currentLevel >= LEVELS.length) {
                    // Quiz complete
                    showFinalScore();
                    return;
                }
                
                // Update level display for the new level
                updateLevelDisplay();
            }
            
            // Get next question after a short delay
            setTimeout(() => {
                getNextQuestion();
            }, 1000);
        } else {
            // Incorrect answer - reset score to zero
            score = 0;
            scoreOdometer.innerHTML = score;
            
            // Show game over message
            setTimeout(() => {
                showFinalScore();
            }, 1000);
        }
    }
    
    // Show final score
    function showFinalScore() {
        // Hide quiz container and show final score container
        quizContainer.classList.add('hidden');
        finalScoreContainer.classList.remove('hidden');
        
        // Hide the score container since we're showing the final score
        scoreContainer.classList.add('hidden');
        
        // Set final score message
        finalScoreMessage.innerHTML = `You've completed the Trading Setups Quiz!`;
        finalScoreValue.innerHTML = `${score} of 30`;
        
        // Show restart button
        restartButton.classList.remove('hidden');
        
        // Show share buttons
        shareContainer.classList.remove('hidden');
        
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

    // Add event listener for restart button
    restartButton.addEventListener('click', () => {
        // Hide final score container
        finalScoreContainer.classList.add('hidden');
        
        // Show score container and quiz container
        scoreContainer.classList.remove('hidden');
        quizContainer.classList.remove('hidden');
        
        // Restart quiz
        initQuiz();
    });

    // Auto-start quiz instead of showing the difficulty selection screen
    initQuiz();
});