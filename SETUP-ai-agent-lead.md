# Setup — AI Sales Agent lead capture (Apps Script, keyless)

The **AI Sales Agent** page (`ai-agent.html`) has a lead form. On submit it POSTs to the
Netlify function `netlify/functions/save-agent-lead.js`, which forwards the lead to a
**Google Apps Script web app** bound to your leads spreadsheet. The script:

1. Appends a row to the **`AgentLeads`** tab of the Sheet.
2. Emails **dave@kidaflow.com** a green-themed notification (via `MailApp`).

No service-account key, no GCP credentials, no org-policy conflict. The Apps Script runs as
*you* and is the only thing that touches the Sheet + Gmail.

> Until the two Netlify env vars below are set, the form still *works for the visitor* (it
> reveals the personalized "here's your agent" section) but leads are not saved or emailed.

---

## Overview — what you'll end up with

- A Google Sheet (the lead store).
- An Apps Script web app deployed from that Sheet → you get an `/exec` URL.
- A shared secret string that lives in **both** the script and Netlify (so randoms can't POST).
- **2 Netlify env vars:** `AGENT_LEAD_SCRIPT_URL`, `AGENT_LEAD_SECRET`.

---

## Step 1 — Create the Sheet + paste the script

1. Go to <https://sheets.google.com> → create a blank spreadsheet, name it e.g.
   "KiDaFlow Leads". (No need to add tabs — the script creates `AgentLeads` + headers on the
   first lead.)
2. In that Sheet: **Extensions → Apps Script**. A script editor opens.
3. Delete the default `function myFunction() {}` and **paste the full contents of**
   [`apps-script/Code.gs`](apps-script/Code.gs) from this repo.
4. At the top of the script, change:
   ```js
   var SHARED_SECRET = 'CHANGE_ME_to_a_long_random_string';
   ```
   to a long random string (e.g. a 32+ char password). **Remember it** — you'll paste the
   same value into Netlify as `AGENT_LEAD_SECRET`.
5. Confirm `NOTIFY_EMAIL` near the top is `dave@kidaflow.com` (change if needed).
6. **Save** (💾 / Ctrl-S).

---

## Step 2 — Authorize + deploy as a web app

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear ⚙ next to "Select type" → **Web app**.
3. Set:
   - **Description:** anything (e.g. "AI agent leads v1")
   - **Execute as:** **Me** (your account — needed so it can write the Sheet + send mail)
   - **Who has access:** **Anyone**
     *(This means anyone who knows the URL can POST. That's why we have the shared secret —
     the script rejects any POST without the right `secret`.)*
4. Click **Deploy**.
5. **Authorize**: Google prompts for permissions (Sheets + send email as you). Click through
   — if you see "Google hasn't verified this app", click **Advanced → Go to (project name)
   → Allow**. This is your own script; it's safe.
6. Copy the **Web app URL** — it ends in `/exec`. This is `AGENT_LEAD_SCRIPT_URL`.

> Sanity check: open that `/exec` URL in a browser. You should see
> "AI Sales Agent lead endpoint is live." (the `doGet` health check).

> If you later edit `Code.gs`, you must **Deploy → Manage deployments → ✏️ Edit → Version:
> New version → Deploy** for changes to go live (or create a new deployment and update the
> URL).

---

## Step 3 — Set the 2 Netlify env vars

1. Netlify dashboard → your site → **Site configuration → Environment variables**.
2. Add:
   - `AGENT_LEAD_SCRIPT_URL` = the `/exec` URL from Step 2.6
   - `AGENT_LEAD_SECRET` = the exact `SHARED_SECRET` string from Step 1.4
3. **Redeploy** (Deploys → Trigger deploy → Deploy site) so the function picks them up.

That's it. No `npm install` needed — the function uses built-in `fetch`, no dependencies.

---

## Testing

### Quickest — test the Apps Script directly (no Netlify needed)
Run this from any terminal (replace the URL + secret):
```bash
curl -L -X POST "PASTE_EXEC_URL" \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_SECRET","name":"Test Lead","businessName":"Test Co","whatsapp":"+254712345678","industry":"Real Estate","monthlyInquiries":"50–200"}'
```
Expect `{"success":true,"_status":200}`. Then check:
- a new row in the Sheet's **`AgentLeads`** tab, and
- an email at **dave@kidaflow.com**.

> The `-L` matters: Apps Script `/exec` answers with a 302 redirect that must be followed.

### End-to-end via the site
On a Netlify deploy preview (or `npx netlify dev` with the two env vars set), open
`ai-agent.html`, fill the lead form, submit. Confirm the row + email land, and the page reveals
the personalized "here's your agent" section.

---

## Troubleshooting

- **`{"error":"Unauthorized"}`** — the `secret` sent doesn't match `SHARED_SECRET`. Make sure
  `AGENT_LEAD_SECRET` (Netlify) === `SHARED_SECRET` (Code.gs), and you redeployed both.
- **Row saved, no email** — first run, Gmail authorization may not have been granted; re-run
  the deploy/authorize, or check the script executions log (Apps Script → Executions).
- **Browser test of `/exec` shows a Google login page** — the deployment "Who has access" is
  not set to **Anyone**. Re-edit the deployment.
- **`Could not reach the lead endpoint` (502 from the function)** — `AGENT_LEAD_SCRIPT_URL` is
  wrong or missing in Netlify.
- **Edited Code.gs but nothing changed** — you must publish a **new version** under Manage
  deployments; the old version keeps serving until you do.

## Files involved
- [`apps-script/Code.gs`](apps-script/Code.gs) — the web-app script (paste into the Sheet's Apps Script).
- [`netlify/functions/save-agent-lead.js`](netlify/functions/save-agent-lead.js) — thin proxy → Apps Script.
- `ai-agent.html` / `ai-agent.js` — the page + form (POST to the Netlify function).
