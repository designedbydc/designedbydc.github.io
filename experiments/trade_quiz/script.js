document.addEventListener('DOMContentLoaded', function() {
    console.log("DEBUG: DOM Content loaded, starting initialization");
    
    // Check key elements
    const elementsToCheck = [
        { name: 'difficultyContainer', element: document.getElementById('difficulty-container') },
        { name: 'quizMainContainer', element: document.getElementById('quiz-main-container') },
        { name: 'questionContainer', element: document.getElementById('question-container') },
        { name: 'questionElement', element: document.getElementById('question') },
        { name: 'optionsContainer', element: document.getElementById('options-container') },
        { name: 'feedbackContainer', element: document.getElementById('feedback-container') },
        { name: 'loadingContainer', element: document.getElementById('loading-container') },
        { name: 'errorContainer', element: document.getElementById('error-container') },
        { name: 'quizContainer', element: document.getElementById('quiz-container') }
    ];
    
    elementsToCheck.forEach(item => {
        console.log(`DEBUG: Element check - ${item.name}: ${item.element ? 'Found' : 'MISSING'}`);
    });

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
    const toggleMusicButton = document.getElementById('toggle-music');
    
    // Initialize variables
    let currentQuestionIndex = 0;
    let score = 0;
    let currentLevel = 0;
    let questionCache = {}; // Cache for questions from API
    let questionsCompletedInLevel = 0;
    let currentQuestion = null;
    let currentDifficulty = 'easy';
    let odometerInstance;
    let questionsAnswered = 0;
    let totalQuestions = 30;
    
    // Initialize music player
    initMusicPlayer();
    
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
        console.log("DEBUG: Getting OpenAI API key");
        if (!CONFIG.isProduction) {
            console.log("DEBUG: Development environment detected, using mock questions");
            return ''; // In development, we'll use mock questions
        }
        
        try {
            console.log("DEBUG: Fetching API key from server endpoint");
            // In production, fetch the API key from a server endpoint
            // This endpoint should be implemented on your server to securely provide the API key
            const response = await fetch('/api/openai-key');
            if (!response.ok) {
                console.error("DEBUG: Failed to fetch API key, status:", response.status);
                throw new Error('Failed to fetch API key');
            }
            const data = await response.json();
            console.log("DEBUG: API key fetched successfully");
            return data.apiKey || '';
        } catch (error) {
            console.error('DEBUG: Error fetching API key:', error);
            return '';
        }
    }

    // Function to fetch questions from OpenAI API
    async function fetchQuestionsFromOpenAI(difficulty) {
        console.log("DEBUG: Fetching questions from OpenAI, difficulty:", difficulty);
        try {
            // Get API key from server
            const apiKey = await getOpenAIApiKey();
            console.log("DEBUG: API key availability:", apiKey ? "Available" : "Not available");
            
            // Don't make actual API calls if API key is not available
            if (!apiKey) {
                console.log('DEBUG: OpenAI API key not available. Falling back to mock questions.');
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

    // Initialize the quiz
    function initQuiz() {
        console.log("DEBUG: Initializing quiz");
        // Reset variables
        score = 0;
        questionsAnswered = 0;
        
        // Initialize score display
        if (scoreOdometer) {
            try {
                console.log("DEBUG: Initializing Odometer for score display");
                odometerInstance = new Odometer({
                    el: scoreOdometer,
                    value: 0,
                    format: 'd',
                    theme: 'minimal'
                });
            } catch (error) {
                console.error('DEBUG: Error initializing Odometer:', error);
                scoreOdometer.textContent = '0';
            }
        }
        
        // Show quiz container and hide final score
        quizMainContainer.classList.remove('hidden');
        scoreContainer.classList.remove('hidden');
        finalScoreContainer.classList.add('hidden');
        
        console.log("DEBUG: About to get first question");
        // Get first question
        getNextQuestion();
    }
    
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
    
    // Get the next question
    function getNextQuestion() {
        console.log("DEBUG: Getting next question, questions answered:", questionsAnswered);
        // Show loading indicator
        loadingContainer.classList.remove('hidden');
        quizContainer.classList.add('hidden');
        
        // Check if we've reached the end of the quiz
        if (questionsAnswered >= totalQuestions) {
            console.log("DEBUG: Reached total questions limit, showing final score");
            showFinalScore();
            return;
        }
        
        console.log("DEBUG: About to fetch new question");
        // Fetch a new question
        fetchQuestion()
            .then(question => {
                console.log("DEBUG: Question fetched successfully:", question ? "Yes" : "No");
                if (question) {
                    displayQuestion(question);
                } else {
                    console.error("DEBUG: Failed to load question from API, using mock question");
                    
                    // Use a mock question as fallback
                    const randomIndex = Math.floor(Math.random() * mockQuestions.length);
                    const fallbackQuestion = mockQuestions[randomIndex];
                    console.log("DEBUG: Using fallback question:", fallbackQuestion);
                    
                    displayQuestion(fallbackQuestion);
                }
            })
            .catch(error => {
                console.error("DEBUG: Error getting next question:", error);
                
                // Use a mock question as fallback
                const randomIndex = Math.floor(Math.random() * mockQuestions.length);
                const fallbackQuestion = mockQuestions[randomIndex];
                console.log("DEBUG: Using fallback question after error:", fallbackQuestion);
                
                displayQuestion(fallbackQuestion);
            });
    }

    // Fetch a question from the API or use mock questions
    function fetchQuestion() {
        console.log("DEBUG: Entering fetchQuestion function");
        
        // Get difficulty based on progress
        let difficulty = 'easy';
        let questionPool;
        
        // Progressive difficulty logic
        // First 10 questions are easy, next 10 are medium, last 10 are hard
        if (questionsAnswered < 10) {
            difficulty = 'easy';
            questionPool = MOCK_QUESTIONS_EASY;
            console.log("DEBUG: Using EASY difficulty for question", questionsAnswered + 1);
        } else if (questionsAnswered < 20) {
            difficulty = 'medium';
            questionPool = MOCK_QUESTIONS_MEDIUM;
            console.log("DEBUG: Using MEDIUM difficulty for question", questionsAnswered + 1);
        } else {
            difficulty = 'hard';
            questionPool = MOCK_QUESTIONS_HARD;
            console.log("DEBUG: Using HARD difficulty for question", questionsAnswered + 1);
        }
        
        // Update UI to reflect current difficulty (optional)
        if (currentDifficultySpan) {
            currentDifficultySpan.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }
        
        // For testing, use mock questions directly
        const useLocalMockQuestions = true;
        
        if (useLocalMockQuestions) {
            console.log(`DEBUG: Using local ${difficulty.toUpperCase()} questions`);
            
            // Ensure we have questions in the pool
            if (!questionPool || questionPool.length === 0) {
                console.error(`DEBUG: No ${difficulty} questions available, using general pool`);
                questionPool = mockQuestions;
            }
            
            // Get random question from the difficulty-specific pool
            const randomIndex = Math.floor(Math.random() * questionPool.length);
            const question = questionPool[randomIndex];
            console.log("DEBUG: Selected mock question:", question);
            return Promise.resolve(question);
        }
        
        // If not using local questions, would need to adjust API call to use the current difficulty
        // For now, just return a mock question based on difficulty
        const randomIndex = Math.floor(Math.random() * questionPool.length);
        return Promise.resolve(questionPool[randomIndex]);
    }

    // Display question
    function displayQuestion(questionData) {
        console.log("DEBUG: Displaying question:", questionData);
        
        if (!questionData) {
            console.error("DEBUG: No question data provided");
            showError("Failed to load question. Please try again.");
            return;
        }

        // Check if required DOM elements exist
        if (!loadingContainer || !quizContainer || !questionElement || !optionsContainer) {
            console.error("DEBUG: Required DOM elements missing:", {
                loadingContainer: !!loadingContainer,
                quizContainer: !!quizContainer,
                questionElement: !!questionElement,
                optionsContainer: !!optionsContainer
            });
            showError("Critical error: UI elements not found. Please reload the page.");
            return;
        }

        // Hide loading and show quiz container
        loadingContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        // Update question counter and difficulty indicator
        updateDifficultyIndicator();
        
        // Display the question - decode HTML entities
        questionElement.innerHTML = decodeHtmlEntities(questionData.question);
        console.log("DEBUG: Question content set to:", questionElement.innerHTML);
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Shuffle options for randomness
        const options = [...questionData.options];
        shuffleArray(options);
        
        console.log("DEBUG: Adding option buttons for:", options);
        
        if (!options || options.length === 0) {
            console.error("DEBUG: No options available for question");
            showError("Failed to load question options. Please try again.");
            return;
        }
        
        // Create and append option buttons with updated styling
        options.forEach((option, index) => {
            console.log(`DEBUG: Creating button for option ${index + 1}:`, option);
            const button = document.createElement('button');
            button.innerHTML = decodeHtmlEntities(option);
            button.className = 'option-btn w-full py-3 px-4 text-lg font-bold rounded-lg border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors';
            // Add debug to click event
            button.addEventListener('click', () => {
                console.log(`DEBUG: Option button clicked: "${option}"`);
                checkAnswer(option, questionData.correctAnswer);
            });
            optionsContainer.appendChild(button);
        });
        
        console.log("DEBUG: Option buttons added, count:", optionsContainer.children.length);
        console.log("DEBUG: Options container:", optionsContainer.innerHTML);
        
        // Hide any previous feedback
        feedbackContainer.classList.add('hidden');
    }
    
    // New function to update the difficulty indicator
    function updateDifficultyIndicator() {
        // Get current difficulty based on questions answered
        let difficulty = 'easy';
        let color = '#10B981'; // Green for easy
        
        if (questionsAnswered < 10) {
            difficulty = 'Easy';
            color = '#10B981'; // Green
        } else if (questionsAnswered < 20) {
            difficulty = 'Medium';
            color = '#F59E0B'; // Amber
        } else {
            difficulty = 'Hard';
            color = '#EF4444'; // Red
        }
        
        // Update UI to show current question number and difficulty
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = `${questionsAnswered + 1}`;
        }
        
        if (currentDifficultySpan) {
            currentDifficultySpan.textContent = difficulty;
            currentDifficultySpan.style.color = color;
        }
        
        // Add a small indicator at the top of the quiz
        const difficultyIndicator = document.createElement('div');
        difficultyIndicator.className = 'text-center mb-4';
        difficultyIndicator.innerHTML = `
            <span class="text-sm font-medium" style="color: ${color}">
                Question ${questionsAnswered + 1}/30 - ${difficulty} Difficulty
            </span>
        `;
        
        // Remove any existing indicator
        const existingIndicator = document.querySelector('.difficulty-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Add class for easier removal later
        difficultyIndicator.classList.add('difficulty-indicator');
        
        // Insert at the beginning of the question container
        if (questionContainer && questionContainer.firstChild) {
            questionContainer.insertBefore(difficultyIndicator, questionContainer.firstChild);
        } else if (questionContainer) {
            questionContainer.appendChild(difficultyIndicator);
        }
    }
    
    // Helper function to decode HTML entities
    function decodeHtmlEntities(text) {
        console.log("DEBUG: Decoding HTML entities for:", text);
        if (!text) {
            console.error("DEBUG: Trying to decode undefined or null text");
            return "";
        }
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    // Show feedback for the answer
    function showFeedback(isCorrect, correctAnswer) {
        console.log("DEBUG: Showing feedback, isCorrect:", isCorrect);
        
        if (!feedbackContainer || !feedbackText) {
            console.error("DEBUG: Feedback DOM elements missing:", {
                feedbackContainer: !!feedbackContainer,
                feedbackText: !!feedbackText
            });
            // Try to continue anyway by getting next question
            setTimeout(() => getNextQuestion(), 2000);
            return;
        }
        
        if (isCorrect) {
            // For correct answers, don't show any feedback message
            feedbackContainer.classList.add('hidden');
        } else {
            // Only show feedback for incorrect answers
            feedbackContainer.classList.remove('hidden');
            feedbackContainer.firstElementChild.className = 'p-4 mb-4 text-white bg-black border-2 border-black rounded-lg';
            feedbackText.innerHTML = `Incorrect. The correct answer is: <strong>${decodeHtmlEntities(correctAnswer)}</strong>`;
        }
        
        // Disable all option buttons after an answer is selected
        const optionButtons = document.querySelectorAll('.option-btn');
        console.log("DEBUG: Disabling option buttons, count:", optionButtons.length);
        optionButtons.forEach(button => {
            button.disabled = true;
            if (decodeHtmlEntities(button.innerHTML) === decodeHtmlEntities(correctAnswer)) {
                button.className = 'option-btn w-full py-3 px-4 text-lg font-bold rounded-lg border-2 border-black bg-black text-white';
            } else if (decodeHtmlEntities(button.innerHTML) !== decodeHtmlEntities(correctAnswer) && !isCorrect && button.disabled) {
                button.className = 'option-btn w-full py-3 px-4 text-lg font-bold rounded-lg border-2 border-black bg-white text-black opacity-50';
            }
        });
        
        // Get next question after a delay - shorter for correct answers
        console.log("DEBUG: Setting timeout to get next question");
        const delay = isCorrect ? 900 : 2000; // Shorter delay for correct answers
        setTimeout(() => {
            console.log("DEBUG: Timeout triggered, getting next question");
            getNextQuestion();
        }, delay);
    }

    // Check if the answer is correct
    function checkAnswer(selectedAnswer, correctAnswer) {
        console.log("DEBUG: Checking answer:", selectedAnswer, "against correct:", correctAnswer);
        
        if (!selectedAnswer || !correctAnswer) {
            console.error("DEBUG: Missing answer data:", { selectedAnswer, correctAnswer });
            return;
        }
        
        const isCorrect = decodeHtmlEntities(selectedAnswer) === decodeHtmlEntities(correctAnswer);
        console.log("DEBUG: Answer is correct:", isCorrect);
        
        if (isCorrect) {
            // Correct answer
            updateScore(score + 1);
        }
        
        // Increment questions answered counter
        questionsAnswered++;
        console.log("DEBUG: Questions answered incremented to:", questionsAnswered);
        
        // Check if we've reached the total questions limit - moved outside the isCorrect block
        // so it works for both correct and incorrect answers
        if (questionsAnswered >= totalQuestions) {
            console.log("DEBUG: Reached total questions limit, showing final score soon");
            setTimeout(() => {
                showFinalScore();
            }, isCorrect ? 900 : 2000); // Use appropriate delay based on correctness
            return;
        }
        
        // Show feedback
        showFeedback(isCorrect, correctAnswer);
    }
    
    // Show final score
    function showFinalScore() {
        console.log("DEBUG: Showing final score. Score:", score, "Questions answered:", questionsAnswered);
        
        // Hide quiz container
        quizMainContainer.classList.add('hidden');
        scoreContainer.classList.add('hidden');
        
        // Show final score container
        finalScoreContainer.classList.remove('hidden');
        
        // Update final score
        finalScoreValue.textContent = `${score} of 30`;
        console.log("DEBUG: Final score set to:", finalScoreValue.textContent);
        
        // Create a more descriptive final message based on score
        let finalMessage = '';
        if (score >= 25) {
            finalMessage = "Exceptional! You're a master of trading setups across all difficulty levels!";
        } else if (score >= 20) {
            finalMessage = "Impressive! You handled the progressive difficulty with great skill!";
        } else if (score >= 15) {
            finalMessage = "Well done! You showed good knowledge as the questions got harder!";
        } else if (score >= 10) {
            finalMessage = "Good effort! You did well on the easier questions and faced the challenge of harder ones.";
        } else {
            finalMessage = "Thanks for taking the quiz! Trading setups get complex as difficulty increases.";
        }
        
        // Update the final message
        if (finalScoreMessage) {
            finalScoreMessage.textContent = finalMessage;
        }
        
        // Show restart button and share container
        restartButton.classList.remove('hidden');
        shareContainer.classList.remove('hidden');
        
        // Show confetti for scores above 20
        if (score > 20) {
            console.log("DEBUG: Showing confetti for high score");
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    // Share result on social media
    window.shareResult = function(platform) {
        const score = finalScoreValue.textContent;
        const text = `I scored ${score} on the Trading Setups Quiz! Can you beat my score?`;
        const url = window.location.href;
        
        let shareUrl;
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank');
    };
    
    // Show error message
    function showError(message) {
        console.error("DEBUG: Showing error:", message);
        
        if (!errorContainer || !errorMessage) {
            console.error("DEBUG: Error DOM elements missing");
            // Display error in console as fallback
            console.error("CRITICAL ERROR:", message);
            return;
        }
        
        errorContainer.classList.remove('hidden');
        errorContainer.className = 'p-4 mb-4 text-white bg-black border-2 border-black rounded-lg';
        errorMessage.textContent = message;
        
        // Hide quiz container when showing error
        if (quizContainer) quizContainer.classList.add('hidden');
        if (loadingContainer) loadingContainer.classList.add('hidden');
    }
    
    // Update score
    function updateScore(newScore) {
        score = newScore;
        if (odometerInstance) {
            odometerInstance.update(score);
        } else if (scoreOdometer) {
            scoreOdometer.textContent = score;
        }
    }
    
    // Restart the quiz
    function restartQuiz() {
        initQuiz();
    }

    // Initialize music player
    function initMusicPlayer() {
        // YouTube player will be initialized when API is ready
    }

    // Add this function to check if getQuestionFromMockData exists or define it if missing
    function getQuestionFromMockData(difficulty) {
        console.log("DEBUG: Getting mock question for difficulty:", difficulty);
        
        let questionPool;
        switch(difficulty) {
            case 'easy':
                console.log("DEBUG: Using EASY mock questions");
                questionPool = MOCK_QUESTIONS_EASY;
                break;
            case 'medium':
                console.log("DEBUG: Using MEDIUM mock questions");
                questionPool = MOCK_QUESTIONS_MEDIUM;
                break;
            case 'hard':
                console.log("DEBUG: Using HARD mock questions");
                questionPool = MOCK_QUESTIONS_HARD;
                break;
            default:
                console.log("DEBUG: Using default (all) mock questions");
                questionPool = mockQuestions;
        }
        
        if (!questionPool || questionPool.length === 0) {
            console.error("DEBUG: Empty question pool for difficulty:", difficulty);
            return mockQuestions[0]; // Fallback to first question of full pool
        }
        
        const randomIndex = Math.floor(Math.random() * questionPool.length);
        console.log("DEBUG: Selected mock question at index:", randomIndex);
        return questionPool[randomIndex];
    }

    // Make sure restart button has event listener
    restartButton.addEventListener('click', function() {
        console.log("DEBUG: Restart button clicked");
        restartQuiz();
    });

    // Add debug check for undefined/null during quiz initialization
    window.addEventListener('load', function() {
        console.log("DEBUG: Window loaded, checking for undefined or missing elements/functions");
        
        // Check if key functions exist
        const functionsToCheck = [
            { name: 'initQuiz', fn: typeof initQuiz },
            { name: 'getNextQuestion', fn: typeof getNextQuestion },
            { name: 'fetchQuestion', fn: typeof fetchQuestion },
            { name: 'displayQuestion', fn: typeof displayQuestion },
            { name: 'showFinalScore', fn: typeof showFinalScore }
        ];
        
        functionsToCheck.forEach(f => {
            console.log(`DEBUG: Function check - ${f.name}: ${f.fn !== 'undefined' ? 'Defined' : 'MISSING'}`);
        });
        
        // Check if mockQuestions is properly defined
        console.log(`DEBUG: mockQuestions array length: ${mockQuestions ? mockQuestions.length : 'undefined'}`);
    });

    // Make sure everything is properly initialized
    console.log("DEBUG: DOM fully loaded event fired");
    
    // Try to identify any potential race conditions or timing issues
    setTimeout(() => {
        console.log("DEBUG: Delayed check for quiz state (after 500ms)");
        console.log("DEBUG: Current question index:", currentQuestionIndex);
        console.log("DEBUG: Questions answered:", questionsAnswered);
        console.log("DEBUG: Score:", score);
        
        // Check visibility of containers
        const containers = {
            quizMainContainer: quizMainContainer ? quizMainContainer.classList.contains('hidden') : 'not found',
            loadingContainer: loadingContainer ? loadingContainer.classList.contains('hidden') : 'not found',
            quizContainer: quizContainer ? quizContainer.classList.contains('hidden') : 'not found',
            feedbackContainer: feedbackContainer ? feedbackContainer.classList.contains('hidden') : 'not found',
            errorContainer: errorContainer ? errorContainer.classList.contains('hidden') : 'not found'
        };
        
        console.log("DEBUG: Container visibility state:", containers);
    }, 500);
    
    // Check if key functions exist and variable state
    console.log("DEBUG: Checking for undefined or missing functions/values");
    
    // Check if key functions exist
    const functionsToCheck = [
        { name: 'initQuiz', fn: typeof initQuiz },
        { name: 'getNextQuestion', fn: typeof getNextQuestion },
        { name: 'fetchQuestion', fn: typeof fetchQuestion },
        { name: 'displayQuestion', fn: typeof displayQuestion },
        { name: 'showFinalScore', fn: typeof showFinalScore },
        { name: 'getQuestionFromMockData', fn: typeof getQuestionFromMockData }
    ];
    
    functionsToCheck.forEach(f => {
        console.log(`DEBUG: Function check - ${f.name}: ${f.fn !== 'undefined' ? 'Defined' : 'MISSING'}`);
    });
    
    // Check if mockQuestions is properly defined
    console.log(`DEBUG: mockQuestions array length: ${mockQuestions ? mockQuestions.length : 'undefined'}`);
    console.log(`DEBUG: MOCK_QUESTIONS_EASY length: ${typeof MOCK_QUESTIONS_EASY !== 'undefined' ? MOCK_QUESTIONS_EASY.length : 'undefined'}`);
    console.log(`DEBUG: MOCK_QUESTIONS_MEDIUM length: ${typeof MOCK_QUESTIONS_MEDIUM !== 'undefined' ? MOCK_QUESTIONS_MEDIUM.length : 'undefined'}`);
    console.log(`DEBUG: MOCK_QUESTIONS_HARD length: ${typeof MOCK_QUESTIONS_HARD !== 'undefined' ? MOCK_QUESTIONS_HARD.length : 'undefined'}`);
    console.log(`DEBUG: CONFIG: ${typeof CONFIG !== 'undefined' ? 'Defined' : 'undefined'}`);
    
    // Debug fetch question function for potential bugs
    console.log("DEBUG: Testing fetchQuestion function");
    fetchQuestion()
        .then(question => {
            console.log("DEBUG: Test fetchQuestion succeeded:", question ? "Valid question" : "Invalid question");
        })
        .catch(error => {
            console.error("DEBUG: Test fetchQuestion failed:", error);
        });
        
    // Start the quiz
    console.log("DEBUG: Starting quiz initialization");
    initQuiz();

    // Add debug check for any DOM events that might be interfering
    // Add these at the end of the script
    console.log("DEBUG: Adding global event debugging");

    // Monitor for potential event-related issues
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click') {
            console.log(`DEBUG: Added click event listener to:`, this);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // Add debugging for fetch to check for network issues
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        console.log(`DEBUG: Fetch request to: ${args[0]}`);
        return originalFetch.apply(this, args)
            .then(response => {
                console.log(`DEBUG: Fetch response from ${args[0]}: ${response.status}`);
                return response;
            })
            .catch(error => {
                console.error(`DEBUG: Fetch error for ${args[0]}:`, error);
                throw error;
            });
    };
});

// YouTube API callback
let player;
let isPlaying = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '6Wi9_QKJ_8A', // Trading music as requested
        playerVars: {
            'playsinline': 1,
            'autoplay': 1,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Autoplay the video/music when ready
    event.target.playVideo();
    
    const toggleButton = document.getElementById('toggle-music');
    toggleButton.addEventListener('click', function() {
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });
}

function onPlayerStateChange(event) {
    const toggleButton = document.getElementById('toggle-music');
    
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm">Pause Music</span>
        `;
    } else if (event.data == YT.PlayerState.PAUSED) {
        isPlaying = false;
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
            </svg>
            <span class="text-sm">Background Music</span>
        `;
    } else if (event.data == YT.PlayerState.ENDED) {
        // Replay when ended
        player.playVideo();
    }
}