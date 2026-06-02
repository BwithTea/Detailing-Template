const https = require('https');

exports.handler = async function(event, context) {

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { messages } = JSON.parse(event.body);

  const systemPrompt = `You are an AI assistant for Luxe Detail, a premium auto detailing shop. You are friendly, professional, and knowledgeable. Your goal is to answer questions and guide visitors toward booking.

ABOUT THE BUSINESS:
- Name: Luxe Detail
- Phone: (555) 000-0000
- Email: hello@luxedetail.com
- Hours: Monday-Saturday 8am-6pm
- Satisfaction guarantee on every service
- Mobile detailing available

SERVICES & PRICING:
- Express Detail: $89 (1.5 hrs) — hand wash, vacuum, windows, tire shine
- Exterior Detail: $149 (2-3 hrs) — full wash, clay bar, tire dressing
- Interior Detail: $179 (2-3 hrs) — deep vacuum, steam clean, leather conditioning
- Full Detail: $299 (4-5 hrs) — complete interior + exterior
- Paint Correction: $499 (6-8 hrs) — removes swirls, scratches, oxidation
- Ceramic Coating: $799 (1-2 days) — long term paint protection
- Headlight Restoration: $89 (1 hr) — restores clarity

BOOKING FLOW — CRITICAL INSTRUCTIONS:
When a visitor wants to book or shows clear interest in booking, collect these details one at a time in natural conversation:
1. First ask for their FULL NAME
2. Then PHONE NUMBER
3. Then EMAIL ADDRESS
4. Then VEHICLE (year, make, model)
5. Then which SERVICE they want
6. Then PREFERRED DATE

Ask for one piece of info at a time. Be conversational, not robotic.

Once you have ALL SIX pieces of information, respond with a confirmation message to the visitor AND include this exact block at the very end of your response on its own line:

BOOKING_READY:{"name":"[name]","phone":"[phone]","email":"[email]","vehicle":"[vehicle]","service":"[service]","date":"[date]"}

Replace the values in brackets with the actual collected information. This triggers the booking submission automatically.

PERSONALITY:
- Friendly and conversational but professional
- Keep responses to 2-3 sentences max unless detail is needed
- Never make up information not listed above
- If asked something you don't know say: "Great question — reach out to us at (555) 000-0000 and we'll get you sorted"
- Always end with a soft push toward booking when relevant`;

  const requestBody = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: systemPrompt,
    messages: messages
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const message = parsed.content[0].text;
          resolve({
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
          });
        } catch (e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Parse error' })
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      });
    });

    req.write(requestBody);
    req.end();
  });
};