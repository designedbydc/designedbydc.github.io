// Background script for YouTube Comment Summarizer

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchSummary') {
    fetchSummaryFromAPI(request.comments)
      .then(summary => {
        sendResponse({ summary });
      })
      .catch(error => {
        console.error('Error in background script:', error);
        sendResponse({ error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Function to fetch summary from API
async function fetchSummaryFromAPI(comments) {
  try {
    console.log('Background script making API request');
    
    // Try the new Vercel deployment first
    const apiUrl = 'https://youtube-e9nzwtc1d-designedbydcs-projects.vercel.app/api/summarize';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comments)
    });
    
    if (!response.ok) {
      // If the API call fails, use a fallback local summary
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('API request error:', error);
    
    // Generate a simple fallback summary
    return generateFallbackSummary(comments);
  }
}

// Fallback summary generator
function generateFallbackSummary(comments) {
  // Sort by likes
  comments.sort((a, b) => b.likes - a.likes);
  
  // Get top 5 comments
  const topComments = comments.slice(0, 5);
  
  // Create a simple summary
  let summary = "## Top Comments Summary\n\n";
  
  topComments.forEach((comment, index) => {
    summary += `**Comment ${index + 1}** (${comment.likes} likes): ${comment.text.substring(0, 100)}${comment.text.length > 100 ? '...' : ''}\n\n`;
  });
  
  summary += "\n*Note: This is a fallback summary generated locally as the API is currently unavailable.*";
  
  return summary;
}
