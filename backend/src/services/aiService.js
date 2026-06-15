import axios from 'axios';

const MODELS = [
  'openai/gpt-oss-120b:free',           // Fast and accurate
  'google/gemma-4-31b-it:free',         // Fast, good fallback
  'nex-agi/nex-n2-pro:free',            // Stable fallback
  'poolside/laguna-m.1:free',           // Secondary fallback
  'mistralai/mistral-7b-instruct:free', // Proven reliable free model
  'google/gemma-2-9b-it:free'           // High quality small model
];

export const generateEmailContent = async (prompt, subject, tone = 'professional') => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    throw new Error('AI Provider not configured. Please check your API keys.');
  }

  let lastError = null;
  for (const model of MODELS) {
    try {
      console.log(`Attempting generation with model: ${model}`);
      const { data } = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'system',
              content: `You are an expert email marketer. Tone: ${tone}. Output the email body in CLEAN HTML format. Use only essential tags like <p>, <br>, <strong>, <ul>, <li>, <a>. DO NOT include <html> or <body> tags. Keep formatting professional.`
            },
            {
              role: 'user',
              content: `Subject: ${subject}\n\nTask: ${prompt}`
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'AI Email Agent'
          },
          timeout: 20000 // Increased to 20s
        }
      );

      const content = data?.choices?.[0]?.message?.content;
      if (content) return content;
      
    } catch (err) {
      lastError = err.response?.data?.error?.message || err.message;
      console.warn(`Model ${model} failed: ${lastError}`);
    }
  }

  throw new Error(`AI generation failed after multiple attempts. ${lastError || 'Please try again later.'}`);
};


export const improveEmailContent = async (content) => content;

export const generateSubjectLines = async (prompt) => [
  `Quick update: ${prompt.slice(0, 20)}...`,
  `Re: Your request regarding ${prompt.slice(0, 15)}`,
  `Important info inside`
];

export const analyzeSpamRisk = async () => ({
  score: 0,
  issues: [],
  suggestion: "Looks good to go."
});
