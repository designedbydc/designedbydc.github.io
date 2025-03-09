// Initialize environment variables object
window.__ENV = window.__ENV || {};

// Function to load environment variables
async function loadEnvironmentVariables() {
    // Check if we're running on Vercel
    if (window.ENV) {
        // Use Vercel's runtime config
        window.__ENV = { ...window.__ENV, ...window.ENV };
        return;
    }

    // Local development: try to fetch from .env file
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

// Load environment variables when the script loads
loadEnvironmentVariables(); 