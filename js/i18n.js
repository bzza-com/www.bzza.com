/* i18n.js - lightweight client-side internationalization for Bzza Projects Hub */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru'];
  var LS_KEY = 'lang';
  var dict = {};
  var current = 'en';
  var ready = false;

  function normalize(raw) {
    if (!raw) return null;
    raw = String(raw).toLowerCase().replace(/_/g, '-').trim();
    for (var i = 0; i < SUPPORTED.length; i++) {
      if (SUPPORTED[i].toLowerCase() === raw) return SUPPORTED[i];
    }
    var base = raw.split('-')[0];
    for (var j = 0; j < SUPPORTED.length; j++) {
      if (SUPPORTED[j].toLowerCase() === base) return SUPPORTED[j];
    }
    if (raw.indexOf('zh') === 0) {
      if (raw.indexOf('tw') > -1 || raw.indexOf('hk') > -1 || raw.indexOf('mo') > -1) return 'zh-TW';
      return 'zh-CN';
    }
    if (raw === 'en' || raw.indexOf('en') === 0) return 'en';
    return null;
  }

  function detect() {
    try {
      var saved = normalize(localStorage.getItem(LS_KEY));
      if (saved) return saved;
    } catch (e) {}
    var nav = [];
    if (navigator.languages && navigator.languages.length) nav = navigator.languages;
    else if (navigator.language) nav = [navigator.language];
    for (var i = 0; i < nav.length; i++) {
      var hit = normalize(nav[i]);
      if (hit) return hit;
    }
    var ssr = normalize(document.documentElement.getAttribute('lang'));
    if (ssr) return ssr;
    return 'en';
  }

  function applyDOM() {
    document.documentElement.setAttribute('lang', current);
    forEach('[data-i18n]', function (el) {
      var v = lookup(el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    forEach('[data-i18n-ph]', function (el) {
      var v = lookup(el.getAttribute('data-i18n-ph'));
      if (v != null) el.setAttribute('placeholder', v);
    });
    forEach('[data-i18n-html]', function (el) {
      var v = lookup(el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    forEach('[data-i18n-title]', function (el) {
      var v = lookup(el.getAttribute('data-i18n-title'));
      if (v != null) document.title = v;
    });
    forEach('.lang-switch [data-lang]', function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
    });
  }

  function lookup(key) {
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return null;
  }

  function forEach(sel, fn) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  window.t = function (key) {
    if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return key;
  };

  window.setLang = function (code) {
    code = normalize(code) || 'en';
    if (code === current && ready) { emit(); return; }
    load(code, function () {
      try { localStorage.setItem(LS_KEY, code); } catch (e) {}
      current = code;
      applyDOM();
      window.__LANG__ = code;
      window.__I18N__ = dict;
      ready = true;
      emit();
      document.documentElement.classList.add('i18n-ready');
      if (typeof window.onLangReady === 'function') window.onLangReady();
    });
  };

  function emit() {
    document.dispatchEvent(new CustomEvent('languagechange', { detail: current }));
  }

  function load(code, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'i18n/' + code + '.json', true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var data;
      if (xhr.status === 200) {
        data = typeof xhr.response === 'string' ? safeParse(xhr.response) : xhr.response;
      }
      if (!data) {
        if (code !== 'en') { load('en', cb); return; }
        data = {};
      }
      dict = data;
      cb();
    };
    xhr.send();
  }

  function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  window.__I18N__ = dict;
  window.__LANG__ = 'en';
  current = detect();
  document.documentElement.classList.remove('i18n-nojs');

  function boot() {
    load(current, function () {
      window.__I18N__ = dict;
      window.__LANG__ = current;
      applyDOM();
      ready = true;
      emit();
      document.documentElement.classList.add('i18n-ready');
      if (typeof window.onLangReady === 'function') window.onLangReady();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.lang-switch [data-lang]');
    if (!b) return;
    e.preventDefault();
    window.setLang(b.getAttribute('data-lang'));
  });
})();
