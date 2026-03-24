/**
 * Vercel Serverless Function: POST /api/chat
 *
 * Streams AI responses via OpenRouter. Uses whatever model is configured.
 * Free tier: 50 requests/day on free models.
 *
 * Environment variables:
 *   OPENROUTER_API_KEY – from openrouter.ai
 *   OPENROUTER_MODEL   – optional, defaults to meta-llama/llama-3.1-8b-instruct:free
 */

const MPS_SYSTEM_PROMPT = `You are the MPS Group Automotive front desk assistant. You help customers at a surface facilities manufacturing company that also operates an automotive service shop in Pierceland, Saskatchewan (Highway 55).

ABOUT MPS GROUP:
- Full name: MPS Group
- Location: E Range Rd 3264, Highway 55, Pierceland, SK S0M 2K0
- Phone: (780) 594-8100
- Fax: (780) 638-6029
- Email: info@mpsgroup.ca
- Timezone: America/Edmonton (Mountain Time)
- Mailing: PO Box 1230, Cold Lake, AB T9M 1P3

AUTOMOTIVE SERVICES & PRICING:
- SGI Safety Inspection: $129-$270, 1.5-2.0 hr (93-point SGI checklist — brakes, tires, steering, lights, glass, roadworthiness)
- Oil Change (Conventional): $60-$90, 30-45 min
- Oil Change (Full Synthetic): $90-$120, 30-45 min
- Tire Change / Rotation: $40-$100, 30-60 min
- Brake Inspection: Free, 30-45 min
- General Maintenance: $100-$300, 1.0-2.0 hr (diagnostics, odd noises, seasonal checkups)
- Fleet / Pre-Trip Inspection: $80-$150, 45-60 min

BOOKING:
- Available slots: Monday-Friday at 9:00 AM, 11:30 AM, and 2:30 PM
- Customers can book online through the booking form on the automotive page
- SGI inspections require a mailing address for paperwork
- Large/heavy-duty vehicles take longer for SGI (2 hr vs 1.5 hr)
- Prep: wash vehicle before arrival, remove loose items, have registration ready

VEHICLE MAKES SERVICED:
Chevrolet, Ford, GMC, Honda, Hyundai, Jeep, Nissan, Ram, Toyota (and others by arrangement)

BRANDS CARRIED:
Castrol, Mobil 1, Valvoline, FRAM, Rain-X, BlueDEF, Prestone, Sylvania

RULES:
- Be friendly, concise, and helpful. You represent a small-town Saskatchewan shop — professional but approachable.
- If a customer wants to book, point them to the booking form on the page (scroll down or click "Book now").
- If you don't know something specific, say so and suggest they call (780) 594-8100.
- Never make up pricing or availability beyond what's listed above.
- Keep responses short — 2-4 sentences max unless the customer asks for detail.
- If asked about MPS Group's main business (surface facilities, oilfield), briefly mention it and redirect to mpsgroup.ca for more.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Chat is not configured yet.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json().catch(() => null);
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Only keep last 10 messages to stay within context limits on free models
  const userMessages = (body.messages as ChatMessage[]).slice(-10);
  const model = process.env.OPENROUTER_MODEL || 'stepfun/step-3.5-flash:free';

  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://www.mpsgroup.ca',
      'X-Title': 'MPS Group Automotive Chat',
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: 'system', content: MPS_SYSTEM_PROMPT },
        ...userMessages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!openRouterResponse.ok) {
    const errorText = await openRouterResponse.text().catch(() => 'Unknown error');
    console.error('OpenRouter error:', openRouterResponse.status, errorText);
    return new Response(
      JSON.stringify({ error: 'Chat is temporarily unavailable.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Pass the SSE stream directly to the client
  return new Response(openRouterResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
