document.addEventListener('DOMContentLoaded', function() {
    // console.log("DEBUG: DOM Content loaded, starting initialization");
    
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
    
    // elementsToCheck.forEach(item => {
    //     console.log(`DEBUG: Element check - ${item.name}: ${item.element ? 'Found' : 'MISSING'}`);
    // });

    // Add OpenAI API debug logs
    const debugOpenAI = {
        logAPICall: (endpoint, params) => {
            console.log('🤖 OpenAI API Call:', {
                endpoint,
                params,
                timestamp: new Date().toISOString()
            });
        },
        logAPIResponse: (response, error = null) => {
            if (error) {
                console.error('❌ OpenAI API Error:', {
                    error,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('✅ OpenAI API Response:', {
                    status: 'success',
                    data: response,
                    timestamp: new Date().toISOString()
                });
            }
        }
    };

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
    let currentDifficulty = 0; // Now using a numerical difficulty (0-1) instead of categories
    let odometerInstance;
    let questionsAnswered = 0;
    let livesRemaining = CONFIG.maxLives;
    
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
        isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
        openAI: {
            model: 'gpt-3.5-turbo',
            maxTokens: 500,
            temperature: 0.7
        },
        maxLives: 3,
        difficultyIncreaseFactor: 0.1
    };

    // Function to get OpenAI API key
    async function getOpenAIApiKey() {
        debugOpenAI.logAPICall('getOpenAIApiKey', { isProduction: CONFIG.isProduction });
        
        try {
            // In local development, use mock questions
            if (!CONFIG.isProduction) {
                return '';
            }
            
            // Check for Vercel environment variables
            if (window.__ENV && window.__ENV.QUIZ_OPENAI_API_KEY) {
                return window.__ENV.QUIZ_OPENAI_API_KEY;
            }
            
            throw new Error('API key not available');
        } catch (error) {
            debugOpenAI.logAPIError('Error fetching API key:', error);
            if (CONFIG.isProduction) {
                console.warn('Falling back to mock questions in production due to missing API key');
            }
            return ''; // Return empty string to trigger mock questions
        }
    }

    // Function to fetch questions from OpenAI API
    async function fetchQuestionsFromOpenAI(difficulty) {
        debugOpenAI.logAPICall('fetchQuestionsFromOpenAI', { difficulty, isProduction: CONFIG.isProduction });
        
        try {
            // Get API key
            const apiKey = await getOpenAIApiKey();
            
            // If no API key and in production, try mock questions as fallback
            if (!apiKey) {
                if (CONFIG.isProduction) {
                    console.warn('No API key available in production, falling back to mock questions');
                }
                return getQuestionFromMockData(Math.floor(difficulty * 3));
            }
            
            debugOpenAI.logAPICall('apiKeyCheck', { hasKey: !!apiKey });
            
            const prompt = getDifficultyPrompt(difficulty);
            
            debugOpenAI.logAPICall('openai/chat/completions', { 
                model: CONFIG.openAI.model,
                difficulty,
                promptLength: prompt.length 
            });
            
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
                const errorData = await response.json();
                debugOpenAI.logAPIResponse(null, {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            debugOpenAI.logAPIResponse(data);
            
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
                debugOpenAI.logAPIResponse({ parsed: questionData });
                
                // Validate the question data
                if (!questionData.question || !Array.isArray(questionData.options) || !questionData.correctAnswer) {
                    throw new Error('Invalid question data format from API');
                }
                
                // Ensure correctAnswer is one of the options
                if (!questionData.options.includes(questionData.correctAnswer)) {
                    throw new Error('Correct answer not found in options');
                }
                
                return questionData;
                
            } catch (parseError) {
                debugOpenAI.logAPIResponse(null, {
                    error: parseError,
                    content: content
                });
                return getQuestionFromMockData(Math.floor(difficulty * 3));
            }
        } catch (error) {
            debugOpenAI.logAPIResponse(null, error);
            return getQuestionFromMockData(Math.floor(difficulty * 3));
        }
    }

    // Initialize the quiz
    function initQuiz() {
        // console.log("DEBUG: Initializing quiz");
        // Reset variables
        score = 0;
        questionsAnswered = 0;
        currentDifficulty = 0;
        livesRemaining = CONFIG.maxLives;
        
        // Initialize score display
        if (scoreOdometer) {
            try {
                // console.log("DEBUG: Initializing Odometer for score display");
                odometerInstance = new Odometer({
                    el: scoreOdometer,
                    value: 0,
                    format: 'd',
                    theme: 'minimal'
                });
            } catch (error) {
                // console.error('DEBUG: Error initializing Odometer:', error);
                scoreOdometer.textContent = '0';
            }
        }
        
        // Show quiz container and hide final score
        quizMainContainer.classList.remove('hidden');
        scoreContainer.classList.remove('hidden');
        finalScoreContainer.classList.add('hidden');
        
        // console.log("DEBUG: About to get first question");
        // Get first question
        getNextQuestion();
    }
    
    // Update the level display - function kept for compatibility but no longer updates UI
    function updateLevelDisplay() {
        // Question counter removed from UI
    }
    
    // Apply theme based on current level
    function applyLevelTheme(level) {
        // Use Huly-inspired theme with purple accents
        document.documentElement.style.setProperty('--accent-color', '#8b5cf6');
        document.documentElement.style.setProperty('--accent-glow', 'rgba(139, 92, 246, 0.3)');
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
        // console.log("DEBUG: Getting next question, questions answered:", questionsAnswered);
        // Show loading indicator
        loadingContainer.classList.remove('hidden');
        quizContainer.classList.add('hidden');
        
        // Check if we've reached the end of the quiz
        if (questionsAnswered >= totalQuestions) {
            // console.log("DEBUG: Reached total questions limit, showing final score");
            showFinalScore();
            return;
        }
        
        // console.log("DEBUG: About to fetch new question");
        // Fetch a new question
        fetchQuestion()
            .then(question => {
                // console.log("DEBUG: Question fetched successfully:", question ? "Yes" : "No");
                if (question) {
                    displayQuestion(question);
                } else {
                    // console.error("DEBUG: Failed to load question from API, using mock question");
                    
                    // Use a mock question as fallback
                    const randomIndex = Math.floor(Math.random() * mockQuestions.length);
                    const fallbackQuestion = mockQuestions[randomIndex];
                    // console.log("DEBUG: Using fallback question:", fallbackQuestion);
                    
                    displayQuestion(fallbackQuestion);
                }
            })
            .catch(error => {
                // console.error("DEBUG: Error getting next question:", error);
                
                // Use a mock question as fallback
                const randomIndex = Math.floor(Math.random() * mockQuestions.length);
                const fallbackQuestion = mockQuestions[randomIndex];
                // console.log("DEBUG: Using fallback question after error:", fallbackQuestion);
                
                displayQuestion(fallbackQuestion);
            });
    }

    // Fetch a question from the API or use mock questions
    function fetchQuestion() {
        debugOpenAI.logAPICall('fetchQuestion', { questionsAnswered });
        
        // Get difficulty based on progress
        let difficulty = 'easy';
        let questionPool;
        
        // Progressive difficulty logic
        if (questionsAnswered < 10) {
            difficulty = 'easy';
            questionPool = MOCK_QUESTIONS_EASY;
        } else if (questionsAnswered < 20) {
            difficulty = 'medium';
            questionPool = MOCK_QUESTIONS_MEDIUM;
        } else {
            difficulty = 'hard';
            questionPool = MOCK_QUESTIONS_HARD;
        }
        
        // Update UI to reflect current difficulty
        if (currentDifficultySpan) {
            currentDifficultySpan.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }
        
        // Set to false to use OpenAI API
        const useLocalMockQuestions = false;
        
        if (useLocalMockQuestions) {
            debugOpenAI.logAPICall('mockQuestions', { difficulty });
            const randomIndex = Math.floor(Math.random() * questionPool.length);
            const question = questionPool[randomIndex];
            debugOpenAI.logAPIResponse({ source: 'mock', question });
            return Promise.resolve(question);
        }
        
        // Use OpenAI API
        return fetchQuestionsFromOpenAI(difficulty);
    }

    // Display question
    function displayQuestion(questionData) {
        // console.log("DEBUG: Displaying question:", questionData);
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Set question text
        questionElement.textContent = decodeHtmlEntities(questionData.question);
        
        // Get correct answer
        let correctAnswer = questionData.correctAnswer;
        
        // Get all options
        let options = questionData.options.map(opt => decodeHtmlEntities(opt));
        
        // Create buttons for each option
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add(
                'option-btn',
                'w-full',
                'text-left',
                'px-5',
                'py-4',
                'rounded-xl',
                'border',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-purple-500',
                'hover:border-purple-500'
            );
            
            // Create a container for option text with letter indicator
            const optionLabel = document.createElement('div');
            optionLabel.classList.add('flex', 'items-start');
            
            // Create letter indicator (A, B, C, D)
            const letterIndicator = document.createElement('span');
            letterIndicator.classList.add('inline-flex', 'items-center', 'justify-center', 'w-7', 'h-7', 'rounded-full', 'bg-purple-500', 'bg-opacity-10', 'text-purple-400', 'text-sm', 'font-bold', 'mr-3', 'mt-0.5', 'flex-shrink-0');
            letterIndicator.textContent = String.fromCharCode(65 + index); // A, B, C, D
            
            // Create text container
            const textContainer = document.createElement('div');
            textContainer.classList.add('flex-1');
            textContainer.textContent = option;
            
            // Assemble option
            optionLabel.appendChild(letterIndicator);
            optionLabel.appendChild(textContainer);
            button.appendChild(optionLabel);
            
            // Add click event handler
            button.addEventListener('click', function(e) {
                // Disable all option buttons
                document.querySelectorAll('.option-btn').forEach(btn => {
                    btn.disabled = true;
                    btn.classList.add('opacity-60', 'cursor-not-allowed');
                });
                
                // Check if answer is correct
                const isCorrect = option === correctAnswer;
                
                // Apply visual feedback to selected option
                if (isCorrect) {
                    this.classList.add('correct');
                    // Also add the pulse effect
                    this.classList.add('animate-pulse');
                    setTimeout(() => this.classList.remove('animate-pulse'), 1000);
                } else {
                    this.classList.add('incorrect');
                    
                    // Highlight the correct answer
                    document.querySelectorAll('.option-btn').forEach(btn => {
                        if (btn.textContent.includes(correctAnswer)) {
                            btn.classList.add('correct');
                        }
                    });
                }
                
                // Show feedback
                showFeedback(isCorrect, correctAnswer);
                
                // Update score if correct
                if (isCorrect) {
                    score++;
                    updateScore(score);
                }
                
                // Increment questions answered counter
                questionsAnswered++;
                
                // If we've reached the total questions, show the final score
                if (questionsAnswered >= totalQuestions) {
                    // Delay to allow user to see the feedback
                    setTimeout(() => {
                        showFinalScore();
                    }, 1500);
                    return;
                }
                
                // Otherwise, get the next question after a delay
                setTimeout(() => {
                    loadingContainer.classList.remove('hidden');
                    quizContainer.classList.add('hidden');
                    
                    setTimeout(() => {
                        // Hide feedback
                        feedbackContainer.classList.add('hidden');
                        
                        // Get next question
                        getNextQuestion();
                    }, 1000);
                }, 1500);
            });
            
            optionsContainer.appendChild(button);
        });
        
        // Show the quiz container and hide loading
        quizContainer.classList.remove('hidden');
        loadingContainer.classList.add('hidden');
    }
    
    // New function to update the difficulty indicator
    function updateDifficultyIndicator() {
        // Apply color styling based on the current level
        let difficulty = currentDifficulty;
        let levelData = LEVELS[currentLevel];

        // Text for difficulty indicator
        let difficultyText = document.createElement('div');
        difficultyText.classList.add('text-sm', 'font-semibold', 'mb-1');
        difficultyText.textContent = levelData.name;
        
        // Create the badge
        let badge = document.createElement('span');
        badge.classList.add('inline-flex', 'items-center', 'px-2.5', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium', 'mr-2');
        badge.innerHTML = levelData.badge;
        
        // Use the Huly-inspired color theme
        badge.classList.add('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
        
        // Clear previous content
        difficultyContainer.innerHTML = '';
        
        // Append badge and text
        let container = document.createElement('div');
        container.classList.add('flex', 'items-center', 'justify-center', 'mb-2');
        container.appendChild(badge);
        container.appendChild(difficultyText);
        
        difficultyContainer.appendChild(container);

        // Update current difficulty display
        currentDifficultySpan.textContent = levelData.name;
    }
    
    // Helper function to decode HTML entities
    function decodeHtmlEntities(text) {
        // console.log("DEBUG: Decoding HTML entities for:", text);
        if (!text) {
            // console.error("DEBUG: Trying to decode undefined or null text");
            return "";
        }
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    // Show feedback for the answer
    function showFeedback(isCorrect, correctAnswer) {
        const feedbackDiv = document.getElementById('feedback-container').querySelector('div');
        
        // Set feedback classes based on result, using the new Huly-inspired design
        if (isCorrect) {
            feedbackDiv.classList.add('bg-green-500', 'bg-opacity-10', 'border', 'border-green-500', 'text-white');
            feedbackDiv.classList.remove('bg-red-500', 'bg-opacity-10', 'border-red-500');
            
            // Play success sound
            const successSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-melodic-bonus-collect-1938.mp3');
            successSound.volume = 0.5;
            try {
                successSound.play();
            } catch (e) {
                // console.warn('Could not play success sound', e);
            }
            
            // Trigger confetti for correct answers
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } catch (e) {
                // console.warn('Confetti not available', e);
            }
        } else {
            feedbackDiv.classList.add('bg-red-500', 'bg-opacity-10', 'border', 'border-red-500', 'text-white');
            feedbackDiv.classList.remove('bg-green-500', 'bg-opacity-10', 'border-green-500');
            
            // Play error sound
            const errorSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alert-quick-chime-766.mp3');
            errorSound.volume = 0.5;
            try {
                errorSound.play();
            } catch (e) {
                // console.warn('Could not play error sound', e);
            }
        }
        
        feedbackContainer.classList.remove('hidden');
        
        let feedbackMessage = isCorrect 
            ? '<span class="font-bold text-green-400">Correct!</span> ' 
            : '<span class="font-bold text-red-400">Incorrect.</span> ';
        
        feedbackMessage += isCorrect 
            ? 'Great job! ' 
            : `The correct answer is: <span class="font-semibold">${correctAnswer}</span>. `;
            
        feedbackText.innerHTML = feedbackMessage;
    }

    // Check if the answer is correct
    function checkAnswer(selectedAnswer, correctAnswer) {
        // console.log("DEBUG: Checking answer:", selectedAnswer, "against correct:", correctAnswer);
        
        if (!selectedAnswer || !correctAnswer) {
            // console.error("DEBUG: Missing answer data:", { selectedAnswer, correctAnswer });
            return;
        }
        
        const isCorrect = decodeHtmlEntities(selectedAnswer) === decodeHtmlEntities(correctAnswer);
        // console.log("DEBUG: Answer is correct:", isCorrect);
        
        if (isCorrect) {
            // Increase score and difficulty
            score++;
            updateScore(score);
            currentDifficulty = Math.min(1, currentDifficulty + CONFIG.difficultyIncreaseFactor);
        } else {
            // Decrease lives
            livesRemaining--;
            updateLivesDisplay();
            
            // Check if game over
            if (livesRemaining <= 0) {
                setTimeout(() => {
                    showFinalScore();
                }, 1500);
                return;
            }
        }
        
        questionsAnswered++;
        // console.log("DEBUG: Questions answered incremented to:", questionsAnswered);
        
        // Check if we've reached the total questions limit - moved outside the isCorrect block
        // so it works for both correct and incorrect answers
        if (questionsAnswered >= totalQuestions) {
            // console.log("DEBUG: Reached total questions limit, showing final score soon");
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
        // console.log("DEBUG: Showing final score. Score:", score, "Questions answered:", questionsAnswered);
        
        // Hide quiz container
        quizMainContainer.classList.add('hidden');
        scoreContainer.classList.add('hidden');
        
        // Show final score container
        finalScoreContainer.classList.remove('hidden');
        
        // Update final score
        finalScoreValue.textContent = `${score} questions`;
        // console.log("DEBUG: Final score set to:", finalScoreValue.textContent);
        
        // Create a more descriptive final message based on score and reason for game end
        let finalMessage = '';
        if (livesRemaining === 0) {
            finalMessage = `Game Over! You ran out of lives after answering ${questionsAnswered} questions. `;
        }
        
        if (score >= 30) {
            finalMessage += "Exceptional! You're a true trading master!";
        } else if (score >= 20) {
            finalMessage += "Impressive! You showed great trading knowledge!";
        } else if (score >= 10) {
            finalMessage += "Good effort! You're developing solid trading skills.";
        } else {
            finalMessage += "Keep practicing! Trading is a journey of continuous learning.";
        }
        
        // Update the final message
        if (finalScoreMessage) {
            finalScoreMessage.textContent = finalMessage;
        }
        
        // Show restart button and share container
        restartButton.classList.remove('hidden');
        shareContainer.classList.remove('hidden');
        
        // Show confetti for high scores
        if (score > 20) {
            // console.log("DEBUG: Showing confetti for high score");
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
        // console.error("DEBUG: Showing error:", message);
        
        if (!errorContainer || !errorMessage) {
            // console.error("DEBUG: Error DOM elements missing");
            // Display error in console as fallback
            // console.error("CRITICAL ERROR:", message);
            return;
        }
        
        errorContainer.classList.remove('hidden');
        errorContainer.classList.add('text-red-400', 'bg-red-500', 'bg-opacity-10', 'border', 'border-red-500');
        errorMessage.textContent = message;
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
        
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
        // console.log("DEBUG: Getting mock question for difficulty:", difficulty);
        
        let questionPool;
        switch(difficulty) {
            case 'easy':
                // console.log("DEBUG: Using EASY mock questions");
                questionPool = MOCK_QUESTIONS_EASY;
                break;
            case 'medium':
                // console.log("DEBUG: Using MEDIUM mock questions");
                questionPool = MOCK_QUESTIONS_MEDIUM;
                break;
            case 'hard':
                // console.log("DEBUG: Using HARD mock questions");
                questionPool = MOCK_QUESTIONS_HARD;
                break;
            default:
                // console.log("DEBUG: Using default (all) mock questions");
                questionPool = mockQuestions;
        }
        
        if (!questionPool || questionPool.length === 0) {
            // console.error("DEBUG: Empty question pool for difficulty:", difficulty);
            return mockQuestions[0]; // Fallback to first question of full pool
        }
        
        const randomIndex = Math.floor(Math.random() * questionPool.length);
        // console.log("DEBUG: Selected mock question at index:", randomIndex);
        return questionPool[randomIndex];
    }

    // Make sure restart button has event listener
    restartButton.addEventListener('click', function() {
        // console.log("DEBUG: Restart button clicked");
        restartQuiz();
    });

    // Add debug check for undefined/null during quiz initialization
    window.addEventListener('load', function() {
        // console.log("DEBUG: Window loaded, checking for undefined or missing elements/functions");
        
        // Check if key functions exist
        const functionsToCheck = [
            { name: 'initQuiz', fn: typeof initQuiz },
            { name: 'getNextQuestion', fn: typeof getNextQuestion },
            { name: 'fetchQuestion', fn: typeof fetchQuestion },
            { name: 'displayQuestion', fn: typeof displayQuestion },
            { name: 'showFinalScore', fn: typeof showFinalScore }
        ];
        
        functionsToCheck.forEach(f => {
            // console.log(`DEBUG: Function check - ${f.name}: ${f.fn !== 'undefined' ? 'Defined' : 'MISSING'}`);
        });
        
        // Check if mockQuestions is properly defined
        // console.log(`DEBUG: mockQuestions array length: ${mockQuestions ? mockQuestions.length : 'undefined'}`);
    });

    // Make sure everything is properly initialized
    // console.log("DEBUG: DOM fully loaded event fired");
    
    // Try to identify any potential race conditions or timing issues
    setTimeout(() => {
        // console.log("DEBUG: Delayed check for quiz state (after 500ms)");
        // console.log("DEBUG: Current question index:", currentQuestionIndex);
        // console.log("DEBUG: Questions answered:", questionsAnswered);
        // console.log("DEBUG: Score:", score);
        
        // Check visibility of containers
        const containers = {
            quizMainContainer: quizMainContainer ? quizMainContainer.classList.contains('hidden') : 'not found',
            loadingContainer: loadingContainer ? loadingContainer.classList.contains('hidden') : 'not found',
            quizContainer: quizContainer ? quizContainer.classList.contains('hidden') : 'not found',
            feedbackContainer: feedbackContainer ? feedbackContainer.classList.contains('hidden') : 'not found',
            errorContainer: errorContainer ? errorContainer.classList.contains('hidden') : 'not found'
        };
        
        // console.log("DEBUG: Container visibility state:", containers);
    }, 500);
    
    // Check if key functions exist and variable state
    // console.log("DEBUG: Checking for undefined or missing functions/values");
    
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
        // console.log(`DEBUG: Function check - ${f.name}: ${f.fn !== 'undefined' ? 'Defined' : 'MISSING'}`);
    });
    
    // Check if mockQuestions is properly defined
    // console.log(`DEBUG: mockQuestions array length: ${mockQuestions ? mockQuestions.length : 'undefined'}`);
    // console.log(`DEBUG: MOCK_QUESTIONS_EASY length: ${typeof MOCK_QUESTIONS_EASY !== 'undefined' ? MOCK_QUESTIONS_EASY.length : 'undefined'}`);
    // console.log(`DEBUG: MOCK_QUESTIONS_MEDIUM length: ${typeof MOCK_QUESTIONS_MEDIUM !== 'undefined' ? MOCK_QUESTIONS_MEDIUM.length : 'undefined'}`);
    // console.log(`DEBUG: MOCK_QUESTIONS_HARD length: ${typeof MOCK_QUESTIONS_HARD !== 'undefined' ? MOCK_QUESTIONS_HARD.length : 'undefined'}`);
    // console.log(`DEBUG: CONFIG: ${typeof CONFIG !== 'undefined' ? 'Defined' : 'undefined'}`);
    
    // Debug fetch question function for potential bugs
    // console.log("DEBUG: Testing fetchQuestion function");
    fetchQuestion()
        .then(question => {
            // console.log("DEBUG: Test fetchQuestion succeeded:", question ? "Valid question" : "Invalid question");
        })
        .catch(error => {
            // console.error("DEBUG: Test fetchQuestion failed:", error);
        });
        
    // Start the quiz
    // console.log("DEBUG: Starting quiz initialization");
    initQuiz();

    // Add debug check for any DOM events that might be interfering
    // Add these at the end of the script
    // console.log("DEBUG: Adding global event debugging");

    // Monitor for potential event-related issues
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click') {
            // console.log(`DEBUG: Added click event listener to:`, this);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // Add debugging for fetch to check for network issues
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        // console.log(`DEBUG: Fetch request to: ${args[0]}`);
        return originalFetch.apply(this, args)
            .then(response => {
                // console.log(`DEBUG: Fetch response from ${args[0]}: ${response.status}`);
                return response;
            })
            .catch(error => {
                // console.error(`DEBUG: Fetch error for ${args[0]}:`, error);
                throw error;
            });
    };

    // Add lives display to the UI
    const livesContainer = document.createElement('div');
    livesContainer.id = 'lives-container';
    livesContainer.className = 'flex items-center justify-center space-x-2 mb-4';
    livesContainer.innerHTML = `
        <span class="text-sm font-semibold text-purple-400">Lives:</span>
        <div class="flex space-x-1" id="lives-display"></div>
    `;
    document.querySelector('#quiz-container').prepend(livesContainer);

    // Function to update lives display
    function updateLivesDisplay() {
        const livesDisplay = document.getElementById('lives-display');
        livesDisplay.innerHTML = Array(livesRemaining).fill('❤️').join(' ');
    }

    // Function to get difficulty-appropriate prompt
    function getDifficultyPrompt(difficulty) {
        // difficulty is now a number from 0 to 1
        let basePrompt = 'Create 1 trading setup question about';
        
        if (difficulty < 0.3) {
            return basePrompt + ' basic stock market trading concepts. Focus on fundamental patterns and simple setups.';
        } else if (difficulty < 0.6) {
            return basePrompt + ' intermediate trading strategies and technical analysis. Include more complex patterns and market dynamics.';
        } else {
            return basePrompt + ' advanced trading concepts, complex market psychology, and professional trading setups. Focus on sophisticated strategies and advanced market mechanics.';
        }
    }
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