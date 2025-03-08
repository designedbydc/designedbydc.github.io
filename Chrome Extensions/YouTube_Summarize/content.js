// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarizeComments') {
        getAndSummarizeComments()
            .then(summary => {
                injectSummaryIntoPage(summary);
                sendResponse({ success: true, summary });
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Required for async response
    }
});

// Function to create or update the summary section
function injectSummaryIntoPage(summaryText) {
    const SUMMARY_ID = 'yt-comment-summary';
    
    // Check if our summary section already exists
    let summarySection = document.getElementById(SUMMARY_ID);
    
    if (!summarySection) {
        // Create the summary section if it doesn't exist
        summarySection = document.createElement('div');
        summarySection.id = SUMMARY_ID;
        summarySection.className = 'style-scope ytd-watch-metadata';
        summarySection.style.cssText = `
            margin: 24px 0;
            font-family: Roboto, Arial, sans-serif;
            width: 100%;
            box-sizing: border-box;
            background: var(--yt-spec-base-background, white);
            border: 1px solid var(--yt-spec-10-percent-layer, #ccc);
            border-radius: 12px;
        `;

        // Create inner container
        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = `
            padding: 16px;
        `;

        // Create header container
        const headerContainer = document.createElement('div');
        headerContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            color: var(--yt-spec-text-primary, #0f0f0f);
        `;

        // Create header with icon
        const headerTitle = document.createElement('div');
        headerTitle.style.cssText = `
            font-size: 16px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        headerTitle.innerHTML = '<svg height="24" viewBox="0 0 24 24" width="24" style="fill: currentColor; width: 20px; height: 20px;"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"></path></svg>Comments Summary';

        // Create refresh button (small icon)
        const refreshButton = document.createElement('button');
        refreshButton.innerHTML = '<svg height="24" viewBox="0 0 24 24" width="24" style="fill: currentColor;"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"></path></svg>';
        refreshButton.style.cssText = `
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            border-radius: 50%;
            color: var(--yt-spec-text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            width: 32px;
            height: 32px;
            min-width: 32px;
        `;
        refreshButton.title = "Refresh summary";
        refreshButton.addEventListener('mouseover', () => {
            refreshButton.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            refreshButton.style.opacity = '1';
        });
        refreshButton.addEventListener('mouseout', () => {
            refreshButton.style.backgroundColor = 'transparent';
            refreshButton.style.opacity = '0.7';
        });
        refreshButton.addEventListener('click', () => {
            getAndSummarizeComments().then(summary => {
                const content = document.getElementById(SUMMARY_ID + '-content');
                if (content) {
                    content.textContent = summary;
                }
            });
        });

        headerContainer.appendChild(headerTitle);
        headerContainer.appendChild(refreshButton);
        innerContainer.appendChild(headerContainer);

        // Create content div with better styling
        const content = document.createElement('div');
        content.id = SUMMARY_ID + '-content';
        content.style.cssText = `
            font-size: 14px;
            line-height: 20px;
            color: var(--yt-spec-text-primary, #0f0f0f);
            white-space: pre-wrap;
            margin-bottom: 16px;
            border-bottom: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.1));
            padding-bottom: 16px;
        `;
        innerContainer.appendChild(content);

        // Create toggle button at the bottom
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Show original comments';
        toggleButton.style.cssText = `
            background: none;
            border: none;
            color: var(--yt-spec-text-primary, #0f0f0f);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0 auto;
        `;
        toggleButton.innerHTML = `
            <span style="color: var(--yt-spec-text-primary, #0f0f0f);">Show original comments</span>
            <svg style="width: 24px; height: 24px; fill: currentColor;" viewBox="0 0 24 24">
                <path d="M12 15.7l-5.6-5.6 1.4-1.4 4.2 4.2 4.2-4.2 1.4 1.4z"></path>
            </svg>
        `;

        let showingOriginalComments = false;
        const originalCommentsSection = document.querySelector('ytd-comments#comments');
        if (originalCommentsSection) {
            originalCommentsSection.style.display = 'none';
        }

        toggleButton.addEventListener('click', () => {
            if (originalCommentsSection) {
                showingOriginalComments = !showingOriginalComments;
                originalCommentsSection.style.display = showingOriginalComments ? 'block' : 'none';
                summarySection.style.display = showingOriginalComments ? 'none' : 'block';
                if (showingOriginalComments) {
                    // Scroll to comments when showing them
                    originalCommentsSection.scrollIntoView({ behavior: 'smooth' });
                }
                toggleButton.innerHTML = showingOriginalComments ? `
                    <span style="color: var(--yt-spec-text-primary, #0f0f0f);">Show summary</span>
                    <svg style="width: 24px; height: 24px; fill: currentColor;" viewBox="0 0 24 24">
                        <path d="M12 8.3l5.6 5.6-1.4 1.4-4.2-4.2-4.2 4.2-1.4-1.4z"></path>
                    </svg>
                ` : `
                    <span style="color: var(--yt-spec-text-primary, #0f0f0f);">Show original comments</span>
                    <svg style="width: 24px; height: 24px; fill: currentColor;" viewBox="0 0 24 24">
                        <path d="M12 15.7l-5.6-5.6 1.4-1.4 4.2 4.2 4.2-4.2 1.4 1.4z"></path>
                    </svg>
                `;
            }
        });

        innerContainer.appendChild(toggleButton);
        summarySection.appendChild(innerContainer);

        // Replace the comments section with our summary
        const commentsSection = document.querySelector('ytd-comments#comments');
        if (commentsSection && commentsSection.parentNode) {
            commentsSection.parentNode.insertBefore(summarySection, commentsSection);
            commentsSection.style.display = 'none';
        }
    }

    // Update the summary content
    const content = document.getElementById(SUMMARY_ID + '-content');
    if (content) {
        content.textContent = summaryText;
    } else {
        console.error('Could not find content element to update summary');
    }
}

function waitForPageLoad() {
    const observer = new MutationObserver((mutations, obs) => {
        const commentsSection = document.querySelector('ytd-comments#comments');
        const metadata = document.querySelector('ytd-watch-metadata');
        
        if (commentsSection && metadata) {
            obs.disconnect();
            setTimeout(() => {
                getAndSummarizeComments()
                    .then(summary => injectSummaryIntoPage(summary))
                    .catch(error => console.error('Error generating summary:', error));
            }, 3000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Auto-summarize when page loads or URL changes
function initializeAutoSummary() {
    let lastUrl = location.href;
    
    // Function to handle URL changes
    const handleUrlChange = () => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            if (location.href.includes('youtube.com/watch')) {
                waitForPageLoad();
            }
        }
    };

    // Check for URL changes
    setInterval(handleUrlChange, 1000);

    // Initial load
    if (location.href.includes('youtube.com/watch')) {
        waitForPageLoad();
    }
}

// Start the auto-summary process
initializeAutoSummary();

async function getAndSummarizeComments() {
    await waitForComments();
    const comments = await extractComments();
    return summarizeComments(comments);
}

function waitForComments() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 10 seconds total
        
        const checkComments = () => {
            const commentElements = document.querySelectorAll('ytd-comment-thread-renderer');
            
            if (commentElements.length >= 5) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Comments failed to load after 10 seconds'));
            } else {
                attempts++;
                setTimeout(checkComments, 200);
            }
        };
        
        // First try to click "Show more replies" if it exists
        const expandButton = document.querySelector('ytd-button-renderer#more-replies');
        if (expandButton) {
            expandButton.click();
        }
        
        checkComments();
    });
}

