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
      
      // Mask the API key for security
      const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
      console.log(`API key detected (${maskedKey})`);
      
      // Initialize the OpenAI SDK with minimal configuration
      console.log('Initializing OpenAI SDK with minimal configuration');
      const openai = new OpenAI({
        apiKey: apiKey
      });
      
      // Call OpenAI API using the SDK
      try {
        console.log('Sending request to OpenAI API');
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a quiz question generator. Always respond with valid JSON in the exact format specified by the user.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        
        console.log('Received response from OpenAI API');
        
        // Log the raw response for debugging
        console.log('Raw response content:', completion.choices[0].message.content);
        
        // Validate JSON format before sending
        try {
            const parsedContent = JSON.parse(completion.choices[0].message.content);
            
            // Validate required fields
            if (!parsedContent.question || !Array.isArray(parsedContent.options) || 
                parsedContent.options.length !== 4 || typeof parsedContent.correctAnswer !== 'number' ||
                !parsedContent.explanation) {
                throw new Error('Response missing required fields');
            }
            
            return res.status(200).json({
                choices: [
                    {
                        message: {
                            content: completion.choices[0].message.content
                        }
                    }
                ]
            });
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
            console.error('Invalid response content:', completion.choices[0].message.content);
            
            return res.status(400).json({
                error: 'Invalid response format from OpenAI',
                details: parseError.message,
                suggestion: 'The API response was not in the correct JSON format. Please try again.'
            });
        }
      } catch (apiError) {
        console.error('OpenAI API error:', apiError);
        
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
          errorType: apiError.type || 'unknown_error',
          errorCode: apiError.code || 'unknown_code',
          suggestion: 'Please check your OpenAI API key and billing setup.',
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