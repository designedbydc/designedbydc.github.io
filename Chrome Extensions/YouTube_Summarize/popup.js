document.addEventListener('DOMContentLoaded', function() {
    // Summarize button click handler
    document.getElementById('summarize').addEventListener('click', function() {
        const statusElement = document.getElementById('status');
        statusElement.textContent = 'Generating summary...';
        statusElement.className = 'status';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0].url.includes('youtube.com/watch')) {
                statusElement.textContent = 'Please open a YouTube video to summarize comments';
                statusElement.className = 'status error';
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, {action: 'summarizeComments'}, function(response) {
                if (chrome.runtime.lastError) {
                    statusElement.textContent = 'Error: Could not connect to the page';
                    statusElement.className = 'status error';
                    return;
                }

                if (response.success) {
                    statusElement.textContent = 'Summary generated successfully!';
                    statusElement.className = 'status success';
                    setTimeout(() => {
                        statusElement.textContent = '';
                    }, 3000);
                } else {
                    statusElement.textContent = 'Error: ' + (response.error || 'Failed to generate summary');
                    statusElement.className = 'status error';
                }
            });
        });
    });
}); 