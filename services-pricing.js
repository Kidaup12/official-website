/* Services & Pricing — interactive industries tabs, scroll reveal, metric count-up */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // industry name -> case-study href (only where one exists)
  var LINKS = {
    'PI Associates OKC': 'case-studies/pi-associates.html',
    'Ask a Barrister': 'case-studies/ask-a-barrister.html',
    'Bail 2 GO': 'case-studies/client-10.html',
    'Cherokee CPA': 'case-studies/cherokee-cpa.html',
    'Beauty in the Books': 'case-studies/beauty-in-the-books.html',
    'Beva Homes': 'case-studies/beva-homes.html',
    'Mr. Rooter Ottawa': 'case-studies/mr-rooter.html',
    'Northern Inspections': 'case-studies/northern-inspections.html',
    'Bins4less USA': 'case-studies/bins4less.html',
    'LoudLion': 'case-studies/loudlion.html',
    'Custodia.care': 'case-studies/client-9.html'
  };

  var INDUSTRIES = [
    { name: 'Legal Services', clients: ['PI Associates OKC', 'Ask a Barrister', 'Bail 2 GO'], metric: 'Up to $1.4M pipeline value added' },
    { name: 'Accounting & Bookkeeping', clients: ['Cherokee CPA', 'Beauty in the Books'], metric: '$45K+ annual capacity unlocked' },
    { name: 'Real Estate', clients: ['Beva Homes'], metric: 'Multi-x lead capacity, zero new hires' },
    { name: 'Home Services & Plumbing', clients: ['Mr. Rooter Ottawa'], metric: '$250K+ revenue protected in 90 days' },
    { name: 'Construction & Inspection', clients: ['Northern Inspections'], metric: '$72K+ extra annual revenue capacity' },
    { name: 'Logistics & Waste', clients: ['Bins4less USA'], metric: 'Zero leads fall through the cracks' },
    { name: 'Marketing & Agencies', clients: ['LoudLion'], metric: '1 person = output of 3–5 SDRs' },
    { name: 'Family Care & Social Services', clients: ['Custodia.care'], metric: 'ROI visible in month 1' }
  ];

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function elFrom(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  function clientChip(name) {
    var href = LINKS[name];
    if (href) return '<a class="sp-chip" href="' + href + '">' + esc(name) + ' <span style="margin-left:6px;opacity:.6;">→</span></a>';
    return '<span class="sp-chip static">' + esc(name) + '</span>';
  }

  function buildIndustries() {
    var tabs = document.getElementById('sp-tabs');
    var panels = document.getElementById('sp-panels');
    if (!tabs || !panels) return;

    INDUSTRIES.forEach(function (ind, i) {
      var tab = elFrom('<button class="sp-tab' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' + esc(ind.name) + '</button>');
      tabs.appendChild(tab);

      var chips = ind.clients.map(clientChip).join('');
      var panel = elFrom(
        '<div class="sp-panel' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' +
          '<div class="sp-ind-card">' +
            '<h3>' + esc(ind.name) + '</h3>' +
            '<div class="sp-ind-clients">' + chips + '</div>' +
            '<div class="sp-badge">' + esc(ind.metric) + '</div>' +
          '</div>' +
        '</div>'
      );
      panels.appendChild(panel);
    });

    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.sp-tab');
      if (!btn) return;
      var i = btn.getAttribute('data-i');
      tabs.querySelectorAll('.sp-tab').forEach(function (t) { t.classList.toggle('active', t === btn); });
      panels.querySelectorAll('.sp-panel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-i') === i); });
    });
  }

  function scrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.15 });
    els.forEach(function (el) { obs.observe(el); });
  }

  function countUp() {
    var nums = document.querySelectorAll('.sp-count');
    if (reduce) { nums.forEach(function (n) { n.textContent = n.getAttribute('data-target'); }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target, target = parseInt(n.getAttribute('data-target'), 10), start = null, dur = 1100;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          n.textContent = Math.round(p * target);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.unobserve(n);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { obs.observe(n); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildIndustries();
    scrollReveal();
    countUp();
  });
})();
