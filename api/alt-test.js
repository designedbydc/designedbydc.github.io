export default async function handler(req, res) {
  try {
    console.log('Alternative OpenAI test handler started');
    
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
    
    // Try a simple completion request instead of listing models
    try {
      console.log('Making direct fetch request to OpenAI completions API');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Say hello'
            }
          ],
          max_tokens: 10
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
        console.error(`Error details: ${errorText}`);
        
        return res.status(200).json({
          success: false,
          error: 'Failed to fetch from OpenAI API',
          statusCode: response.status,
          statusText: response.statusText,
          errorDetails: errorText.substring(0, 500) // Limit error text length
        });
      }
      
      const data = await response.json();
      console.log('Successfully received completion from OpenAI API');
      
      return res.status(200).json({
        success: true,
        message: 'Successfully received completion from OpenAI API',
        keyType: isProjectKey ? 'Project key' : 'Standard key',
        maskedKey,
        response: data
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      return res.status(200).json({
        success: false,
        error: 'Failed to fetch from OpenAI API',
        errorMessage: fetchError.message,
        errorName: fetchError.name
      });
    }
  } catch (error) {
    console.error('Alternative test route error:', error);
    
    return res.status(200).json({ 
      success: false,
      error: 'Internal error',
      errorMessage: error.message,
      errorName: error.name
    });
  }
} 