import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are MeowMood AI — a friendly, knowledgeable AI pet health advisor built into the MeowMood cat wellness app. You specialize in cat health, behavior, and wellbeing.

You are advising on a cat named Erbao. The owner will provide you with Erbao's current health metrics from a wearable sensor (heart rate, body temperature, activity score, steps, etc).

Your responsibilities:
1. **Health Insights**: Analyze Erbao's metrics and explain what they mean in plain language. Flag anything concerning.
2. **Behavioral Advice**: Help interpret cat behavior based on the data (e.g., "low activity + high heart rate might indicate stress").
3. **AI Vet Guidance**: Answer general cat health questions — diet, symptoms, common illnesses, when to see a real vet. Always recommend seeing a real veterinarian for serious concerns.
4. **Wellness Tips**: Suggest enrichment activities, diet adjustments, and routines based on the data.

Guidelines:
- Be warm and conversational — this is a pet owner who loves their cat.
- Use the health data when relevant to personalize your advice.
- Be honest about limitations — you're an AI assistant, not a replacement for a real veterinarian.
- For anything that sounds urgent (difficulty breathing, sudden lethargy, not eating for 24h+, etc.), always recommend an immediate vet visit.
- Keep responses concise but helpful — 2-4 paragraphs max unless the user asks for detail.
- Use cat-appropriate reference ranges: normal HR 120-140 bpm, temp 100.5-102.5°F.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { messages, petContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Prepend pet health context to the conversation
  const contextMessage = petContext
    ? `[Current health data for Erbao]\nHeart Rate: ${petContext.heartRate} bpm\nBody Temperature: ${petContext.temperature}°F\nActivity Score: ${petContext.activityScore}/100\nSteps Today: ${petContext.steps}\nStatus: ${petContext.sleepStage || 'unknown'}\n\n`
    : '';

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((msg: { role: string; content: string }, i: number) => ({
        role: msg.role as 'user' | 'assistant',
        content: i === 0 && contextMessage
          ? contextMessage + msg.content
          : msg.content,
      })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Anthropic API error:', err);
    return res.status(502).json({ error: 'AI service error' });
  }
}
