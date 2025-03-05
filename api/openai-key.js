// API endpoint to securely provide the OpenAI API key
export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;

  // Check if API key exists
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Return the API key
  return res.status(200).json({ apiKey });
} 