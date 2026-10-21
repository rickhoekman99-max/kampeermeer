/* Kampeer & Meer — kleine interacties. Geen dependencies. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Sticky header: krimpt na scrollen --- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Dropdown Werkplaats (klik/toets; hover via CSS) --- */
  document.querySelectorAll('[data-dropdown]').forEach(function (item) {
    var toggle = item.querySelector('.nav__toggle');
    if (!toggle) return;
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) setOpen(false);
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) setOpen(false);
    });
  });

  /* --- Mobiel menu (fullscreen) --- */
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.querySelector('[data-menu-open]');
  if (menu && openBtn) {
    var closeBtn = menu.querySelector('[data-menu-close]');
    var openMenu = function () {
      menu.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      closeBtn.focus();
    };
    var closeMenu = function () {
      menu.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      openBtn.focus();
    };
    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') return closeMenu();
      if (e.key !== 'Tab') return;
      // Focus binnen het menu houden.
      var f = menu.querySelectorAll('a[href], button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches && !menu.hidden) closeMenu();
    });
  }

  /* --- Openingstijden van vandaag (beide vestigingen gelijk) --- */
  var HOURS = { 0: null, 1: '07:30–18:00', 2: '07:30–18:00', 3: '07:30–18:00', 4: '07:30–18:00', 5: '07:30–18:00', 6: '08:30–12:00' };
  var today = HOURS[new Date().getDay()];
  document.querySelectorAll('[data-hours-today]').forEach(function (el) {
    el.textContent = today ? 'Vandaag open ' + today : 'Vandaag gesloten';
  });

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- Dienst voorselecteren via ?dienst= --- */
  var dienst = new URLSearchParams(location.search).get('dienst');
  if (dienst) {
    document.querySelectorAll('select[name="dienst"]').forEach(function (sel) {
      var opt = sel.querySelector('option[value="' + CSS.escape(dienst) + '"]');
      if (opt) sel.value = dienst;
    });
  }

  /* --- Verhuur: product voorselecteren via de knop Reserveren --- */
  document.querySelectorAll('[data-product]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sel = document.getElementById('res-product');
      if (sel) sel.value = btn.getAttribute('data-product');
    });
  });

  /* --- Scroll-animaties --- */
  var reveal = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  }
})();
