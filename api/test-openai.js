import OpenAI from 'openai';

export default async function handler(req, res) {
  try {
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        success: false,
        error: 'OpenAI API key is not configured',
        suggestion: 'Please add your OpenAI API key to the environment variables.'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const isProjectKey = apiKey.startsWith('sk-proj-');
    
    // Mask the API key for security
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    
    // Initialize the OpenAI SDK - the SDK automatically handles organization ID for project-based keys
    const openaiConfig = {
      apiKey: process.env.OPENAI_API_KEY
    };
    
    // Add organization ID if it exists
    if (process.env.OPENAI_ORG_ID) {
      openaiConfig.organization = process.env.OPENAI_ORG_ID;
    }
    
    const openai = new OpenAI(openaiConfig);
    
    // Test the API key by listing models
    try {
      console.log('Testing OpenAI API with SDK');
      
      const models = await openai.models.list();
      
      return res.status(200).json({
        success: true,
        keyType: isProjectKey ? 'Project key' : 'Standard key',
        maskedKey,
        keyLength: apiKey.length,
        environment: process.env.NODE_ENV || 'unknown',
        method: 'OpenAI SDK',
        modelsCount: models.data.length,
        firstFewModels: models.data.slice(0, 3).map(model => model.id)
      });
    } catch (apiError) {
      console.error('OpenAI API test error:', apiError);
      
      // Check if the error is a JSON parsing error
      const isJsonParseError = apiError.message && (
        apiError.message.includes('Unexpected token') || 
        apiError.message.includes('is not valid JSON')
      );
      
      return res.status(200).json({
        success: false,
        keyType: isProjectKey ? 'Project key' : 'Standard key',
        maskedKey,
        keyLength: apiKey.length,
        environment: process.env.NODE_ENV || 'unknown',
        method: 'OpenAI SDK',
        error: apiError.message || 'Failed to fetch from OpenAI',
        errorType: apiError.type || (isJsonParseError ? 'json_parse_error' : 'unknown_error'),
        errorCode: apiError.code || 'unknown_code',
        suggestion: isJsonParseError 
          ? 'The OpenAI API returned an invalid response. This might be due to temporary server issues. Please try again in a few minutes.'
          : 'Please check your OpenAI API key and billing setup. You may need to create a new API key in the OpenAI dashboard.',
        rawError: apiError.toString()
      });
    }
  } catch (error) {
    console.error('API test route error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
} 