async function extractComments() {
    const commentElements = document.querySelectorAll('ytd-comment-thread-renderer');
    const comments = [];
    
    // Get top 25 comments
    for (let i = 0; i < Math.min(25, commentElements.length); i++) {
        const commentEl = commentElements[i];
        const textEl = commentEl.querySelector('#content-text');
        const likeCountEl = commentEl.querySelector('#vote-count-middle');
        
        if (textEl) {
            const text = textEl.textContent.trim();
            const likes = parseInt(likeCountEl?.textContent.replace(/[^0-9]/g, '') || '0');
            comments.push({ text, likes });
        }
    }
    
    return comments;
}

async function summarizeComments(comments) {
    if (comments.length === 0) {
        return 'No comments found. Try refreshing the page or scrolling down to load comments.';
    }

    // Sort by likes
    comments.sort((a, b) => b.likes - a.likes);
    
    try {
        // Prepare the comments data for OpenAI
        const commentData = comments.map(comment => ({
            text: comment.text,
            likes: comment.likes
        }));

        const summary = await generateAISummary(commentData);
        return summary;
    } catch (error) {
        console.error('Error with AI summary:', error);
        // Fallback to local summary if AI fails
        return await generateLocalSummary(comments);
    }
}

async function generateAISummary(comments) {
    try {
        console.log('Request payload:', JSON.stringify(comments, null, 2));
        
        // Send message to background script to make the API call
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { 
                    action: 'fetchSummary', 
                    comments: comments 
                },
                response => {
                    if (response.error) {
                        console.error('Error from background script:', response.error);
                        reject(new Error(response.error));
                    } else {
                        console.log('Successfully received summary response');
                        resolve(response.summary);
                    }
                }
            );
        });
    } catch (error) {
        console.error('Detailed error information:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error('Failed to generate AI summary: ' + error.message);
    }
}

// Fallback local summary function
async function generateLocalSummary(comments) {
    let summary = '';
    const topComments = comments.slice(0, 3);
    let mainPoints = new Set();

    // Extract meaningful sentences and points
    comments.forEach(comment => {
        const sentences = comment.text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 20 && s.length < 150);
            
        sentences.forEach(sentence => {
            if (!Array.from(mainPoints).some(point => 
                point.toLowerCase().includes(sentence.toLowerCase()) ||
                sentence.toLowerCase().includes(point.toLowerCase())
            )) {
                mainPoints.add(sentence);
            }
        });
    });

    // Format the summary
    summary += `Based on ${comments.length} top comments:\n\n`;
    
    // Add top comments
    summary += 'Most Impactful Comments:\n';
    topComments.forEach((comment, index) => {
        const text = comment.text.length > 150 ? 
            comment.text.slice(0, 147) + '...' : 
            comment.text;
        summary += `"${text}"\n${comment.likes.toLocaleString()} likes\n\n`;
    });

    // Add key points
    const keyPoints = Array.from(mainPoints)
        .slice(0, 3)
        .map(point => point.charAt(0).toUpperCase() + point.slice(1));

    if (keyPoints.length > 0) {
        summary += 'Key Points from Comments:\n';
        keyPoints.forEach(point => {
            summary += `• ${point}\n`;
        });
    }

    return summary;
} 