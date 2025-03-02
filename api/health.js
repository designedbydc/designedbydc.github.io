export default async function handler(req, res) {
  try {
    console.log('Health check endpoint called');
    
    // Get environment information
    const environment = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasOrgID: !!process.env.OPENAI_ORG_ID
    };
    
    // Return success response
    return res.status(200).json({
      status: 'ok',
      message: 'Health check passed',
      environment
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
} 