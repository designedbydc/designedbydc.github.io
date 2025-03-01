export default async function handler(req, res) {
  try {
    // Log the API key format (first few and last few characters)
    const apiKey = process.env.OPENAI_API_KEY || 'Not set';
    const keyStart = apiKey.substring(0, 10);
    const keyEnd = apiKey.length > 10 ? apiKey.substring(apiKey.length - 4) : '';
    console.log(`API Key format: ${keyStart}...${keyEnd}`);
    
    // Test the OpenAI API with a simple request
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to fetch from OpenAI',
        details: errorData
      });
    }
    
    const data = await response.json();
    return res.status(200).json({
      message: 'OpenAI API is working correctly',
      models: data.data.slice(0, 5) // Just return the first 5 models to keep the response small
    });
  } catch (error) {
    console.error('Test API route error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
} 