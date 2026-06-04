/* =========================================================================
   Netlify Function: save-agent-lead  (thin proxy → Google Apps Script)

   The AI Sales Agent lead form POSTs here. We forward the lead to a Google
   Apps Script web app (bound to the leads spreadsheet) which appends the row
   and emails dave@kidaflow.com. Keeping the proxy here means:
     - the Apps Script /exec URL stays server-side (in an env var)
     - the browser talks to a same-origin endpoint (no CORS surprises)
     - a shared secret is attached server-side so the script can reject
       random public POSTs

   No npm deps — uses global fetch (Node 18+ on Netlify).

   Required env vars (Netlify dashboard):
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
    businessName: safe(data.businessName),
    whatsapp: safe(data.whatsapp),
    industry: safe(data.industry, 'Not specified'),
    monthlyInquiries: safe(data.monthlyInquiries, 'Not specified'),
  };

  if (!lead.name || !lead.businessName || !lead.whatsapp) {
    return resp(400, { error: 'Name, business name, and WhatsApp number are required' });
  }

  const scriptUrl = process.env.AGENT_LEAD_SCRIPT_URL;
  if (!scriptUrl) {
    console.error('[save-agent-lead] AGENT_LEAD_SCRIPT_URL not set');
    return resp(500, { error: 'Lead endpoint not configured' });
  }

  try {
    const r = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ secret: process.env.AGENT_LEAD_SECRET || '' }, lead)),
      redirect: 'follow', // Apps Script /exec issues a 302 to script.googleusercontent.com
    });

    const text = await r.text();
    let body = {};
    try { body = JSON.parse(text); } catch (e) { /* non-JSON from script */ }

    const status = body._status || r.status;
    if (status >= 400) {
      console.error('[save-agent-lead] Apps Script error', status, text.slice(0, 300));
      return resp(status === 401 ? 500 : status, { error: body.error || 'Could not save your details' });
    }

    return resp(200, { success: true });
  } catch (err) {
    console.error('[save-agent-lead] forward failed:', err);
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
