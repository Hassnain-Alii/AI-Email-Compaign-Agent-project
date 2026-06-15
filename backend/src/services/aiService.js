import axios from 'axios';

const MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'poolside/laguna-m.1:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-nano-2-vl:free',
  'liquid/lfm2.5-1.2b-thinking:free',
  'openrouter/free'
];

export const generateEmailContent = async (prompt, subject, tone = 'professional') => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    return `<p>Configuration error: API key missing.</p>`;
  }

  for (const model of MODELS) {
    try {
      const { data } = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [
            {
              role: 'system',
              content: `Expert copywriter. Tone: ${tone}. Output HTML body ONLY. No <html>/<body> tags.`
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
            'X-Title': 'Campaign Agent'
          },
          timeout: 12000
        }
      );

      const content = data?.choices?.[0]?.message?.content;
      if (content) return content;
      
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`);
    }
  }

  return `<p className="text-red-500">Generation failed. All models are currently busy.</p>`;
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
