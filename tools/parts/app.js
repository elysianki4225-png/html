/* ============================================================
   ORCHARD LINE — interface behaviour
   Vanilla JS · no dependencies
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I18N = window.ORCHARD_I18N || { en: {}, ja: {} };
  const SUPPORTED = ['zh', 'en', 'ja'];

  const ZH = {
    'hero.italic': '从枝头到餐桌，每一步都有据可查。',
    'meta.title': 'ORCHARD LINE 果园航线｜认证果园直供 · 全程冷链果品出口',
    'meta.description': '果园航线（青岛）果蔬进出口有限公司：GLOBALG.A.P. 认证果园直供，GACC 海关注册出口企业，全程温控冷链。阳光玫瑰青提、红富士苹果、赣南脐橙出口日本、东南亚、中东与欧洲。',
    'js.clock': '青岛 {time} · GMT+8',
    'js.copied': '已复制到剪贴板',
    'js.copyFail': '复制失败，请手动选择编号',
    'js.demoLink': '演示站点：该文件暂未提供',
    'js.invalid': '请检查高亮的必填项',
    'js.mailSubject': '出口报价请求 — ORCHARD LINE',
    'js.mailIntro': '以下为本次出口报价请求：',
    'js.quoteSent': '报价请求已生成',
    'js.print': '正在打开打印对话框…'
  };

  const dict = (lang) => (lang === 'zh' ? ZH : (I18N[lang] || {}));

  /* ---------------- i18n ---------------- */
  const translatable = [];
  $$('[data-i18n], [data-i18n-html]').forEach((el) => {
    translatable.push({
      el,
      key: el.getAttribute('data-i18n') || el.getAttribute('data-i18n-html'),
      source: el.innerHTML
    });
  });

  const attrTranslatable = [];
  $$('[data-i18n-attr]').forEach((el) => {
    const pairs = el.getAttribute('data-i18n-attr').split(',').map((p) => p.trim()).filter(Boolean);
    const entries = pairs.map((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      return { attr, key, source: el.getAttribute(attr) || '' };
    });
    attrTranslatable.push({ el, entries });
  });

  let currentLang = 'zh';
  let quoteData = null;

  function applyLang(lang, persist) {
    if (SUPPORTED.indexOf(lang) === -1) lang = 'zh';
    currentLang = lang;
    root.lang = lang === 'zh' ? 'zh-CN' : lang;
    root.setAttribute('data-lang', lang);

    translatable.forEach(({ el, key, source }) => {
      if (lang === 'zh') {
        el.innerHTML = source;
        return;
      }
      const value = dict(lang)[key];
      el.innerHTML = typeof value === 'string' ? value : source;
    });

    attrTranslatable.forEach(({ el, entries }) => {
      entries.forEach(({ attr, key, source }) => {
        if (lang === 'zh') {
          el.setAttribute(attr, source);
          return;
        }
        const value = dict(lang)[key];
        el.setAttribute(attr, typeof value === 'string' ? value : source);
      });
    });

    document.title = dict(lang)['meta.title'] || document.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', dict(lang)['meta.description'] || desc.getAttribute('content'));
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', dict(lang)['meta.title'] || '');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', dict(lang)['meta.description'] || '');

    $$('.lang-switch button').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });

    updateClock();
    if (quoteData) renderQuoteSummary();

    if (persist) {
      try { localStorage.setItem('orchardline-lang', lang); } catch (err) { /* private mode */ }
      try {
        const url = new URL(window.location.href);
        if (lang === 'zh') url.searchParams.delete('lang');
        else url.searchParams.set('lang', lang);
        window.history.replaceState(null, '', url.toString());
      } catch (err) { /* history unavailable */ }
    }
  }

  function t(key) {
    const value = dict(currentLang)[key];
    if (typeof value === 'string') return value;
    const en = dict('en')[key];
    return typeof en === 'string' ? en : key;
  }

  function labelText(key) {
    const el = document.querySelector('[data-i18n="' + key + '"]');
    return el ? el.textContent.replace(/\s*\*\s*$/, '').trim() : key;
  }

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.lang-switch button[data-lang]');
    if (!btn) return;
    applyLang(btn.getAttribute('data-lang'), true);
  });

  /* ---------------- Qingdao clock ---------------- */
  const clockEl = $('#qingdaoClock');
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false
  });
  function updateClock() {
    if (!clockEl) return;
    const time = timeFormatter.format(new Date());
    clockEl.textContent = t('js.clock').replace('{time}', time);
  }
  const langParam = new URLSearchParams(window.location.search).get('lang');
  let savedLang = null;
  try { savedLang = localStorage.getItem('orchardline-lang'); } catch (err) { /* no storage */ }
  applyLang(SUPPORTED.indexOf(langParam) !== -1 ? langParam : (SUPPORTED.indexOf(savedLang) !== -1 ? savedLang : 'zh'), false);
  setInterval(updateClock, 30000);

  /* ---------------- Header, scroll progress ---------------- */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  let scrollQueued = false;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------------- Reveal + counters ---------------- */
  const revealEls = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
    $$('[data-count-to]').forEach((el) => {
      el.textContent = new Intl.NumberFormat('en-US').format(Number(el.getAttribute('data-count-to')));
    });
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    $$('[data-count-to]').forEach((el) => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = Number(el.getAttribute('data-count-to'));
    if (!isFinite(target)) return;
    const duration = 1500;
    const start = performance.now();
    const format = (n) => new Intl.NumberFormat('en-US').format(n);
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = format(target);
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }

  /* ---------------- Navigation spy ---------------- */
  const navLinks = $$('.nav-link[data-nav]');
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute('data-nav')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('data-nav') === entry.target.id;
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------------- Mobile menu ---------------- */
  const mobileMenu = $('#mobileMenu');
  const menuToggle = $('#menuToggle');
  const menuClose = $('#menuClose');
  let menuReturnFocus = null;

  function openMenu() {
    if (!mobileMenu) return;
    menuReturnFocus = document.activeElement;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
    window.setTimeout(() => menuClose && menuClose.focus(), 220);
  }

  function closeMenu(focusToggle) {
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    if (focusToggle !== false) (menuReturnFocus || menuToggle).focus();
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', () => closeMenu());
  if (mobileMenu) {
    $$('a', mobileMenu).forEach((link) => link.addEventListener('click', () => closeMenu(false)));
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu(false);
  });

  /* ---------------- Tabs ---------------- */
  const tabs = $$('.tab[role="tab"]');
  function activateTab(tab, focus) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab, false));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        activateTab(next, true);
      }
    });
  });

  /* ---------------- Toast ---------------- */
  const toast = $('#toast');
  const toastText = $('#toastText');
  let toastTimer = null;
  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  /* ---------------- Copy buttons ---------------- */
  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const text = button.getAttribute('data-copy');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(t('js.copied')))
        .catch(() => showToast(fallbackCopy(text) ? t('js.copied') : t('js.copyFail')));
    } else {
      showToast(fallbackCopy(text) ? t('js.copied') : t('js.copyFail'));
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-demo-link]')) {
      event.preventDefault();
      showToast(t('js.demoLink'));
    }
  });

  /* ---------------- Footer ---------------- */
  const yearEl = $('#copyrightYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const printBtn = $('[data-print]');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      showToast(t('js.print'));
      window.setTimeout(() => window.print(), 450);
    });
  }

  /* ---------------- Route map focus ---------------- */
  const mapBlock = $('.map-block');
  if (mapBlock) {
    const mapSvg = mapBlock.querySelector('.map-visual svg');
    const chips = $$('.map-chip', mapBlock);
    const routes = mapSvg ? $$('.route', mapSvg) : [];
    const dests = mapSvg ? $$('.dest', mapSvg) : [];

    function highlightRoute(id) {
      if (!mapSvg) return;
      mapSvg.classList.toggle('is-focused', Boolean(id));
      routes.forEach((route) => route.classList.toggle('is-active', Boolean(id) && route.classList.contains('route--' + id)));
      dests.forEach((dest) => dest.classList.toggle('is-dim', Boolean(id) && !dest.classList.contains('dest--' + id)));
      chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.getAttribute('data-map-market') === id)));
    }

    chips.forEach((chip) => {
      const id = chip.getAttribute('data-map-market');
      chip.addEventListener('mouseenter', () => highlightRoute(id));
      chip.addEventListener('mouseleave', () => highlightRoute(null));
      chip.addEventListener('focus', () => highlightRoute(id));
      chip.addEventListener('blur', () => highlightRoute(null));
      chip.addEventListener('click', () => highlightRoute(id));
    });
  }

  /* ---------------- Quote modal ---------------- */
  const modal = $('#quoteModal');
  const form = $('#quoteForm');
  const successPanel = $('#quoteSuccess');
  const quoteRefEl = $('#quoteRef');
  const quoteSummaryEl = $('#quoteSummary');
  const mailtoLink = $('#quoteMailto');
  const formStatus = $('#formStatus');
  const consentWrap = $('#consentWrap');
  const productSelect = $('#qProduct');
  let modalReturnFocus = null;
  let modalHideTimer = null;

  const productMap = {
    'shine-muscat': 'Shine Muscat',
    'fuji-apple': 'Fuji Apple',
    'gannan-navel': 'Gannan Navel Orange'
  };

  function openModal(product) {
    if (!modal) return;
    window.clearTimeout(modalHideTimer);
    modalReturnFocus = document.activeElement;
    if (successPanel && !successPanel.hidden) resetQuoteForm();
    if (product && productMap[product] && productSelect) productSelect.value = productMap[product];
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    body.classList.add('modal-open');
    window.setTimeout(() => {
      const first = $('#qCompany');
      if (first) first.focus();
    }, 280);
    document.addEventListener('keydown', onModalKeydown);
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    body.classList.remove('modal-open');
    document.removeEventListener('keydown', onModalKeydown);
    modalHideTimer = window.setTimeout(() => { modal.hidden = true; }, 320);
    if (modalReturnFocus && typeof modalReturnFocus.focus === 'function') modalReturnFocus.focus();
  }

  function onModalKeydown(event) {
    if (!modal || modal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
      .filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open-quote]');
    if (opener) {
      event.preventDefault();
      openModal(opener.getAttribute('data-product'));
      if (mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu(false);
      return;
    }
    if (event.target.closest('[data-close-quote]')) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  function resetQuoteForm() {
    if (!form) return;
    form.reset();
    $$('.field', form).forEach((field) => field.classList.remove('has-error'));
    if (consentWrap) consentWrap.classList.remove('has-error');
    if (formStatus) formStatus.textContent = '';
    form.hidden = false;
    if (successPanel) successPanel.hidden = true;
    quoteData = null;
  }

  function setFieldError(input, hasError) {
    const field = input.closest('.field');
    if (field) field.classList.toggle('has-error', hasError);
    if (input.id === 'qConsent' && consentWrap) consentWrap.classList.toggle('has-error', hasError);
  }

  if (form) {
    $$('input, select, textarea', form).forEach((input) => {
      input.addEventListener('input', () => {
        setFieldError(input, false);
        if (formStatus) formStatus.textContent = '';
      });
      input.addEventListener('change', () => setFieldError(input, false));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const company = $('#qCompany');
      const name = $('#qName');
      const email = $('#qEmail');
      const country = $('#qCountry');
      const product = $('#qProduct');
      const consent = $('#qConsent');
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email.value || '').trim());
      const checks = [
        [company, Boolean(company.value.trim())],
        [name, Boolean(name.value.trim())],
        [email, emailOk],
        [country, Boolean(country.value)],
        [product, Boolean(product.value)],
        [consent, consent.checked]
      ];
      checks.forEach(([input, ok]) => setFieldError(input, !ok));
      const invalid = checks.filter(([, ok]) => !ok);
      if (invalid.length) {
        if (formStatus) formStatus.textContent = t('js.invalid');
        const firstInvalid = invalid[0][0];
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const rows = [
        { key: 'modal.company', value: company.value.trim() },
        { key: 'modal.name', value: name.value.trim() },
        { key: 'modal.email', value: email.value.trim() },
        { key: 'modal.country', value: country.value },
        { key: 'modal.product', value: product.value }
      ];
      const quantity = $('#qQuantity');
      const incoterm = $('#qIncoterm');
      const date = $('#qDate');
      const message = $('#qMessage');
      if (quantity && quantity.value.trim()) rows.push({ key: 'modal.quantity', value: quantity.value.trim() });
      if (incoterm && incoterm.value) rows.push({ key: 'modal.incoterm', value: incoterm.value });
      if (date && date.value) rows.push({ key: 'modal.date', value: date.value });

      const rand = window.crypto && window.crypto.getRandomValues
        ? (window.crypto.getRandomValues(new Uint32Array(1))[0] % 90000) + 10000
        : Math.floor(Math.random() * 90000) + 10000;

      quoteData = {
        rows,
        message: message ? message.value.trim() : '',
        ref: 'RFQ-' + new Date().getFullYear() + '-' + rand
      };

      if (quoteRefEl) quoteRefEl.textContent = quoteData.ref;
      renderQuoteSummary();
      if (mailtoLink) mailtoLink.setAttribute('href', buildMailto());
      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.setAttribute('tabindex', '-1');
        successPanel.focus({ preventScroll: true });
        successPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      }
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function renderQuoteSummary() {
    if (!quoteSummaryEl || !quoteData) return;
    quoteSummaryEl.innerHTML = quoteData.rows.map((row) => (
      '<div><span>' + escapeHtml(labelText(row.key)) + '</span><strong>' + escapeHtml(row.value) + '</strong></div>'
    )).join('');
    if (quoteRefEl) quoteRefEl.textContent = quoteData.ref;
    if (mailtoLink) mailtoLink.setAttribute('href', buildMailto());
  }

  function buildMailto() {
    if (!quoteData) return 'mailto:export@orchardline.cn';
    const lines = quoteData.rows.map((row) => labelText(row.key) + ': ' + row.value);
    if (quoteData.message) lines.push('', labelText('modal.message') + ': ' + quoteData.message);
    const bodyText = t('js.mailIntro') + '\n\n' + lines.join('\n') + '\n\nRef: ' + quoteData.ref;
    return 'mailto:export@orchardline.cn?subject=' + encodeURIComponent(t('js.mailSubject')) + '&body=' + encodeURIComponent(bodyText);
  }

  const copyRefBtn = $('#copyRef');
  if (copyRefBtn) {
    copyRefBtn.addEventListener('click', () => {
      const ref = quoteRefEl ? quoteRefEl.textContent : '';
      if (!ref) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ref).then(() => showToast(t('js.copied'))).catch(() => {
          showToast(fallbackCopy(ref) ? t('js.copied') : t('js.copyFail'));
        });
      } else {
        showToast(fallbackCopy(ref) ? t('js.copied') : t('js.copyFail'));
      }
    });
  }

})();
