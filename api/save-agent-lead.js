/* =========================================================================
   Vercel Serverless Function: /api/save-agent-lead
   Proxies the AI Sales Agent lead form to the Google Apps Script web app,
   which appends a row to AgentLeads and emails dave@kidaflow.com.

   Env vars (Vercel → Project → Settings → Environment Variables):
     AGENT_LEAD_SCRIPT_URL  - the Apps Script web app /exec URL
     AGENT_LEAD_SECRET      - shared secret, must match SHARED_SECRET in Code.gs
   ========================================================================= */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data || '{}'); } catch (e) { res.status(400).json({ error: 'Invalid request' }); return; }
  }
  data = data || {};

  const safe = (v, fb = '') => (typeof v === 'string' && v.trim() ? v.trim() : fb);
  const lead = {
    name: safe(data.name),
    businessName: safe(data.businessName),
    whatsapp: safe(data.whatsapp),
    industry: safe(data.industry, 'Not specified'),
    monthlyInquiries: safe(data.monthlyInquiries, 'Not specified'),
  };

  if (!lead.name || !lead.businessName || !lead.whatsapp) {
    res.status(400).json({ error: 'Name, business name, and WhatsApp number are required' });
    return;
  }

  const scriptUrl = process.env.AGENT_LEAD_SCRIPT_URL;
  if (!scriptUrl) {
    console.error('[save-agent-lead] AGENT_LEAD_SCRIPT_URL not set');
    res.status(500).json({ error: 'Lead endpoint not configured' });
    return;
  }

  try {
    const r = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ secret: process.env.AGENT_LEAD_SECRET || '' }, lead)),
      redirect: 'follow',
    });

    const text = await r.text();
    let body = {};
    try { body = JSON.parse(text); } catch (e) { /* non-JSON */ }

    const status = body._status || r.status;
    if (status >= 400) {
      console.error('[save-agent-lead] Apps Script error', status, text.slice(0, 300));
      res.status(status === 401 ? 500 : status).json({ error: body.error || 'Could not save your details' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[save-agent-lead] forward failed:', err);
    res.status(502).json({ error: 'Could not reach the lead endpoint' });
  }
}
