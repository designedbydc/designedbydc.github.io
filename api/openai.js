import OpenAI from 'openai';

export default async function handler(req, res) {
  try {
    console.log('Starting openai handler');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Rejecting non-POST request');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        console.log('No prompt provided in request body');
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Check if we have an API key
      if (!process.env.OPENAI_API_KEY) {
        console.log('No API key found in environment variables');
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
          endpoint: 'OpenAI SDK',
          promptLength: prompt.length
        })
      );
      
      // Initialize the OpenAI SDK with API key only
      // The SDK automatically handles organization ID for project-based keys
      const openaiConfig = {
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: false
      };
      
      // Add organization ID if it exists
      if (process.env.OPENAI_ORG_ID) {
        console.log('Organization ID found, adding to config');
        openaiConfig.organization = process.env.OPENAI_ORG_ID;
      }
      
      console.log('Initializing OpenAI SDK');
      const openai = new OpenAI(openaiConfig);
      
      // Call OpenAI API using the SDK
      try {
        // Set a timeout for the API call
        const timeoutMs = 30000; // 30 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        console.log('Sending request to OpenAI API');
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        }, {
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        console.log('Received successful response from OpenAI API');
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
        
        // Check if the error is a JSON parsing error
        const isJsonParseError = apiError.message && (
          apiError.message.includes('Unexpected token') || 
          apiError.message.includes('is not valid JSON')
        );
        
        // Create a safe error object that won't cause JSON.stringify to fail
        const safeError = {
          message: apiError.message || 'Unknown error',
          name: apiError.name || 'Error',
          stack: apiError.stack ? apiError.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace',
          code: apiError.code || 'unknown_code',
          type: apiError.type || 'unknown_type'
        };
        
        console.log('Returning API error response:', JSON.stringify(safeError));
        
        // Provide detailed error information
        return res.status(400).json({ 
          error: apiError.message || 'Failed to fetch from OpenAI',
          errorType: apiError.type || (isJsonParseError ? 'json_parse_error' : 'unknown_error'),
          errorCode: apiError.code || 'unknown_code',
          suggestion: isJsonParseError 
            ? 'The OpenAI API returned an invalid response. This might be due to temporary server issues. Please try again in a few minutes.'
            : 'Please check your OpenAI API key and billing setup. You may need to create a new API key in the OpenAI dashboard.',
          errorDetails: safeError
        });
      }
    } catch (innerError) {
      console.error('Inner handler error:', innerError);
      
      // Create a safe error object
      const safeError = {
        message: innerError.message || 'Unknown error',
        name: innerError.name || 'Error',
        stack: innerError.stack ? innerError.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
      };
      
      console.log('Returning inner error response:', JSON.stringify(safeError));
      
      return res.status(500).json({ 
        error: 'Error processing request',
        details: innerError.message,
        errorInfo: safeError
      });
    }
  } catch (error) {
    console.error('API route error:', error);
    
    // Create a safe error object
    const safeError = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
    };
    
    console.log('Returning 500 error response:', JSON.stringify(safeError));
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      errorInfo: safeError
    });
  }
} 