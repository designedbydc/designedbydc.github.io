# Vercel Setup Instructions

## Setting up Environment Variables

To securely use the OpenAI API with this project on Vercel, follow these steps:

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add a new environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your actual OpenAI API key
   - Environment: Production (and optionally Preview and Development)
6. Click "Save"

## How It Works

This project uses Vercel's API routes (serverless functions) to securely call the OpenAI API. The API key is stored as an environment variable on Vercel's servers and is never exposed to the client.

The client-side JavaScript makes requests to our own API endpoint (`/api/openai`), which then uses the environment variable to authenticate with OpenAI.

## Local Development

For local development, you can use Vercel CLI:

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`

This will create a `.env` file with your environment variables for local development.

## Troubleshooting

If you encounter issues with the API:

1. Check that your environment variable is correctly set in Vercel
2. Verify that your OpenAI API key is valid and has sufficient credits
3. Check the Vercel logs for any error messages

For more help, refer to [Vercel's documentation on environment variables](https://vercel.com/docs/concepts/projects/environment-variables). 