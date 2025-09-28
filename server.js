const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = process.env.MODEL || 'openai/gpt-4o-mini';

// Configure axios for OpenRouter
const openrouterClient = axios.create({
    baseURL: OPENROUTER_BASE_URL,
    headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'https://smart-ai-keyboard.railway.app',
        'X-Title': process.env.YOUR_APP_NAME || 'Smart AI Keyboard',
        'Content-Type': 'application/json'
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per minute
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/enhance', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        provider: 'OpenRouter',
        model: MODEL,
        hasApiKey: !!OPENROUTER_API_KEY
    });
});

// Main enhancement endpoint
app.post('/enhance', async (req, res) => {
    try {
        const { prompt, max_tokens = 200, temperature = 0.3 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        // Call OpenRouter API
        const response = await openrouterClient.post('/chat/completions', {
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful writing assistant. Improve and rewrite text while maintaining the original meaning and language. Be concise and natural.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: max_tokens,
            temperature: temperature,
        });

        const enhancedText = response.data.choices[0].message.content.trim();
        
        res.json({ text: enhancedText });
    } catch (error) {
        console.error('Error processing request:', error);
        
        if (error.response?.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        }
        
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Quick action endpoint
app.post('/quick-action', async (req, res) => {
    try {
        const { text, action } = req.body;

        if (!text || !action) {
            return res.status(400).json({ error: 'Text and action are required' });
        }

        const actionPrompts = {
            "shorten": `Make this text shorter and more concise: "${text}"`,
            "expand": `Expand this text with more detail: "${text}"`,
            "formal": `Make this text more formal and professional: "${text}"`,
            "casual": `Make this text more casual and friendly: "${text}"`,
            "emojify": `Add relevant emojis to this text: "${text}"`,
            "fix_grammar": `Fix any grammar and spelling errors in this text: "${text}"`,
            "translate": `Translate this text to English: "${text}"`
        };
        
        if (!(action in actionPrompts)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        const userPrompt = actionPrompts[action];
        
        const response = await openrouterClient.post('/chat/completions', {
            model: MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful writing assistant.' },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 200,
            temperature: 0.3,
        });

        const result = response.data.choices[0].message.content.trim();
        res.json({ text: result });
        
    } catch (error) {
        console.error('Error processing quick action:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Smart AI Proxy Server running on port ${PORT}`);
    console.log(`Provider: OpenRouter`);
    console.log(`Model: ${MODEL}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
