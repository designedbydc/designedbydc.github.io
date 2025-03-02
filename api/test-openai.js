import OpenAI from 'openai';

export default async function handler(req, res) {
  try {
    console.log('Starting test-openai handler');
    
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No API key found in environment variables');
      return res.status(400).json({ 
        success: false,
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
    
    // Test the API key by listing models
    try {
      console.log('Testing OpenAI API with SDK - attempting to list models');
      
      const models = await openai.models.list();
      console.log(`Successfully retrieved ${models.data.length} models`);
      
      return res.status(200).json({
        success: true,
        maskedKey,
        environment: process.env.NODE_ENV || 'unknown',
        method: 'OpenAI SDK',
        modelsCount: models.data.length,
        firstFewModels: models.data.slice(0, 3).map(model => model.id)
      });
    } catch (apiError) {
      console.error('OpenAI API test error:', apiError);
      
      // Create a safe error object that won't cause JSON.stringify to fail
      const safeError = {
        message: apiError.message || 'Unknown error',
        name: apiError.name || 'Error',
        stack: apiError.stack ? apiError.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace',
        code: apiError.code || 'unknown_code',
        type: apiError.type || 'unknown_type'
      };
      
      console.log('Returning error response:', JSON.stringify(safeError));
      
      return res.status(200).json({
        success: false,
        maskedKey,
        environment: process.env.NODE_ENV || 'unknown',
        method: 'OpenAI SDK',
        error: apiError.message || 'Failed to fetch from OpenAI',
        errorType: apiError.type || 'unknown_error',
        errorCode: apiError.code || 'unknown_code',
        suggestion: 'Please check your OpenAI API key and billing setup.',
        errorDetails: safeError
      });
    }
  } catch (error) {
    console.error('API test route error:', error);
    
    // Create a safe error object
    const safeError = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
    };
    
    console.log('Returning 500 error response:', JSON.stringify(safeError));
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message,
      errorInfo: safeError
    });
  }
} 