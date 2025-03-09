// Initialize environment variables object
window.__ENV = window.__ENV || {};

// Check for production environment on Vercel or Netlify
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Function to load environment variables
async function loadEnvironmentVariables() {
    // For local development, try to fetch from .env file
    if (!isProduction) {
        try {
            const response = await fetch('.env');
            if (!response.ok) {
                console.warn('Could not load .env file');
                return;
            }
            
            const text = await response.text();
            const lines = text.split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').trim();
                    if (key && value) {
                        window.__ENV[key] = value;
                    }
                }
            });
        } catch (error) {
            console.warn('Error loading environment variables:', error);
        }
    }
}

// Log environment info without exposing sensitive data
console.log('Environment:', isProduction ? 'Production' : 'Development');

// Load environment variables when the script loads
loadEnvironmentVariables(); 