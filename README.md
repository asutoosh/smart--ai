# Smart AI Keyboard Backend

Backend proxy server for Smart AI Keyboard app using OpenRouter.

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `MODEL` - AI model to use (default: openai/gpt-4o-mini)
- `PORT` - Server port (Railway sets this automatically)

## Endpoints

- `GET /health` - Health check
- `POST /enhance` - Enhance text with AI
- `POST /quick-action` - Quick text transformations

## Deployment

This is configured for Railway deployment with automatic detection.
