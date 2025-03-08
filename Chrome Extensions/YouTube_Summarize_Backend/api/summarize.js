import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to set CORS headers
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

export default async function handler(req, res) {
    // Set CORS headers for all requests
    setCorsHeaders(res);

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("Request body:", JSON.stringify(req.body));
        
        // Handle multiple possible input formats
        let commentsArray;
        
        if (Array.isArray(req.body)) {
            // Direct array input
            commentsArray = req.body;
        } else if (req.body?.comments && Array.isArray(req.body.comments)) {
            // { comments: [] } format
            commentsArray = req.body.comments;
        } else {
            // Try to parse if it's a stringified JSON
            try {
                const parsed = JSON.parse(req.body);
                commentsArray = Array.isArray(parsed) ? parsed : parsed?.comments;
            } catch (e) {
                // Not valid JSON
                commentsArray = null;
            }
        }

        if (!commentsArray || !Array.isArray(commentsArray)) {
            return res.status(400).json({ 
                error: 'Invalid request body. Expected an array of comments.',
                received: typeof req.body === 'object' ? JSON.stringify(req.body) : typeof req.body
            });
        }

        const prompt = `Analyze these YouTube comments and provide a comprehensive summary. Focus on:
1. Main discussion points and themes
2. Notable opinions or insights
3. Any consensus or disagreements
4. Interesting facts or revelations
5. Overall sentiment

Comments data:
${JSON.stringify(commentsArray, null, 2)}

Format the response with clear sections and bullet points where appropriate. Keep the tone natural and engaging.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const summary = completion.choices[0].message.content;
        return res.status(200).json({ summary });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to generate summary' });
    }
} 