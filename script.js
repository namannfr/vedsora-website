/* Vedsora website: page switching and interactions (plain JavaScript, no libraries) */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pendingAudience = null;

  /* ---- pages: each page is a <div data-page="name">; the URL hash picks one ---- */
  var pages = $$('[data-page]');
  var main = document.getElementById('main');
  var menuBtn = document.getElementById('menu-btn');
  var mnav = document.getElementById('mnav');

  function closeMenu() { mnav.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu'; }

  function showPage(scroll) {
    var name = (location.hash || '').replace('#', '');
    if (!pages.some(function (p) { return p.dataset.page === name; })) name = 'home';
    pages.forEach(function (p) { p.hidden = p.dataset.page !== name; });
    $$('.nav a, .mnav a').forEach(function (a) {
      if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
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

  /* ---- audience-specific buttons remember who clicked ---- */
  $$('a[data-aud]').forEach(function (a) {
    a.addEventListener('click', function () { pendingAudience = a.dataset.aud; });
  });

  /* ---- ledger entry demo ---- */
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

  /* ---- six activity layers (tabs) ---- */
  $$('[data-layers]').forEach(function (box) {
    var tabs = $$('[role="tab"]', box), panels = $$('[role="tabpanel"]', box);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x, n) { x.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
        panels.forEach(function (p, n) { p.hidden = n !== i; });
      });
    });
  });

  /* ---- expandable audience cards (one open at a time per list) ---- */
  $$('.acc > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      $$('.acc > button', btn.parentNode.parentNode).forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.hidden = true;
        b.querySelector('.pm').textContent = '+';
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.hidden = false;
        btn.querySelector('.pm').textContent = '−';
      }
    });
  });

  /* ---- flywheel ---- */
  $$('[data-fly]').forEach(function (fly) {
    var dots = $$('.fly-dot', fly), items = $$('.fly-list li', fly);
    var num = fly.querySelector('[data-fly-n]'), txt = fly.querySelector('[data-fly-t]');
    var cur = 0, hold = false;
    function set(i) {
      cur = i;
      dots.forEach(function (d, n) { d.classList.toggle('on', n === i); });
      items.forEach(function (li, n) { li.classList.toggle('on', n === i); });
      num.textContent = 'Step ' + (i + 1) + ' of ' + dots.length;
      txt.textContent = items[i].querySelector('b').textContent;
    }
    dots.forEach(function (d, n) { d.addEventListener('click', function () { hold = true; set(n); }); });
    fly.addEventListener('mouseenter', function () { hold = true; });
    fly.addEventListener('mouseleave', function () { hold = false; });
    if (!reduced) setInterval(function () { if (!hold && fly.offsetParent !== null) set((cur + 1) % dots.length); }, 2400);
  });

  /* ---- contact form ---- */
  var form = document.getElementById('contact-form');
  var chips = $$('.chips button', form);
  var submit = document.getElementById('contact-submit');
  var notice = document.getElementById('contact-notice');
  var alias = { academies: 'hubs', brokers: 'partners', owners: 'learners' };
  function selectAudience(key) {
    key = alias[key] || key;
    var hit = chips.filter(function (c) { return c.dataset.key === key; })[0];
    if (!hit) return;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c === hit ? 'true' : 'false'); });
    submit.textContent = hit.dataset.cta;
    notice.hidden = true;
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { selectAudience(c.dataset.key); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    /* TODO before launch: send the form data to your form endpoint here. */
    notice.hidden = false;
  });

  showPage(false);
})();
