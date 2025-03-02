export default async function handler(req, res) {
  try {
    console.log('Compare key handler started');
    
    // Check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No API key found in environment variables');
      return res.status(200).json({ 
        success: false,
        error: 'OpenAI API key is not configured'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    // Expected key details from the working curl command
    const expectedPrefix = 'sk-proj-6G';
    const expectedSuffix = 'OsA';
    
    // Get key details without exposing the full key
    const keyDetails = {
      length: apiKey.length,
      prefix: apiKey.substring(0, 10),
      suffix: apiKey.substring(apiKey.length - 4),
      matchesExpectedPrefix: apiKey.startsWith(expectedPrefix),
      matchesExpectedSuffix: apiKey.endsWith(expectedSuffix),
      containsQuotes: apiKey.includes('"') || apiKey.includes("'"),
      containsSpaces: apiKey.includes(' '),
      containsNewlines: apiKey.includes('\n') || apiKey.includes('\r')
    };
    
    console.log('API key comparison:', JSON.stringify(keyDetails));
    
    return res.status(200).json({
      success: true,
      message: 'API key comparison',
      keyDetails,
      suggestion: !keyDetails.matchesExpectedPrefix || !keyDetails.matchesExpectedSuffix 
        ? 'The API key in Vercel does not match the one that worked in your curl command. Please update it again.'
        : 'The API key matches the expected format. The issue might be with how it\'s being used.'
    });
  } catch (error) {
    console.error('Key comparison error:', error);
    
    return res.status(200).json({ 
      success: false,
      error: 'Internal error',
      errorMessage: error.message
    });
  }
} 