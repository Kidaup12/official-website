/* =========================================================================
   KiDaFlow — AI Sales Agent lead capture (Google Apps Script web app)
   Keyless alternative to a service-account key.

   What it does on POST:
     1. Appends a row to the bound spreadsheet's "AgentLeads" sheet.
     2. Emails NOTIFY_EMAIL a green-themed notification (MailApp).

   Setup: see SETUP-ai-agent-lead.md. In short:
     - Create a Google Sheet, Extensions → Apps Script, paste this file.
     - Set SHARED_SECRET below to a long random string (also put the same
       value in Netlify env AGENT_LEAD_SECRET).
     - Deploy → New deployment → Web app → Execute as: Me,
       Who has access: Anyone → copy the /exec URL into Netlify env
       AGENT_LEAD_SCRIPT_URL.
   ========================================================================= */

// CHANGE THIS to a long random string. Must match Netlify env AGENT_LEAD_SECRET.
var SHARED_SECRET = 'CHANGE_ME_to_a_long_random_string';

var NOTIFY_EMAIL = 'dave@kidaflow.com';
var SHEET_TAB = 'AgentLeads';
var SOURCE = 'KiDaFlow website — AI Sales Agent page';
var ACCENT = '#195233';

var HEADERS = ['Timestamp', 'Name', 'Business Name', 'WhatsApp', 'Industry', 'Monthly Inquiries', 'Source'];

var CHATBOT_TAB = 'ChatbotLeads';
var CHATBOT_HEADERS = ['Timestamp', 'Name', 'Email', 'Phone', 'Tier', 'Source'];
var CHATBOT_SOURCE = 'KiDaFlow website — AI Sales Agent pricing';

function doPost(e) {
  try {
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (err) { return out(400, { error: 'Bad JSON' }); }

    if (SHARED_SECRET && body.secret !== SHARED_SECRET) {
      return out(401, { error: 'Unauthorized' });
    }

    if (body.action === 'chatbot') {
      return handleChatbot(body);
    }
    return handleAgent(body);
  } catch (err) {
    console.error(err);
    return out(500, { error: 'Internal error' });
  }
}

function handleAgent(body) {
  var name = str(body.name);
  var businessName = str(body.businessName);
  var whatsapp = str(body.whatsapp);
  var industry = str(body.industry, 'Not specified');
  var monthlyInquiries = str(body.monthlyInquiries, 'Not specified');

  if (!name || !businessName || !whatsapp) {
    return out(400, { error: 'Name, business name, and WhatsApp number are required' });
  }

  var timestamp = eatTimestamp();
  appendRowTo(SHEET_TAB, HEADERS, [timestamp, name, businessName, whatsapp, industry, monthlyInquiries, SOURCE]);

  try {
    sendEmail({
      name: name, businessName: businessName, whatsapp: whatsapp,
      industry: industry, monthlyInquiries: monthlyInquiries, timestamp: timestamp,
    });
  } catch (mailErr) {
    console.error('Email failed: ' + mailErr);
  }

  return out(200, { success: true });
}

function handleChatbot(body) {
  var name = str(body.name);
  var email = str(body.email);
  var phone = str(body.phone);
  var tier = str(body.tier, 'Not specified');

  if (!name || !email || !phone) {
    return out(400, { error: 'Name, email, and phone are required' });
  }

  var timestamp = eatTimestamp();
  appendRowTo(CHATBOT_TAB, CHATBOT_HEADERS, [timestamp, name, email, phone, tier, CHATBOT_SOURCE]);

  // alert to dave@ (best-effort)
  try { sendChatbotAlert({ name: name, email: email, phone: phone, tier: tier, timestamp: timestamp }); }
  catch (e1) { console.error('Chatbot alert failed: ' + e1); }

  // confirmation to the prospect (best-effort)
  try { sendChatbotConfirmation({ name: name, email: email, tier: tier }); }
  catch (e2) { console.error('Chatbot confirmation failed: ' + e2); }

  return out(200, { success: true });
}

