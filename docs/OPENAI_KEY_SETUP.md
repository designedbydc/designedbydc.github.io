# Setting Up Your OpenAI API Key

OpenAI now requires project-based API keys for all new applications. This guide will walk you through the process of setting up a project-based API key for use with this application.

## Creating a Project-Based API Key

1. Go to the [OpenAI Platform](https://platform.openai.com/account/api-keys) and sign in to your account.
2. Navigate to the API section.
3. Click on "Create new project" and give it a name related to your application.
4. Once your project is created, click on "Create new secret key".
5. Give your key a name that helps you identify its purpose.
6. Copy the key immediately - you won't be able to see it again!

Your project-based API key will look like: `sk-proj-xxxxxxxxxxxx...`

## Adding Your API Key to Vercel

1. In your Vercel project dashboard, go to "Settings" > "Environment Variables".
2. Add a new environment variable with the name `OPENAI_API_KEY` and paste your API key as the value.
3. Make sure to add this environment variable to all environments (Production, Preview, and Development).
4. Click "Save" to apply the changes.

## Project-Based API Keys

Good news! The latest version of the OpenAI SDK automatically handles project-based API keys correctly. You don't need to set up a separate organization ID - the SDK extracts this information from your project-based key.

## Troubleshooting Project API Keys

If you encounter issues with your project-based API key, try these steps:

1. **Create a new API key**: Sometimes, creating a fresh API key can resolve authentication issues.

2. **Check API permissions**: In your OpenAI project settings, verify that the API key has the necessary permissions for the models you're trying to use.

3. **Verify billing setup**: Ensure your OpenAI account has a valid payment method and sufficient credits.

4. **Check rate limits**: Project-based keys have specific rate limits that might differ from standard keys.

5. **Test with the diagnostic endpoint**: Use the `/api/test-openai` endpoint to get detailed diagnostic information about your API key configuration.

## Security and Usage Considerations

- **Never expose your API key**: Keep your API key secure and never include it directly in your code or commit it to version control.
- **Monitor usage**: Keep an eye on your OpenAI usage to avoid unexpected charges.
- **Set usage limits**: Consider setting usage limits in your OpenAI dashboard to prevent runaway costs.

If you continue to experience issues, please refer to the [OpenAI API documentation](https://platform.openai.com/docs/api-reference) or contact OpenAI support.