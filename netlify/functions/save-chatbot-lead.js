/* =========================================================================
   Netlify Function: save-chatbot-lead  (thin proxy → Google Apps Script)

   The AI Sales Agent pricing "Get Started" modal POSTs here. We forward the
   lead to the same Google Apps Script web app used by save-agent-lead, tagged
   with action:"chatbot" so the script writes to the ChatbotLeads tab, alerts
   dave@kidaflow.com, and emails the prospect a confirmation.

   Reuses the same env vars as save-agent-lead:
     AGENT_LEAD_SCRIPT_URL  - the Apps Script web app /exec URL
     AGENT_LEAD_SECRET      - shared secret, must match SHARED_SECRET in Code.gs
   ========================================================================= */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return resp(405, { error: 'Method Not Allowed' });
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return resp(400, { error: 'Invalid request' });
  }

  const safe = (v, fb = '') => (typeof v === 'string' && v.trim() ? v.trim() : fb);
  const lead = {
    name: safe(data.name),
    email: safe(data.email),
    phone: safe(data.phone),
    tier: safe(data.tier, 'Not specified'),
  };

  if (!lead.name || !lead.email || !lead.phone) {
    return resp(400, { error: 'Name, email, and phone are required' });
  }

  const scriptUrl = process.env.AGENT_LEAD_SCRIPT_URL;
  if (!scriptUrl) {
    console.error('[save-chatbot-lead] AGENT_LEAD_SCRIPT_URL not set');
    return resp(500, { error: 'Lead endpoint not configured' });
  }

  try {
    const r = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign(
        { secret: process.env.AGENT_LEAD_SECRET || '', action: 'chatbot' },
        lead
      )),
      redirect: 'follow',
    });

    const text = await r.text();
    let body = {};
    try { body = JSON.parse(text); } catch (e) { /* non-JSON */ }

    const status = body._status || r.status;
    if (status >= 400) {
      console.error('[save-chatbot-lead] Apps Script error', status, text.slice(0, 300));
      return resp(status === 401 ? 500 : status, { error: body.error || 'Could not save your details' });
    }

    return resp(200, { success: true });
  } catch (err) {
    console.error('[save-chatbot-lead] forward failed:', err);
    return resp(502, { error: 'Could not reach the lead endpoint' });
  }
};

function resp(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}
