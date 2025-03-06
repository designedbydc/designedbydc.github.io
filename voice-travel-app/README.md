# Paytm Travel AI 🤖

A voice-powered travel search application for flights and hotels.

## Features

- Voice recognition for travel search
- Search for flights and hotels
- Clean, modern UI with Paytm branding

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy
vercel
```

### Option 2: Deploy via Vercel Web Interface

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

## Environment Variables

If you need to use environment variables (like API keys), create a `.env` file in the root directory:

```
VITE_OPENAI_API_KEY=your_api_key_here
```

Make sure to add these environment variables in your Vercel project settings as well.

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `services/` - API services
  - `types/` - TypeScript types
  - `utils/` - Utility functions
  - `hooks/` - Custom React hooks
  - `assets/` - Static assets

## License

© 2024 Paytm. All rights reserved.
