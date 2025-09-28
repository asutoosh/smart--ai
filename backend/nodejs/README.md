# Smart AI Keyboard Backend

Backend proxy server for Smart AI Keyboard app using OpenRouter.

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `MODEL` - AI model to use (default: openai/gpt-4o-mini)
- `PORT` - Server port (default: 3000)

## Endpoints

- `GET /health` - Health check
- `POST /enhance` - Enhance text with AI
