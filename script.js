/* Vedsora website: page switching and interactions (plain JavaScript, no libraries) */
(function () {
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var CONTACT_EMAIL = 'info@vedsora.com';
  var pendingAudience = null;

  /* ---- per-page titles and descriptions (the site is one HTML file; the URL hash picks a page) ---- */
  var meta = {
    home: ['Vedsora | A trusted record of freelance music work', 'Vedsora is a UK record-of-work platform for freelance musicians and the organisations that pay them. Each income line is matched against the agreement, the payer’s confirmation and the bank credit, then given an evidence grade.'],
    why: ['Why Vedsora | Vedsora', 'Freelance musicians receive no payer-issued record of their work. Why the record has to start with the payer, and where existing tools stop.'],
    how: ['How it works | Vedsora', 'Organiser statements, musician imports and payer confirmations are matched for every income line and graded A, B or C.'],
    organisations: ['For organisers | Organiser Payment Schedule | Vedsora', 'For temples, gurdwaras, cultural associations, academies and festivals: keep a schedule of the musicians you pay and issue dated Engagement Statements.'],
    musicians: ['For musicians | Musician Ledger | Vedsora', 'For self-employed music teachers and performers: one graded ledger of all your income, confirmed by the people who paid you.'],
    accountants: ['For accountants | Accountant Pack | Vedsora', 'Reconciled quarterly and year-end income schedules for musician clients, with the evidence, tax-treatment flag and rule version behind every line.'],
    innovation: ['Innovation | Three-way matching | Vedsora', 'Three-way matching of agreement, payer confirmation and bank credit, payer-issued Engagement Statements, retroactive confirmation and classification provenance.'],
    founder: ['Founder | Uttam Patil | Vedsora', 'Uttam Patil, founder and chief executive of Vedsora: finance operations and reconciliation professional, tabla performer and teacher.'],
    roadmap: ['Roadmap | Vedsora', 'What exists today, what is under way and what is planned: a focused London launch, then Birmingham and Leicester.'],
    about: ['About | Vedsora Limited', 'Vedsora Limited (company number 17536413): vision, mission, operating principles and business model.'],
    contact: ['Contact | Vedsora', 'Contact Vedsora: info@vedsora.com, 07796 135634. Vedsora Limited, 128 City Road, London EC1V 2NX.'],
    privacy: ['Privacy | Vedsora', 'Interim privacy notice for the Vedsora website.'],
    terms: ['Terms | Vedsora', 'Interim terms for the Vedsora website.'],
    safeguarding: ['Safeguarding | Vedsora', 'Interim safeguarding notice for Vedsora.'],
    'data-protection': ['Data protection | Vedsora', 'Interim data protection notice for Vedsora.']
  };
  var descTag = document.querySelector('meta[name="description"]');

  /* ---- pages ---- */
  var pages = $$('[data-page]');
  var main = document.getElementById('main');
  var menuBtn = document.getElementById('menu-btn');
  var mnav = document.getElementById('mnav');

  function closeMenu() { mnav.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu'; }

  function showPage(scroll) {
    var name = (location.hash || '').replace('#', '');
    if (name === 'main') return; /* skip link */
    if (!pages.some(function (p) { return p.dataset.page === name; })) name = 'home';
    pages.forEach(function (p) { p.hidden = p.dataset.page !== name; });
    $$('.nav a, .mnav a').forEach(function (a) {
      if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (meta[name]) { document.title = meta[name][0]; if (descTag) descTag.setAttribute('content', meta[name][1]); }
    closeMenu();
    if (name === 'contact' && pendingAudience) { selectAudience(pendingAudience); pendingAudience = null; }
    if (scroll) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', function () { showPage(true); });

  menuBtn.addEventListener('click', function () {
    var open = mnav.hidden;
    mnav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Close' : 'Menu';
  });

  /* ---- audience-specific buttons preselect the contact form ---- */
  $$('a[data-aud]').forEach(function (a) {
    a.addEventListener('click', function () { pendingAudience = a.dataset.aud; });
  });

  /* ---- one income line, step by step ---- */
  $$('[data-demo]').forEach(function (demo) {
    var btns = $$('.steps button', demo), rows = $$('.rec-row', demo), replay = demo.querySelector('[data-replay]');
    var last = btns.length - 1, timer = null;
    function set(step) {
      btns.forEach(function (b, i) {
        b.className = i === step ? 'cur' : (i < step ? 'done' : '');
        if (i === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      rows.forEach(function (r, i) { r.classList.toggle('off', i > step); });
    }
    function stop() { clearTimeout(timer); timer = null; replay.textContent = 'Replay step by step'; }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { stop(); set(i); }); });
    replay.addEventListener('click', function () {
      stop(); var s = 0; set(0); replay.textContent = 'Playing…';
      (function next() { timer = setTimeout(function () { s++; set(s); if (s < last) next(); else stop(); }, 1100); })();
    });
    set(last);
  });

  /* ---- evidence grade explorer: A = all three agree; B = payer confirmation plus one other; C = no payer confirmation ---- */
  $$('[data-grader]').forEach(function (box) {
    var btns = $$('[data-src]', box);
    var badge = box.querySelector('[data-g-badge]'), title = box.querySelector('[data-g-title]'), text = box.querySelector('[data-g-text]');
    function on(key) { return btns.filter(function (b) { return b.dataset.src === key; })[0].getAttribute('aria-pressed') === 'true'; }
    function update() {
      var conf = on('confirmation'), others = (on('agreement') ? 1 : 0) + (on('bank') ? 1 : 0), g, t, d;
      if (!conf) { g = 'c'; t = 'Grade C'; d = 'No payer confirmation. Counted in tax figures, shown as unconfirmed and excluded from evidence totals.'; }
      else if (others === 2) { g = 'a'; t = 'Grade A'; d = 'All three sources agree.'; }
      else if (others === 1) { g = 'b'; t = 'Grade B'; d = 'The payer’s confirmation agrees with one of the other two sources.'; }
      else { g = 'r'; t = 'Review queue'; d = 'A confirmation with nothing to match it against goes to review before it is graded.'; }
      badge.className = 'grade ' + g; badge.textContent = g === 'r' ? '?' : g.toUpperCase();
      title.textContent = t; text.textContent = d;
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); update(); });
    });
    update();
  });

  /* ---- contact form ----
     If data-endpoint is set on the form (e.g. a form service or an Azure Function URL), the form is POSTed there
     and success is shown only when the endpoint answers with a 2xx status. With no endpoint, the form opens the
     visitor's email app with the message addressed to CONTACT_EMAIL, and says plainly that nothing has been sent yet. */
  var form = document.getElementById('contact-form');
  var chips = $$('.chips button', form);
  var roleInput = document.getElementById('f-role');
  var submit = document.getElementById('contact-submit');
  var notice = document.getElementById('contact-notice');
  var endpoint = (form.getAttribute('data-endpoint') || '').trim();

  function selectAudience(key) {
    var hit = chips.filter(function (c) { return c.dataset.key === key; })[0];
    if (!hit) return;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c === hit ? 'true' : 'false'); });
    roleInput.value = hit.dataset.label;
    notice.hidden = true;
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { selectAudience(c.dataset.key); }); });

  var checks = [
    ['f-name', 'e-name', function (el) { return el.value.trim().length > 0; }],
    ['f-email', 'e-email', function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()); }],
    ['f-msg', 'e-msg', function (el) { return el.value.trim().length >= 10; }],
    ['f-consent', 'e-consent', function (el) { return el.checked; }]
  ];
  function validate() {
    var first = null;
    checks.forEach(function (c) {
      var el = document.getElementById(c[0]), err = document.getElementById(c[1]), ok = c[2](el);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      err.hidden = ok;
      if (!ok && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  checks.forEach(function (c) {
    var el = document.getElementById(c[0]);
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (el.getAttribute('aria-invalid') === 'true' && c[2](el)) { el.setAttribute('aria-invalid', 'false'); document.getElementById(c[1]).hidden = true; }
    });
  });

  function show(kind, html) { notice.className = 'notice ' + kind; notice.innerHTML = html; notice.hidden = false; }
  var direct = 'You can also email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a> or call <a href="tel:+447796135634">07796 135634</a>.';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    notice.hidden = true;
    if (!validate()) return;
    var v = function (id) { return document.getElementById(id).value.trim(); };
    if (form.querySelector('[name="company_website"]').value) return; /* honeypot: silently ignore bots */
    var data = { role: roleInput.value, name: v('f-name'), email: v('f-email'), organisation: v('f-org'), message: v('f-msg') };

    if (!endpoint) {
      var body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nI am: ' + data.role + (data.organisation ? '\nOrganisation: ' + data.organisation : '') + '\n\n' + data.message;
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Website enquiry: ' + data.role) + '&body=' + encodeURIComponent(body);
      show('', '<b>Your email app should now open with this message addressed to ' + CONTACT_EMAIL + '.</b> It is sent only when you press send there. If nothing opened, email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a> directly or call <a href="tel:+447796135634">07796 135634</a>.');
      return;
    }

    submit.disabled = true; submit.textContent = 'Sending…';
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset(); selectAudience('organiser');
        show('ok', '<b>Thank you. Your message has been sent.</b> We will reply to ' + data.email.replace(/</g, '&lt;') + '.');
      })
      .catch(function () { show('bad', '<b>Your message could not be sent.</b> Please try again. ' + direct); })
      .then(function () { submit.disabled = false; submit.textContent = 'Send message'; });
  });

  showPage(false);
})();
