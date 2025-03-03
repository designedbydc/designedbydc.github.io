import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required in the request body.' });
  }

  // Check if OpenAI API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key is not configured');
    return res.status(400).json({ 
      error: 'OpenAI API key is not configured. Please add your API key to the environment variables.',
      details: 'Add OPENAI_API_KEY to your environment variables or .env file.'
    });
  }

  // Mask API key for security in logs
  const maskedKey = apiKey.substring(0, 3) + '...' + apiKey.substring(apiKey.length - 3);
  console.log(`Using OpenAI API key: ${maskedKey}`);

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Add a system message to ensure we get valid JSON
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that responds with valid JSON only. Your response must be a properly formatted JSON object with the following structure: {\"question\": \"...\", \"options\": [\"...\", \"...\", \"...\", \"...\"], \"correctAnswer\": 0, \"explanation\": \"...\"}. The correctAnswer field must be a number (0-3) representing the index of the correct option."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    console.log('Sending request to OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }, // Enforce JSON response format
    });

    console.log('Received response from OpenAI API');
    
    // Validate the response format before sending it back
    try {
      const content = response.choices[0].message.content;
      console.log('Raw response content:', content);
      
      // Try to parse the JSON to validate it
      const parsedContent = JSON.parse(content);
      
      // Validate the structure of the parsed content
      if (!parsedContent.question || 
          !Array.isArray(parsedContent.options) || 
          parsedContent.options.length !== 4 ||
          typeof parsedContent.correctAnswer !== 'number' ||
          !parsedContent.explanation) {
        
        console.error('Invalid question format received from API:', parsedContent);
        return res.status(400).json({ 
          error: 'The API response did not contain a properly formatted question.',
          details: 'The response is missing required fields or has incorrect data types.'
        });
      }
      
      // If we got here, the response is valid
      return res.status(200).json(response);
      
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      console.error('Raw content that failed to parse:', response.choices[0].message.content);
      
      return res.status(400).json({ 
        error: 'Failed to parse question data. The response was not in the expected format.',
        details: 'The API returned content that could not be parsed as valid JSON.'
      });
    }
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Provide a helpful error message based on the error type
    let errorMessage = 'An error occurred while generating the question.';
    let errorDetails = '';
    
    if (error.response) {
      // OpenAI API error
      errorMessage = `OpenAI API Error: ${error.response.status} - ${error.response.data.error.message}`;
      errorDetails = 'This may be due to rate limiting, invalid API key, or other API issues.';
      
      if (error.response.status === 401) {
        errorDetails = 'Your API key may be invalid or expired. Please check your OpenAI API key.';
      } else if (error.response.status === 429) {
        errorDetails = 'You have exceeded your API rate limit or your account may need payment information.';
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Network Error: Could not connect to the OpenAI API.';
      errorDetails = 'Please check your internet connection and try again.';
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: errorDetails
    });
  }
} 