import Anthropic from '@anthropic-ai/sdk';

const BASE_SYSTEM_PROMPT = `You are a professional English–Hebrew translator. Translate the user's text \
accurately and naturally, preserving meaning, tone, and register — never \
word-for-word. If no direction is given, detect the source language. Render \
idioms as the natural equivalent, not a literal gloss. Preserve line breaks, \
names, and numbers. Output ONLY the translation — no preamble, no explanation, \
no surrounding quotation marks.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { text, direction, register, nikud, password } = req.body ?? {};

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text must be 2,000 characters or fewer.' });
  }

  let systemPrompt = BASE_SYSTEM_PROMPT;

  if (direction === 'en2he') {
    systemPrompt += '\nTranslate FROM English TO Hebrew.';
  } else if (direction === 'he2en') {
    systemPrompt += '\nTranslate FROM Hebrew TO English.';
  }

  if (register === 'formal') {
    systemPrompt += '\nUse formal register and vocabulary.';
  } else if (register === 'casual') {
    systemPrompt += '\nUse casual, conversational register.';
  }

  if (nikud === true) {
    systemPrompt += '\nAdd Hebrew vowel pointing (nikud) to all Hebrew text in your output.';
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    });

    const translation = message.content[0]?.text ?? '';
    return res.status(200).json({ translation });
  } catch (err) {
    console.error('Anthropic API error:', err);

    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }
    if (err.status === 401) {
      return res.status(500).json({ error: 'Server configuration error (invalid API key).' });
    }

    return res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
}
