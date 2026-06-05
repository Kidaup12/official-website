/* =========================================================================
   AI Sales Agent page — data + interactions (vanilla JS, no framework)
   Ported from the React reference into KiDaFlow's static site.
   ========================================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Inline icon set (replaces lucide-react) ----
  function icon(name) {
    const o = 'fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"';
    const paths = {
      zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
      filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><polyline points="9 16 11 18 15 14"></polyline>',
      database: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
      brain: '<path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>',
      trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
      refresh: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
      usercheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>',
      layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
      message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
      save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>',
      building: '<rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"></path>',
      scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>',
      heart: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>',
      utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>',
      bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>',
    };
    return '<svg width="22" height="22" viewBox="0 0 24 24" ' + o + '>' + (paths[name] || '') + '</svg>';
  }

  // ---- DATA ----
  const DEMO_CONVERSATION = [
    { from: 'customer', text: 'Hi, do you do studio photography sessions? Looking for a portrait shoot.' },
    { from: 'agent', text: "Hi! Yes we do 📸 Welcome to Lumina Studio. We'd love to shoot for you. Quick question — is this for personal portraits, a brand/product shoot, or something else?" },
    { from: 'customer', text: 'Personal portraits. And how much is it?' },
    { from: 'agent', text: "Lovely. Our Portrait Session is KES 12,000 — that's a 1-hour studio shoot, 2 backdrops, and 10 professionally edited photos delivered. We also have a Premium package at KES 20,000 with 3 outfits and 25 edits. Which feels right for you?" },
    { from: 'customer', text: "The 12K portrait one is good. Do you have space this week?" },
    { from: 'agent', text: 'Great choice! Let me check the calendar… ✨ We have Wednesday 2pm, Thursday 11am, or Saturday 10am open this week. Which works best for you?' },
    { from: 'customer', text: 'Saturday 10am works' },
    { from: 'agent', text: "Perfect — Saturday 10am it is. Just to lock it in, what's your full name and WhatsApp number?" },
    { from: 'customer', text: 'Aisha Mwangi, 0712 345 678' },
    { from: 'agent', text: 'Thank you Aisha 🙌 To secure your Saturday slot we take a 50% deposit (KES 6,000), with the balance on the day. You can pay via M-Pesa to Till 555888 — shall I send the details?' },
    { from: 'customer', text: 'Yes please send them' },
    { from: 'agent', text: "Sent ✅ Till 555888, amount KES 6,000, reference 'Aisha-Sat'. Once it reflects I'll confirm your booking right away." },
    { from: 'customer', text: 'Done, just paid the 6,000' },
    { from: 'agent', text: "Received, thank you! 🎉 You're confirmed for Saturday 10am, Portrait Session at Lumina Studio. I've WhatsApp'd you the address, what to wear, and a prep checklist. One tip — clients who add hair & makeup (KES 3,500) love their results. Want me to add it?" },
    { from: 'customer', text: 'Ooh yes, add the makeup' },
    { from: 'agent', text: "Done — hair & makeup added, our stylist will arrive 30 minutes before. See you Saturday, Aisha! 👋" },
  ];

  const RESULTS = ['Session booked', '50% deposit paid', 'Makeup upsell', 'Added to CRM'];

  const COMPARISON_ROWS = [
    { bot: 'Follows a fixed script', agent: 'Understands context and adapts in real time' },
    { bot: 'Forgets every conversation', agent: 'Remembers returning customers and picks up where you left off' },
    { bot: 'Answers questions', agent: 'Qualifies leads, handles objections, and closes' },
    { bot: 'Available 24/7 but useless after hours', agent: 'Books meetings, captures data, and follows up — all without you' },
    { bot: 'One channel only', agent: 'Works across WhatsApp, Instagram, SMS, Email, and your website simultaneously' },
    { bot: 'Gives you transcripts', agent: 'Saves structured data directly to your CRM or Google Sheets' },
    { bot: 'No personality', agent: 'Knows your business, your tone, your products, and your pricing' },
    { bot: 'Drops conversations', agent: 'Knows exactly when to hand off to a human — with full context' },
  ];

  const CAPABILITIES = [
    { icon: 'zap', title: 'Responds in seconds, always', body: 'Every enquiry gets a response in under 30 seconds — at 2am on a Sunday or 9am on a Monday. Your potential clients never wait, never wonder, never move on.' },
    { icon: 'filter', title: 'Qualifies every lead', body: 'It asks the right questions to understand what the customer actually needs, their budget, their timeline, and their intent. Your team only speaks to people who are ready.' },
    { icon: 'calendar', title: 'Books meetings automatically', body: 'It checks availability, offers times, confirms bookings, and sends reminders — without a single human involved. Your calendar fills while you sleep.' },
    { icon: 'database', title: 'Captures everything intelligently', body: 'Name, number, budget, timeline, preferences, objections — all captured in a structured way and saved exactly where you need it. No more leads lost in a DM.' },
    { icon: 'brain', title: 'Knows your business deeply', body: 'Trained on your products, pricing, FAQs, policies, and tone. It represents your business the way your best team member would — consistently, accurately, every time.' },
    { icon: 'trending', title: 'Upsells and cross-sells', body: 'Recognises opportunities and introduces relevant products or services at the right moment in the conversation — the way a good salesperson naturally would.' },
    { icon: 'refresh', title: 'Follows up automatically', body: 'A lead goes quiet after showing interest? The agent follows up at 24 hours, 3 days, and 7 days — automatically. No more leads that simply fall through the cracks.' },
    { icon: 'usercheck', title: 'Remembers every customer', body: 'Returning customers are recognised. The agent knows their history, their previous enquiries, their preferences. They never have to start from scratch.' },
    { icon: 'layers', title: 'Handles 1 or 10,000 at once', body: 'Whether you have 3 enquiries or 3,000 coming in at once, every single one gets the same quality response at the same speed. Volume is not a constraint.' },
  ];

  const CHANNELS = [
    { name: 'WhatsApp', color: '#25D366', sample: 'Lead enquiry' },
    { name: 'Instagram', color: '#E1306C', sample: 'DM qualification' },
    { name: 'SMS', color: '#3B82F6', sample: 'Booking reminder' },
    { name: 'Email', color: '#14B8A6', sample: 'Follow-up sequence' },
    { name: 'Website', color: '#082111', sample: 'Live chat' },
  ];

  const FLOW_STEPS = [
    { icon: 'message', title: 'Customer messages', sub: 'Any channel, any time', tip: 'e.g. WhatsApp DM at 11pm asking about a Kilimani 2-bed' },
    { icon: 'filter', title: 'Agent qualifies', sub: 'Right questions, right order', tip: 'e.g. Rent or buy? Move-in date? Budget? Family size?' },
    { icon: 'database', title: 'Data captured', sub: 'Name, number, budget, intent', tip: 'e.g. Sarah Kamau · KES 75K budget · Viewing Thursday · 1 parking bay' },
    { icon: 'zap', title: 'Action triggered', sub: 'Booking, follow-up, or escalation', tip: 'e.g. Viewing booked, confirmation sent, agent notified' },
    { icon: 'save', title: 'Saved everywhere', sub: 'CRM, Google Sheets, or your database', tip: 'e.g. New row in CRM + Sheets + email summary to manager' },
  ];

  const INDUSTRIES = [
    { icon: 'building', name: 'Real Estate', bullets: ['Qualifies buyers and renters by budget, location, and timeline', "Books viewings directly into the agent's calendar", 'Follows up on every showing to gauge interest and move to offer'], outcome: 'Never lose a serious buyer to a missed message again.' },
    { icon: 'scale', name: 'Law Firms', bullets: ['Handles initial intake: matter type, urgency, budget, contact details', 'Books consultation appointments without PA involvement', 'Answers common FAQs about services, fees, and process'], outcome: 'Your lawyers focus on cases. The agent handles intake.' },
    { icon: 'users', name: 'HR & Recruitment', bullets: ['Screens candidates with pre-set qualification questions', 'Schedules interviews automatically based on calendar availability', 'Sends reminders, collects documents, updates applicants on status'], outcome: 'Fill roles faster without drowning your HR team in admin.' },
    { icon: 'heart', name: 'Healthcare & Clinics', bullets: ['Books and confirms patient appointments 24/7', 'Sends pre-appointment instructions and reminders', 'Handles common queries about services, pricing, and location'], outcome: 'No-shows down. Bookings up. Front desk freed.' },
    { icon: 'utensils', name: 'Hospitality & Events', bullets: ['Takes reservations, confirms availability, and upsells packages', 'Handles event enquiries with tailored questions to scope requirements', 'Follows up on quotes and nudges undecided prospects'], outcome: 'Every enquiry handled. Every upsell captured.' },
    { icon: 'bag', name: 'E-commerce & Retail', bullets: ['Answers product questions, checks stock, processes order enquiries', 'Upsells complementary products at the right moment', 'Handles post-purchase queries and collects reviews'], outcome: 'Your best salesperson, available on every product, always.' },
  ];

  const INDUSTRY_OPTIONS = ['Real Estate', 'Law Firm', 'HR & Recruitment', 'Healthcare / Clinic', 'Hospitality & Events', 'E-commerce & Retail', 'Management Consulting', 'Accounting & Finance', 'Other'];
  const INQUIRY_OPTIONS = ['Under 50', '50–200', '200–500', '500+'];

  const INDUSTRY_SNIPPETS = {
    'Real Estate': [
      { from: 'customer', text: 'Hi, is the 2-bed in Kilimani still available?' },
      { from: 'agent', text: 'Yes, available from the 1st at KES 75,000/month. Rent or buy?' },
      { from: 'customer', text: 'Rent. Can I view it Thursday?' },
      { from: 'agent', text: "Thursday afternoon works. What's your full name and WhatsApp?" },
      { from: 'customer', text: 'Sarah Kamau, 0712 345 678' },
      { from: 'agent', text: "Booked ✅ We also have parking at KES 5,000/bay — would you like one added?" },
    ],
    'Law Firm': [
      { from: 'customer', text: 'Hi, I need help with a land dispute' },
      { from: 'agent', text: 'I can help with that. To connect you with the right advocate — is this a boundary dispute, ownership dispute, or something else?' },
      { from: 'customer', text: 'Ownership. Someone is claiming my title deed is fake' },
      { from: 'agent', text: "That's urgent and we can help. Are you looking for advice first, or do you already need representation?" },
      { from: 'customer', text: 'Representation' },
      { from: 'agent', text: 'Understood. Our property litigation team handles exactly this. Can I book you a 30-minute consultation this week?' },
    ],
    'HR & Recruitment': [
      { from: 'customer', text: "Hi, I'm applying for the Sales Manager position" },
      { from: 'agent', text: "Great, thanks for reaching out! Quick questions to make sure you're a strong fit — how many years of B2B sales experience do you have?" },
      { from: 'customer', text: '6 years' },
      { from: 'agent', text: "Excellent. Are you currently employed, and what's your notice period?" },
      { from: 'customer', text: 'Yes, one month notice' },
      { from: 'agent', text: 'Perfect. Our hiring manager would love to speak with you. Are you available for a 20-minute call this Thursday or Friday?' },
    ],
    'Healthcare / Clinic': [
      { from: 'customer', text: 'I need to book a dental appointment' },
      { from: 'agent', text: 'Of course! Are you a new patient or have you visited us before?' },
      { from: 'customer', text: 'New patient' },
      { from: 'agent', text: "Welcome! What's the reason for your visit — routine checkup, specific concern, or something urgent?" },
      { from: 'customer', text: "I have a toothache that's been going on for 3 days" },
      { from: 'agent', text: "Let's get you seen quickly. We have slots tomorrow at 10am and 3pm. Which works better for you?" },
    ],
    'Hospitality & Events': [
      { from: 'customer', text: 'Hi, do you have availability for a corporate dinner for 40 people next month?' },
      { from: 'agent', text: 'We do! A few quick questions — what date are you looking at, and is this a seated dinner or cocktail format?' },
      { from: 'customer', text: 'Friday the 20th, seated dinner' },
      { from: 'agent', text: "Perfect, the 20th is open. Do you have a per-head budget in mind? We have three set menus from KES 3,500 to KES 6,500." },
      { from: 'customer', text: 'Around 5,000 per person' },
      { from: 'agent', text: "Great — our Signature menu fits perfectly at KES 5,200. I'll send a full quote to your email. What's the best address to use?" },
    ],
    'E-commerce & Retail': [
      { from: 'customer', text: 'Hi, is the leather tote bag still in stock in tan?' },
      { from: 'agent', text: 'Yes, tan is in stock — we have 4 left. Are you in Nairobi or elsewhere in Kenya?' },
      { from: 'customer', text: 'Nairobi' },
      { from: 'agent', text: "Delivery within Nairobi is KES 300, same-day if you order before 2pm. Would you like the matching cardholder too? It's KES 1,800 and a popular pairing." },
      { from: 'customer', text: 'Yes add the cardholder' },
      { from: 'agent', text: 'Done. Your total is KES 9,100 incl. delivery. M-Pesa to till 123456 — should I confirm the order once payment lands?' },
    ],
    'Management Consulting': [
      { from: 'customer', text: 'Hi, we need help with a market entry strategy for Uganda' },
      { from: 'agent', text: "Happy to help. Quick context — what's your sector, and roughly what's your annual revenue range?" },
      { from: 'customer', text: 'FMCG, around KES 400M/year' },
      { from: 'agent', text: 'Got it. Are you looking for a scoping study, a full entry strategy, or implementation support?' },
      { from: 'customer', text: 'Full strategy' },
      { from: 'agent', text: 'Our team has done this for three FMCG clients in the last year. Can I book a 30-minute scoping call this week?' },
    ],
    'Accounting & Finance': [
      { from: 'customer', text: 'Hi, looking for help with my annual returns' },
      { from: 'agent', text: 'Of course. Quick questions — sole proprietor, partnership, or limited company?' },
      { from: 'customer', text: 'Limited company, 12 employees' },
      { from: 'agent', text: "Understood. Are you up to date on KRA filings, or are there returns outstanding we'd need to clean up first?" },
      { from: 'customer', text: 'Two months behind' },
      { from: 'agent', text: "Manageable. Our team can clean that up and get you current. Want to book a free 20-minute consult this week to scope it?" },
    ],
    Other: [
      { from: 'customer', text: 'Hi, interested in your services. Can you tell me more?' },
      { from: 'agent', text: "Of course! Quick context first — what's your business, and what's the main problem you're trying to solve right now?" },
      { from: 'customer', text: "We're losing too many WhatsApp enquiries because no one answers fast enough" },
      { from: 'agent', text: 'That is exactly what we solve. Roughly how many enquiries do you get a month, and across which channels?' },
      { from: 'customer', text: 'Maybe 300 a month, mostly WhatsApp and Instagram' },
      { from: 'agent', text: "Great fit. Let's book a 30-minute call so we can show you exactly how this would work for your business — what day works best?" },
    ],
  };

  const INDUSTRY_CAPTURE_FIELDS = {
    'Real Estate': [['Customer name', 'Sarah Kamau'], ['WhatsApp number', '+254 712 345 678'], ['Enquiry type', '2-bed rental, Kilimani'], ['Budget', 'KES 75,000/month'], ['Timeline', 'Move-in next month'], ['Booking status', 'Viewing confirmed Thursday'], ['Upsell', '1 parking bay added'], ['Source channel', 'Instagram DM']],
    'Law Firm': [['Client name', 'James Otieno'], ['WhatsApp number', '+254 722 111 222'], ['Matter type', 'Property — ownership dispute'], ['Urgency', 'High'], ['Engagement', 'Representation'], ['Booking status', 'Consultation booked Friday'], ['Source channel', 'Website chat']],
    'HR & Recruitment': [['Candidate name', 'Mary Wambui'], ['Role applied', 'Sales Manager'], ['Experience', '6 years B2B sales'], ['Notice period', '1 month'], ['Interview', 'Thursday 10am confirmed'], ['WhatsApp number', '+254 733 444 555'], ['Source channel', 'Instagram DM']],
    'Healthcare / Clinic': [['Patient name', 'David Mwangi'], ['Patient type', 'New patient'], ['Reason for visit', 'Toothache, 3 days'], ['Appointment', 'Tomorrow 10am'], ['WhatsApp number', '+254 711 222 333'], ['Reminder sent', 'Yes — SMS + WhatsApp'], ['Source channel', 'WhatsApp']],
    'Hospitality & Events': [['Client name', 'Achieng Odhiambo'], ['Event type', 'Corporate dinner, 40 pax'], ['Date', 'Friday 20th'], ['Budget', 'KES 5,000/pax'], ['Upsell', 'Signature menu @ KES 5,200/pax'], ['Quote status', 'Sent to client email'], ['Source channel', 'Instagram DM']],
    'E-commerce & Retail': [['Customer name', 'Brian Kiprop'], ['Product', 'Leather tote — tan'], ['Stock checked', '4 units available'], ['Upsell', 'Cardholder added (KES 1,800)'], ['Order total', 'KES 9,100 incl. delivery'], ['Payment', 'M-Pesa awaiting confirmation'], ['Source channel', 'WhatsApp']],
    'Management Consulting': [['Contact name', 'Linet Kamau'], ['Company sector', 'FMCG'], ['Revenue range', 'KES 400M/year'], ['Engagement scope', 'Full market entry strategy'], ['Target market', 'Uganda'], ['Booking status', 'Scoping call booked this week'], ['Source channel', 'Email']],
    'Accounting & Finance': [['Client name', 'Peter Njoroge'], ['Entity type', 'Limited company, 12 staff'], ['KRA status', '2 months behind on filings'], ['Engagement', 'Annual returns + cleanup'], ['Consult booked', 'Free 20-min, this week'], ['WhatsApp number', '+254 700 555 666'], ['Source channel', 'Website chat']],
    Other: [['Contact name', 'Jane Mwende'], ['Business name', 'Mwende & Co'], ['Pain point', 'Missed WhatsApp enquiries'], ['Monthly volume', '~300 enquiries'], ['Primary channels', 'WhatsApp + Instagram'], ['Next step', '30-min discovery call booked'], ['Source channel', 'Instagram DM']],
  };

  const DATA_DEST = [
    { icon: 'database', title: 'Google Sheets', body: 'Every lead, every conversation, in a clean row.' },
    { icon: 'save', title: 'Your CRM', body: 'HubSpot, Pipedrive, Zoho, or a custom CRM we build for you.' },
    { icon: 'message', title: 'Email notifications', body: 'A summary lands in your inbox the moment a lead is captured.' },
  ];

  // ---- helpers ----
  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function bubble(m) { return '<div class="aa-bubble ' + m.from + '">' + esc(m.text) + '</div>'; }

  // ===================== Static section renders =====================
  function renderComparison() {
    const wrap = document.getElementById('aa-compare-rows');
    if (!wrap) return;
    COMPARISON_ROWS.forEach(function (r) {
      wrap.appendChild(el(
        '<div class="aa-compare-row">' +
        '<div class="bot"><div class="aa-rlabel">Typical chatbot</div>' + esc(r.bot) + '</div>' +
        '<div class="agent"><div class="aa-rlabel">KiDaFlow AI Agent</div>' + esc(r.agent) + '</div>' +
        '</div>'));
    });
  }

  function renderCapabilities() {
    const wrap = document.getElementById('aa-capabilities');
    if (!wrap) return;
    CAPABILITIES.forEach(function (c) {
      wrap.appendChild(el('<div class="aa-card"><div class="aa-icon">' + icon(c.icon) + '</div><h3>' + esc(c.title) + '</h3><p>' + esc(c.body) + '</p></div>'));
    });
  }

  function renderIndustries() {
    const wrap = document.getElementById('aa-industries');
    if (!wrap) return;
    INDUSTRIES.forEach(function (ind) {
      const bullets = ind.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      wrap.appendChild(el('<div class="aa-card"><div class="aa-icon">' + icon(ind.icon) + '</div><h3>' + esc(ind.name) + '</h3><ul class="aa-ind-bullets">' + bullets + '</ul><div class="aa-outcome">' + esc(ind.outcome) + '</div></div>'));
    });
  }

  function renderFlow() {
    const wrap = document.getElementById('aa-flow');
    if (!wrap) return;
    FLOW_STEPS.forEach(function (s) {
      wrap.appendChild(el('<div class="aa-flow-step"><div class="aa-flow-tip">' + esc(s.tip) + '</div><div class="aa-icon">' + icon(s.icon) + '</div><h4>' + esc(s.title) + '</h4><p>' + esc(s.sub) + '</p></div>'));
    });
  }

  function renderChannels() {
    // Desktop hub: spokes + traveling dots
    const svg = document.getElementById('aa-hub-svg');
    const hub = document.getElementById('aa-hub');
    const pts = [
      { x: 120, y: 90, left: '15%', top: '21%' },
      { x: 680, y: 90, left: '85%', top: '21%' },
      { x: 60, y: 330, left: '7%', top: '79%' },
      { x: 740, y: 330, left: '93%', top: '79%' },
      { x: 400, y: 380, left: '50%', top: '90%' },
    ];
    const center = hub ? hub.querySelector('.aa-hub-center') : null;
    const centerDefault = center ? center.innerHTML : 'Your AI<br>Agent';

    if (svg) {
      let inner = '';
      pts.forEach(function (p, i) {
        inner += '<line id="aa-spoke-' + i + '" x1="400" y1="210" x2="' + p.x + '" y2="' + p.y + '" stroke="#7ddfa4" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="4 4"></line>';
      });
      if (!reduceMotion) {
        pts.forEach(function (p, i) {
          const d = (i * 0.6).toFixed(1);
          inner += '<circle r="4" fill="#7ddfa4">' +
            '<animate attributeName="cx" values="' + p.x + ';400" dur="2s" repeatCount="indefinite" begin="' + d + 's"></animate>' +
            '<animate attributeName="cy" values="' + p.y + ';210" dur="2s" repeatCount="indefinite" begin="' + d + 's"></animate>' +
            '<animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin="' + d + 's"></animate>' +
            '</circle>';
        });
      }
      svg.innerHTML = inner;
    }

    const nodes = [];
    let activeIdx = -1;

    function activate(i) {
      if (i === activeIdx) return;
      activeIdx = i;
      const c = CHANNELS[i];
      nodes.forEach(function (n, j) { n.classList.toggle('active', j === i); });
      if (hub) hub.classList.add('has-active');
      // highlight matching spoke, dim others
      pts.forEach(function (_, j) {
        const line = svg && document.getElementById('aa-spoke-' + j);
        if (!line) return;
        if (j === i) { line.setAttribute('stroke', c.color); line.setAttribute('stroke-opacity', '0.9'); line.setAttribute('stroke-width', '2.5'); }
        else { line.setAttribute('stroke', '#7ddfa4'); line.setAttribute('stroke-opacity', '0.12'); line.setAttribute('stroke-width', '1.5'); }
      });
      // swap center to the channel
      if (center) {
        center.style.background = c.color;
        center.innerHTML = '<div class="label"><div class="ch-name">' + esc(c.name) + '</div><div class="ch-sample">' + esc(c.sample) + '</div></div>';
      }
    }

    function clearActive() {
      activeIdx = -1;
      nodes.forEach(function (n) { n.classList.remove('active'); });
      if (hub) hub.classList.remove('has-active');
      pts.forEach(function (_, j) {
        const line = svg && document.getElementById('aa-spoke-' + j);
        if (line) { line.setAttribute('stroke', '#7ddfa4'); line.setAttribute('stroke-opacity', '0.25'); line.setAttribute('stroke-width', '1.5'); }
      });
      if (center) { center.style.background = ''; center.innerHTML = centerDefault; }
    }

    if (hub) {
      pts.forEach(function (p, i) {
        const c = CHANNELS[i];
        const node = el('<div class="aa-node" style="left:' + p.left + ';top:' + p.top + ';"><div class="chip" style="background:' + c.color + ';"><span class="ch-dot"></span>' + esc(c.name) + '</div><div class="sample">' + esc(c.sample) + '</div></div>');
        node.addEventListener('mouseenter', function () { stopCycle(); activate(i); });
        node.addEventListener('click', function () { stopCycle(); activate(i); });
        hub.appendChild(node);
        nodes.push(node);
      });
      hub.addEventListener('mouseleave', function () { clearActive(); });
    }

    // Auto-cycle through channels until the user interacts, so it feels alive.
    let cycleTimer = null, cycleIdx = 0, cycling = false;
    function stopCycle() { cycling = false; if (cycleTimer) { clearTimeout(cycleTimer); cycleTimer = null; } }
    function tick() {
      if (!cycling) return;
      activate(cycleIdx % CHANNELS.length);
      cycleIdx++;
      cycleTimer = setTimeout(tick, 1600);
    }
    function startCycle() {
      if (reduceMotion || cycling || !nodes.length) return;
      cycling = true; cycleIdx = 0; tick();
    }
    // start cycling once the section scrolls into view
    if (hub) {
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) startCycle();
          else { stopCycle(); clearActive(); }
        });
      }, { threshold: 0.4 });
      obs.observe(hub);
    }

    // Mobile grid — tap to activate (swatch glow + highlight)
    const grid = document.getElementById('aa-hub-mobile-grid');
    const mCenter = document.querySelector('.aa-hub-mobile .center');
    const mCenterDefault = mCenter ? mCenter.innerHTML : 'Your AI<br>Agent';
    if (grid) {
      const items = [];
      CHANNELS.forEach(function (c, i) {
        const item = el('<div class="item"><span class="swatch" style="background:' + c.color + ';"></span><div><div class="nm">' + esc(c.name) + '</div><div class="sm">' + esc(c.sample) + '</div></div></div>');
        item.addEventListener('click', function () {
          const wasActive = item.classList.contains('active');
          items.forEach(function (x) { x.classList.remove('active'); });
          if (wasActive) { if (mCenter) { mCenter.style.background = ''; mCenter.innerHTML = mCenterDefault; } return; }
          item.classList.add('active');
          if (mCenter) { mCenter.style.background = c.color; mCenter.innerHTML = '<div style="font-size:15px;">' + esc(c.name) + '</div><div style="font-size:11px;font-weight:500;opacity:.85;margin-top:3px;">' + esc(c.sample) + '</div>'; }
        });
        grid.appendChild(item);
        items.push(item);
      });
    }
  }

  function renderFormOptions() {
    const ind = document.getElementById('aa-industry');
    const inq = document.getElementById('aa-inquiries');
    if (ind) INDUSTRY_OPTIONS.forEach(function (o) { ind.appendChild(el('<option value="' + esc(o) + '">' + esc(o) + '</option>')); });
    if (inq) INQUIRY_OPTIONS.forEach(function (o) { inq.appendChild(el('<option value="' + esc(o) + '">' + esc(o) + '</option>')); });
  }

  // ===================== Animated demo =====================
  function runDemo() {
    const box = document.getElementById('aa-messages');
    const resultsWrap = document.getElementById('aa-results');
    const noline = document.getElementById('aa-noline');
    if (!box || !resultsWrap) return;

    // build result chips once
    if (!resultsWrap.childNodes.length) {
      RESULTS.forEach(function (r) {
        resultsWrap.appendChild(el('<div class="aa-result-chip"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' + esc(r) + '</div>'));
      });
    }
    const chips = resultsWrap.querySelectorAll('.aa-result-chip');

    let cancelled = false;
    const timers = [];
    function wait(ms) { return new Promise(function (res) { timers.push(setTimeout(res, ms)); }); }
    function reset() { timers.forEach(clearTimeout); timers.length = 0; box.innerHTML = ''; chips.forEach(function (c) { c.classList.remove('show'); }); if (noline) noline.classList.remove('show'); }

    async function play() {
      reset();
      if (reduceMotion) {
        DEMO_CONVERSATION.forEach(function (m) { box.appendChild(el(bubble(m))); });
        chips.forEach(function (c) { c.classList.add('show'); });
        if (noline) noline.classList.add('show');
        box.scrollTop = box.scrollHeight;
        return;
      }
      for (let i = 0; i < DEMO_CONVERSATION.length && !cancelled; i++) {
        const m = DEMO_CONVERSATION[i];
        if (m.from === 'agent') {
          const t = el('<div class="aa-typing"><span></span><span></span><span></span></div>');
          box.appendChild(t); box.scrollTop = box.scrollHeight;
          await wait(900 + Math.random() * 400);
          if (cancelled) return;
          t.remove();
        } else {
          await wait(700 + Math.random() * 300);
          if (cancelled) return;
        }
        box.appendChild(el(bubble(m)));
        box.scrollTop = box.scrollHeight;
      }
      await wait(700);
      for (let i = 0; i < chips.length && !cancelled; i++) { chips[i].classList.add('show'); await wait(400); }
      if (!cancelled && noline) noline.classList.add('show');
    }

    // start on scroll-in, once
    let started = false;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting && !started) { started = true; play(); } });
    }, { threshold: 0.35 });
    obs.observe(box);

    const replay = document.getElementById('aa-replay');
    if (replay) replay.addEventListener('click', function () { cancelled = true; setTimeout(function () { cancelled = false; play(); }, 20); });
  }

  // ===================== Lead form + unlock =====================
  function wireForm() {
    const form = document.getElementById('aa-form');
    if (!form) return;
    const errBox = document.getElementById('aa-formerr');
    const submitBtn = document.getElementById('aa-submit');
    const label = document.getElementById('aa-submit-label');
    const arrow = document.getElementById('aa-submit-arrow');
    let submitted = false;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (submitted) return;
      errBox.style.display = 'none';

      const name = document.getElementById('aa-name').value.trim();
      const businessName = document.getElementById('aa-business').value.trim();
      const whatsapp = document.getElementById('aa-whatsapp').value.trim();
      const industry = document.getElementById('aa-industry').value;
      const monthlyInquiries = document.getElementById('aa-inquiries').value;

      if (!name || !businessName || !whatsapp) {
        errBox.textContent = 'Please fill in your name, business name, and WhatsApp.';
        errBox.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      label.textContent = 'Sending…';
      if (arrow) arrow.style.display = 'none';

      try {
        const res = await fetch('/api/save-agent-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name, businessName: businessName, whatsapp: whatsapp,
            industry: industry || 'Not specified',
            monthlyInquiries: monthlyInquiries || 'Not specified',
          }),
        });
        const json = await res.json().catch(function () { return {}; });
        if (!res.ok) {
          errBox.textContent = json.error || 'Something went wrong. Please try again.';
          errBox.style.display = 'block';
          submitBtn.disabled = false;
          label.textContent = 'Show me what this looks like for my business';
          if (arrow) arrow.style.display = '';
          return;
        }
      } catch (err) {
        // Network / function unavailable (e.g. local static preview) — still reveal the
        // personalized experience so the page is usable; the lead just isn't saved.
        console.warn('[ai-agent] lead submit failed, revealing unlock anyway:', err);
      }

      submitted = true;
      label.textContent = 'Sent — your guide is below ↓';
      lockInputs();
      revealUnlock(name, businessName, industry || 'Other');
    });

    function lockInputs() {
      form.querySelectorAll('input, select').forEach(function (i) { i.disabled = true; });
    }
  }

  function revealUnlock(name, businessName, industry) {
    const key = INDUSTRY_SNIPPETS[industry] ? industry : 'Other';
    const section = document.getElementById('aa-unlock');

    document.getElementById('aa-unlock-title').innerHTML = "Here&rsquo;s what your AI agent looks like, " + esc(name || 'friend') + '.';
    document.getElementById('aa-unlock-sub').innerHTML = "Based on what you&rsquo;ve told us, here&rsquo;s how we&rsquo;d set this up for <strong style=\"color:var(--aa-dark)\">" + esc(businessName || 'your business') + '</strong>.';

    const snip = document.getElementById('aa-unlock-snippet');
    snip.innerHTML = '';
    INDUSTRY_SNIPPETS[key].forEach(function (m) { snip.appendChild(el(bubble(m))); });

    const body = document.getElementById('aa-capture-body');
    body.innerHTML = '';
    (INDUSTRY_CAPTURE_FIELDS[key] || INDUSTRY_CAPTURE_FIELDS.Other).forEach(function (f) {
      body.appendChild(el('<tr><td>' + esc(f[0]) + '</td><td>' + esc(f[1]) + '</td></tr>'));
    });

    const dest = document.getElementById('aa-data-dest');
    if (!dest.childNodes.length) {
      DATA_DEST.forEach(function (d) {
        dest.appendChild(el('<div class="aa-card"><div class="aa-icon">' + icon(d.icon) + '</div><h3>' + esc(d.title) + '</h3><p>' + esc(d.body) + '</p></div>'));
      });
    }

    // personalize booking CTA
    const bt = document.getElementById('aa-booking-title');
    if (bt && businessName) bt.innerHTML = 'Want to see this working live — for ' + esc(businessName) + '?';

    section.style.display = 'block';
    setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
  }

  // ===================== Get Started modal =====================
  function wireModal() {
    const overlay = document.getElementById('aa-modal-overlay');
    if (!overlay) return;
    const closeBtn = document.getElementById('aa-modal-close');
    const tierEl = document.getElementById('aa-modal-tier');
    const form = document.getElementById('aa-modal-form');
    const formWrap = document.getElementById('aa-modal-form-wrap');
    const successWrap = document.getElementById('aa-modal-success');
    const successMsg = document.getElementById('aa-modal-success-msg');
    const errBox = document.getElementById('aa-modal-err');
    const submitBtn = document.getElementById('aa-modal-submit');
    let currentTier = 'Starter';

    function open(tier) {
      currentTier = tier || 'Starter';
      tierEl.textContent = currentTier;
      errBox.style.display = 'none';
      formWrap.style.display = '';
      successWrap.style.display = 'none';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Notify me — I'm interested";
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { document.getElementById('aa-m-name').focus(); }, 60);
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.aa-get-started').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.getAttribute('data-tier')); });
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errBox.style.display = 'none';
      const name = document.getElementById('aa-m-name').value.trim();
      const email = document.getElementById('aa-m-email').value.trim();
      const phone = document.getElementById('aa-m-phone').value.trim();
      if (!name || !email || !phone) {
        errBox.textContent = 'Please fill in your name, email, and phone.';
        errBox.style.display = 'block';
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        errBox.textContent = 'Please enter a valid email address.';
        errBox.style.display = 'block';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      let ok = false;
      try {
        const res = await fetch('/api/save-chatbot-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, email: email, phone: phone, tier: currentTier }),
        });
        const j = await res.json().catch(function () { return {}; });
        ok = res.ok && j.success === true;
      } catch (err) {
        console.warn('[ai-agent] chatbot lead submit failed:', err);
      }

      if (ok) {
        successMsg.innerHTML = "We've noted your interest in the <strong>" + esc(currentTier) +
          "</strong> plan. A KiDaFlow specialist will reach out within 24 hours to set up your 14-day free trial. Check your inbox for a confirmation.";
        formWrap.style.display = 'none';
        successWrap.style.display = 'block';
      } else {
        // Submission didn't go through — tell the user honestly and offer the calendar
        // as a direct alternative so the lead isn't lost.
        errBox.innerHTML = "We couldn't record that automatically — no problem. " +
          "We're opening our calendar so you can book a time directly. " +
          "You can also email <a href=\"mailto:hello@kidaflow.com\" style=\"color:var(--aa-accent);font-weight:600;\">hello@kidaflow.com</a>.";
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = "Notify me — I'm interested";
        openCalFallback();
      }
    });

    function openCalFallback() {
      try {
        if (typeof window.Cal === 'function') {
          window.Cal('modal', {
            calLink: 'kidaflow-automations/quick-discovery-website-linkedin',
            config: { layout: 'month_view' }
          });
          return;
        }
      } catch (e) { /* fall through to new tab */ }
      // Fallback if the Cal embed isn't ready: open the booking page in a new tab.
      window.open('https://cal.com/kidaflow-automations/quick-discovery-website-linkedin', '_blank', 'noopener');
    }
  }

  // ===================== init =====================
  document.addEventListener('DOMContentLoaded', function () {
    renderComparison();
    renderCapabilities();
    renderIndustries();
    renderFlow();
    renderChannels();
    renderFormOptions();
    runDemo();
    wireForm();
    wireModal();
  });
})();
