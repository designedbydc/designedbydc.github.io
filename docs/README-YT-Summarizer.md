# YouTube Comments Summarizer Project

This repository contains both the Chrome extension and backend API for summarizing YouTube comments using AI.

## Project Structure

- [`YouTube_Summarize/`](./Chrome%20Extensions/YouTube_Summarize/) - Chrome extension code
- [`YouTube_Summarize_Backend/`](./Chrome%20Extensions/YouTube_Summarize_Backend/) - Backend API service

## Current State

The project is currently in development with the following status:

1. **Chrome Extension**: Functional with local fallback capability
   - Uses a background script to bypass CORS restrictions
   - Falls back to local summarization if the API is unavailable

2. **Backend API**: Deployed but experiencing CORS issues
   - API works when tested directly with tools like curl or Postman
   - Currently blocked by CORS when called from the YouTube domain
   - Workarounds implemented in the extension

## Getting Started

See the README files in each directory for specific setup instructions:

- [Extension README](./Chrome%20Extensions/YouTube_Summarize/README.md)
- [API README](./Chrome%20Extensions/YouTube_Summarize_Backend/README.md)

## Architecture 

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  YouTube Page   │◄────┤ Chrome Extension│◄────┤ Backend API     │
│  (content.js)   │     │ (background.js) │     │ (Vercel)        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Future Development

See the individual README files for planned features and improvements.

## License

MIT License 