// Health check in browser
function doGet() {
  return ContentService.createTextOutput('KiDaFlow lead endpoint live — v2 (chatbot enabled)')
    .setMimeType(ContentService.MimeType.TEXT);
}

function appendRowTo(tabName, headers, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  sheet.appendRow(row);
}

function sendChatbotAlert(d) {
  var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var subject = 'New chatbot plan interest — ' + d.name + ' · ' + d.tier;
  var waLink = 'https://wa.me/' + String(d.phone).replace(/[^\d]/g, '');

  var rows = [
    ['Name', esc(d.name)],
    ['Email', '<a href="mailto:' + esc(d.email) + '" style="color:#1a1a1a;">' + esc(d.email) + '</a>'],
    ['Phone', '<a href="' + waLink + '" style="color:#1a1a1a;">' + esc(d.phone) + '</a>'],
    ['Plan chosen', '<strong>' + esc(d.tier) + '</strong>'],
    ['Source', esc(CHATBOT_SOURCE)],
    ['Time', esc(d.timestamp)]
  ].map(function (r) {
    return '<tr><td style="padding:8px 0;color:#888;width:140px;">' + r[0] +
      '</td><td style="padding:8px 0;color:#1a1a1a;font-weight:500;">' + r[1] + '</td></tr>';
  }).join('');

  var html = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1a1a1a;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:' + ACCENT + ';padding:24px 32px;">' +
    '<div style="color:#cdeed9;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">KiDaFlow</div>' +
    '<div style="color:#fff;font-size:20px;font-weight:600;margin-top:6px;">New chatbot plan interest</div></td></tr>' +
    '<tr><td style="padding:28px 32px;"><p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.5;">Someone pressed <strong>Get Started</strong> on the AI Sales Agent pricing.</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">' + rows + '</table>' +
    '<div style="margin-top:28px;"><a href="' + sheetUrl + '" style="display:inline-block;background:' + ACCENT + ';color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;font-size:14px;">View leads sheet</a></div>' +
    '</td></tr></table></td></tr></table></body></html>';

  var plain = [
    'Someone pressed Get Started on the AI Sales Agent pricing.', '',
    'Name: ' + d.name,
    'Email: ' + d.email,
    'Phone: ' + d.phone + ' (' + waLink + ')',
    'Plan chosen: ' + d.tier,
    'Source: ' + CHATBOT_SOURCE,
    'Time: ' + d.timestamp, '',
    'View leads sheet: ' + sheetUrl
  ].join('\n');

  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: plain, htmlBody: html });
}

function sendChatbotConfirmation(d) {
  var subject = 'Your KiDaFlow ' + d.tier + ' plan — we’ve got it from here';
  var firstName = String(d.name).split(' ')[0];

  var html = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1a1a1a;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:' + ACCENT + ';padding:28px 32px;">' +
    '<div style="color:#cdeed9;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">KiDaFlow</div>' +
    '<div style="color:#fff;font-size:22px;font-weight:600;margin-top:6px;">You’re on the list 🎉</div></td></tr>' +
    '<tr><td style="padding:30px 32px;color:#333;font-size:15px;line-height:1.65;">' +
    '<p style="margin:0 0 16px;">Hi ' + esc(firstName) + ',</p>' +
    '<p style="margin:0 0 16px;">Thanks for choosing the <strong style="color:' + ACCENT + ';">' + esc(d.tier) + '</strong> AI Sales Agent plan. We’ve noted your interest, and a KiDaFlow specialist will reach out within <strong>24 hours</strong> to set up your <strong>14-day free trial</strong> and tailor the agent to your business.</p>' +
    '<p style="margin:0 0 16px;">In the meantime, if you have any questions, just reply to this email or message us on WhatsApp — we’re happy to help.</p>' +
    '<div style="margin:24px 0;"><a href="https://wa.link/qat6uf" style="display:inline-block;background:' + ACCENT + ';color:#fff;text-decoration:none;font-weight:700;padding:13px 26px;border-radius:8px;font-size:14px;">Chat with us on WhatsApp</a></div>' +
    '<p style="margin:0;color:#666;">Talk soon,<br><strong>The KiDaFlow Team</strong></p>' +
    '</td></tr>' +
    '<tr><td style="padding:16px 32px;background:#f9f9f9;color:#999;font-size:12px;text-align:center;">KiDaFlow · Automating workflows for modern businesses · hello@kidaflow.com</td></tr>' +
    '</table></td></tr></table></body></html>';

  var plain = [
    'Hi ' + firstName + ',', '',
    'Thanks for choosing the ' + d.tier + ' AI Sales Agent plan. We’ve noted your interest, and a KiDaFlow specialist will reach out within 24 hours to set up your 14-day free trial and tailor the agent to your business.', '',
    'If you have any questions, just reply to this email or message us on WhatsApp: https://wa.link/qat6uf', '',
    'Talk soon,',
    'The KiDaFlow Team',
    'hello@kidaflow.com'
  ].join('\n');

  MailApp.sendEmail({ to: d.email, subject: subject, body: plain, htmlBody: html, name: 'KiDaFlow' });
}

