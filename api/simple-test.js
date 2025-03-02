import OpenAI from 'openai';

export default async function handler(req, res) {
  try {
    console.log('Simple OpenAI test handler started');
    
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No API key found in environment variables');
      return res.status(200).json({ 
        success: false,
        error: 'OpenAI API key is not configured'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const isProjectKey = apiKey.startsWith('sk-proj-');
    
    // Mask the API key for security
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`API key detected (${maskedKey}), type: ${isProjectKey ? 'Project key' : 'Standard key'}`);
    
    // Just initialize the OpenAI SDK without making any API calls
    try {
      console.log('Attempting to initialize OpenAI SDK');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      console.log('Successfully initialized OpenAI SDK');
      
      // Return success without making any API calls
      return res.status(200).json({
        success: true,
        message: 'OpenAI SDK initialized successfully',
        keyType: isProjectKey ? 'Project key' : 'Standard key',
        maskedKey,
        sdkVersion: OpenAI.VERSION || 'unknown'
      });
    } catch (sdkError) {
      console.error('OpenAI SDK initialization error:', sdkError);
      
      return res.status(200).json({
        success: false,
        error: 'Failed to initialize OpenAI SDK',
        errorMessage: sdkError.message,
        errorName: sdkError.name
      });
    }
  } catch (error) {
    console.error('Simple test route error:', error);
    
    return res.status(200).json({ 
      success: false,
      error: 'Internal error',
      errorMessage: error.message,
      errorName: error.name
    });
  }
} 