import OpenAI from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: 'OpenAI API key is not configured',
        suggestion: 'Please add your OpenAI API key to the environment variables.'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const isProjectKey = apiKey.startsWith('sk-proj-');
    
    // Log configuration details for debugging
    console.log('API request configuration:', 
      JSON.stringify({
        keyType: isProjectKey ? 'Project key' : 'Standard key',
        keyLength: apiKey.length,
        endpoint: 'OpenAI SDK'
      })
    );
    
    // Initialize the OpenAI SDK with API key only
    // The SDK automatically handles organization ID for project-based keys
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Call OpenAI API using the SDK
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      });
      
      return res.status(200).json({
        choices: [
          {
            message: {
              content: completion.choices[0].message.content
            }
          }
        ]
      });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      
      // Provide detailed error information
      return res.status(400).json({ 
        error: apiError.message || 'Failed to fetch from OpenAI',
        errorType: apiError.type || 'unknown_error',
        errorCode: apiError.code || 'unknown_code',
        suggestion: 'Please check your OpenAI API key and billing setup. You may need to create a new API key in the OpenAI dashboard.'
      });
    }
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
} 