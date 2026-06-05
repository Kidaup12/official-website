/* =========================================================================
   Vercel Serverless Function: /api/submit
   Forwards the main contact/lead form (form.html) to the Airtable webhook.
   Ported from the original Netlify function.
   ========================================================================= */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload || '{}'); } catch (e) { res.status(400).json({ error: 'Invalid request' }); return; }
  }
  payload = payload || {};

  try {
    const response = await fetch(
      'https://hooks.airtable.com/workflows/v1/genericWebhook/appRBOiUXED6LbxnG/wflxxdYqe0AVql918/wtrLzc3wdvlzPISXn',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json().catch(() => ({}));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
