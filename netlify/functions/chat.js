// ============================================
//   NETLIFY FUNCTION: chat.js
//   This is the secure server that sits between
//   your frontend and the Claude API.
//   The API key never touches the browser.
// ============================================

exports.handler = async function(event, context) {

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Parse the message from the frontend
  const { messages } = JSON.parse(event.body);

  // The system prompt — this is what makes Claude
  // act as a specific detailing shop's assistant.
  // When you build for a real client, customize
  // everything between the backticks.
  const systemPrompt = `You are an AI assistant for Luxe Detail, a premium auto detailing shop. You are friendly, professional, and knowledgeable. Your job is to answer customer questions and guide them toward booking a service.

ABOUT THE BUSINESS:
- Name: Luxe Detail
- Location: [City, State]
- Phone: (555) 000-0000
- Email: hello@luxedetail.com
- Hours: Monday–Saturday 8am–6pm
- Satisfaction guarantee on every service

SERVICES & PRICING:
- Express Detail: $89 — hand wash, vacuum, windows, tire shine (1.5 hrs)
- Exterior Detail: $149 — full wash, clay bar, tire dressing (2-3 hrs)
- Interior Detail: $179 — deep vacuum, steam clean, leather conditioning (2-3 hrs)
- Full Detail: $299 — complete interior + exterior (4-5 hrs)
- Paint Correction: $499 — removes swirls, scratches, oxidation (6-8 hrs)
- Ceramic Coating: $799 — long-term paint protection, lasts years (1-2 days)
- Headlight Restoration: $89 — restores clarity and visibility (1 hr)

BOOKING:
- Customers can book online using the booking form on the website
- Same-day bookings available based on availability
- Confirmation within 2 hours of submitting the form
- Mobile detailing available — we come to you

YOUR PERSONALITY:
- Friendly and conversational but professional
- Always helpful — never say "I don't know", instead offer to connect them with the team
- Keep responses concise — 2-3 sentences max unless they ask for detail
- Always end with a soft push toward booking when relevant
- Never make up information not listed above
- If asked something outside your knowledge say: "Great question — reach out to us directly at (555) 000-0000 and we'll get you sorted."

GOAL:
Your primary goal is to answer questions accurately and naturally guide the conversation toward a booking. When someone seems interested, suggest they use the booking form or call directly.`;

  try {
    // Call the Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    // Return the response to the frontend
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: data.content[0].text
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
    };
  }
};