function sendEmail(d) {
  var waLink = 'https://wa.me/' + String(d.whatsapp).replace(/[^\d]/g, '');
  var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var subject = 'New AI agent lead — ' + d.name + ' · ' + d.businessName + ' · ' + d.industry;

  var rows = [
    ['Name', esc(d.name)],
    ['Business Name', esc(d.businessName)],
    ['WhatsApp', '<a href="' + waLink + '" style="color:#1a1a1a;text-decoration:underline;">' + esc(d.whatsapp) + '</a>'],
    ['Industry', esc(d.industry)],
    ['Monthly enquiries', esc(d.monthlyInquiries)],
    ['Source', esc(SOURCE)],
    ['Time', esc(d.timestamp)],
  ].map(function (r) {
    return '<tr><td style="padding:8px 0;color:#888;width:150px;">' + r[0] +
      '</td><td style="padding:8px 0;color:#1a1a1a;font-weight:500;">' + r[1] + '</td></tr>';
  }).join('');

  var html = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1a1a1a;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:' + ACCENT + ';padding:24px 32px;">' +
    '<div style="color:#cdeed9;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">KiDaFlow</div>' +
    '<div style="color:#fff;font-size:20px;font-weight:600;margin-top:6px;">New AI Sales Agent lead</div></td></tr>' +
    '<tr><td style="padding:28px 32px;"><p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.5;">A new lead came in from the AI Sales Agent page.</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">' + rows + '</table>' +
    '<div style="margin-top:28px;"><a href="' + sheetUrl + '" style="display:inline-block;background:' + ACCENT + ';color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;font-size:14px;">View leads sheet</a></div>' +
    '</td></tr><tr><td style="padding:16px 32px;background:#f9f9f9;color:#999;font-size:12px;text-align:center;">Sent by the KiDaFlow website</td></tr>' +
    '</table></td></tr></table></body></html>';

  var plain = [
    'A new lead came in from the AI Sales Agent page.', '',
    'Name: ' + d.name,
    'Business Name: ' + d.businessName,
    'WhatsApp: ' + d.whatsapp + ' (' + waLink + ')',
    'Industry: ' + d.industry,
    'Monthly enquiries: ' + d.monthlyInquiries,
    'Source: ' + SOURCE,
    'Time: ' + d.timestamp, '',
    'View leads sheet: ' + sheetUrl,
  ].join('\n');

  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: plain, htmlBody: html });
}

// ---- helpers ----
function str(v, fb) { return (typeof v === 'string' && v.trim()) ? v.trim() : (fb || ''); }

function eatTimestamp() {
  // Sheet/script timezone is set in project settings; format in EAT explicitly.
  return Utilities.formatDate(new Date(), 'Africa/Nairobi', 'dd/MM/yyyy HH:mm') + ' EAT';
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function out(code, obj) {
  // Apps Script web apps always return 200 to the client; embed status in body.
  obj._status = code;
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
