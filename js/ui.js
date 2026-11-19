/* Thin DOM layer shared by every screen. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  var doc = document;

  // Not cached: screens are re-rendered wholesale, so ids get new nodes.
  function ref(id) { return doc.getElementById(id); }

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Replaces the screen contents. `opts.task` switches to the no-scroll
      layout used by the trial screens. */
  function render(html, opts) {
    opts = opts || {};
    var screen = ref('screen');
    screen.className = 'screen' + (opts.task ? ' screen--task' : '');
    doc.body.classList.toggle('is-task', !!opts.task);
    screen.innerHTML = html;
    if (!opts.keepScroll) global.scrollTo(0, 0);
    if (opts.focus !== false) screen.focus({ preventScroll: true });
    return screen;
  }

  function setProgress(fraction, label) {
    // The topbar itself stays visible on every screen so the theme toggle is
    // always reachable; only the progress group is shown once there is progress.
    var bar = ref('topbar');
    bar.hidden = false;
    var progress = ref('topbarProgress');
    if (fraction === null) {
      if (progress) progress.hidden = true;
      return;
    }
    if (progress) progress.hidden = false;
    var pct = Math.max(0, Math.min(1, fraction)) * 100;
    ref('progressFill').style.width = pct.toFixed(1) + '%';
    var wrap = $('.progressbar');
    if (wrap) wrap.setAttribute('aria-valuenow', Math.round(pct));
    ref('progressLabel').textContent = label || '';
  }

  function setFooter(text) {
    ref('footerNote').textContent = text;
  }

  /* --------------------------------------------------------- feedback flash */

  var feedbackTimer = null;

  /** Full-bleed green/red correctness screen used during the training phase. */
  function flash(isCorrect, subtitle, ms) {
    return new Promise(function (resolve) {
      var box = ref('feedback');
      clearTimeout(feedbackTimer);

      box.className = 'feedback ' + (isCorrect ? 'feedback--correct' : 'feedback--wrong');
      ref('feedbackIcon').textContent = isCorrect ? '\u2713' : '\u2717';
      ref('feedbackTitle').textContent = isCorrect ? 'Correct' : 'Wrong';
      ref('feedbackSub').textContent = subtitle || '';
      box.hidden = false;

      // Force a reflow so the opacity transition actually runs.
      void box.offsetWidth;
      box.classList.add('is-on');

      feedbackTimer = setTimeout(function () {
        box.classList.remove('is-on');
        setTimeout(function () {
          box.hidden = true;
          resolve();
        }, 110);
      }, ms || RAI.config.feedbackMs);
    });
  }

  function hideFlash() {
    clearTimeout(feedbackTimer);
    var box = ref('feedback');
    box.classList.remove('is-on');
    box.hidden = true;
  }

  /* ------------------------------------------------------------- keyboard */

  /** Registers a keydown handler and returns a disposer. */
  function keys(map) {
    function onKey(e) {
      if (e.defaultPrevented || e.repeat) return;
      var target = e.target;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      var fn = map[e.key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    }
    doc.addEventListener('keydown', onKey);
    return function () { doc.removeEventListener('keydown', onKey); };
  }

  function on(selOrEl, type, handler, root) {
    var node = typeof selOrEl === 'string' ? $(selOrEl, root) : selOrEl;
    if (node) node.addEventListener(type, handler);
    return node;
  }

  function delay(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function pct(x) {
    return x === null || x === undefined ? '—' : Math.round(x * 100) + '%';
  }

  RAI.ui = {
    $: $, $$: $$, on: on, ref: ref,
    render: render,
    escapeHtml: escapeHtml,
    setProgress: setProgress,
    setFooter: setFooter,
    flash: flash,
    hideFlash: hideFlash,
    keys: keys,
    delay: delay,
    pct: pct
  };
})(window);
