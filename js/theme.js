/* Light/dark theme toggle.

   The initial theme is resolved inline in <head> before first paint: an
   explicit choice saved in localStorage wins, otherwise the OS setting
   (prefers-color-scheme) is used. This module wires the topbar button and
   keeps following the OS until the participant chooses explicitly. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  var KEY = 'raic-theme';

  function root() { return document.documentElement; }

  function current() { return root().getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function stored() {
    try { return global.localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(theme) {
    root().setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) {
      var next = theme === 'dark' ? 'light' : 'dark';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      btn.setAttribute('title', 'Switch to ' + next + ' theme');
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { global.localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  }

  function init() {
    apply(current());

    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggle);

    // Follow the OS while the participant has not chosen explicitly.
    if (global.matchMedia) {
      var mq = global.matchMedia('(prefers-color-scheme: light)');
      var onChange = function () { if (!stored()) apply(mq.matches ? 'light' : 'dark'); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  RAI.theme = { current: current, toggle: toggle, apply: apply };
})(window);
