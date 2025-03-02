export default async function handler(req, res) {
  try {
    console.log('Key check handler started');
    
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No API key found in environment variables');
      return res.status(200).json({ 
        success: false,
        error: 'OpenAI API key is not configured'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    // Get key details without exposing the full key
    const keyDetails = {
      length: apiKey.length,
      prefix: apiKey.substring(0, 10),
      suffix: apiKey.substring(apiKey.length - 4),
      containsQuotes: apiKey.includes('"') || apiKey.includes("'"),
      containsSpaces: apiKey.includes(' '),
      containsNewlines: apiKey.includes('\n') || apiKey.includes('\r'),
      isProjectKey: apiKey.startsWith('sk-proj-')
    };
    
    console.log('API key details:', JSON.stringify(keyDetails));
    
    return res.status(200).json({
      success: true,
      message: 'API key format check',
      keyDetails
    });
  } catch (error) {
    console.error('Key check error:', error);
    
    return res.status(200).json({ 
      success: false,
      error: 'Internal error',
      errorMessage: error.message
    });
  }
} 