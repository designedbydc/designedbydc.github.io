# YouTube Comments Summarizer

A Chrome extension that uses AI to summarize the top comments on YouTube videos, saving you time while still getting the key insights from the community.

![YouTube Comments Summarizer](icon128.png)

## Features

- 🤖 AI-powered summaries of YouTube comments
- 🏆 Focuses on the most liked comments for relevance
- 🔄 Works on any YouTube video page
- 📊 Provides structured summaries highlighting key points
- 🔌 Works offline with a local fallback summarizer if the API is unavailable

## Installation

### From Source (Developer Mode)

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the `YouTube_Summarize` folder
5. The extension is now installed and ready to use

## Usage

1. Navigate to any YouTube video with comments
2. Click the extension icon in your browser toolbar
3. Click the "Summarize Comments" button
4. Wait a few seconds for the AI to analyze the comments
5. Read the summary that appears above the comments section

## Current Status

**⚠️ IMPORTANT: The extension is currently in development mode.**

Current limitations:
- The backend API is experiencing CORS issues with Vercel deployment
- When API calls fail, the extension will fall back to a local summary generator
- The local summary is not as sophisticated as the AI-powered one but still provides value
- We're actively working on resolving the API issues

## How It Works

The extension:
1. Extracts the top 25 comments (by likes) from the YouTube page
2. Sends these comments to an OpenAI-powered API for analysis
3. Displays a comprehensive summary highlighting key points, opinions, and trends
4. If the API is unavailable, falls back to a local summary generator

## Architecture

- **content.js**: Handles YouTube page interaction and UI updates
- **background.js**: Makes API requests without CORS restrictions
- **popup.html/js**: Provides the extension popup interface
- **Backend API**: NodeJS service using OpenAI to generate summaries

## Privacy

This extension:
- Only processes comments on the YouTube page you're currently viewing
- Only sends data when you explicitly click to generate a summary
- Does not track your browsing history or other activities
- Does not store any user data

## Future Improvements

- Improve the local fallback summary algorithm
- Add customization options for summary length and style
- Add support for summarizing comments on specific sections of a video
- Implement automatic summarization for videos above a certain view count
- Add support for more languages

## Feedback and Contributions

Feedback and contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License 