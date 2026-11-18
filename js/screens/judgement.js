/* The trial runner.

   One function drives every block of images. P3 and P5 run it with feedback
   switched off; P4 runs it with the full-screen green/red feedback on. Keeping
   a single implementation means the pre- and post-test are guaranteed to be
   identical apart from the feedback itself. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  var LEFT_KEYS = ['ArrowLeft', 'a', 'A'];
  var RIGHT_KEYS = ['ArrowRight', 'l', 'L'];

  function layout(opts) {
    return '' +
      '<div class="trial">' +
        '<div class="trial__head">' +
          '<div class="trial__question">' + opts.question + '</div>' +
          '<div class="trial__counter" id="trialCounter"></div>' +
        '</div>' +
        '<div class="trial__stage">' +
          '<img class="trial__img" id="trialImg" alt="Image to judge" draggable="false">' +
        '</div>' +
        '<div class="trial__foot">' +
          '<div class="answers">' +
            '<button class="answer answer--ai" id="btnAi" type="button">' +
              '<span class="answer__key"><span class="kbd">&larr;</span></span>' +
              '<span class="answer__label">AI-generated</span>' +
            '</button>' +
            '<button class="answer answer--real" id="btnReal" type="button">' +
              '<span class="answer__key"><span class="kbd">&rarr;</span></span>' +
              '<span class="answer__label">Real photo</span>' +
            '</button>' +
          '</div>' +
          '<div class="keyhint">' +
            'Use <span class="kbd">&larr;</span> and <span class="kbd">&rarr;</span> to answer without the mouse' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /**
   * Runs one block of trials to completion.
   * @param {object} opts
   * @param {Array}  opts.trials
   * @param {boolean} opts.showFeedback
   * @param {string} opts.question       prompt shown above the image
   * @param {string} opts.step           progress label
   * @param {number} opts.progressBase   progress bar value at block start (0-1)
   * @param {number} opts.progressSpan   how much of the bar this block covers
   * @returns {Promise<void>}
   */
  function runBlock(opts) {
    var ui = RAI.ui;
    var cfg = RAI.config;
    var trials = opts.trials;

    ui.render(layout({ question: opts.question }), { task: true });

    // These live inside the screen, which is replaced on every render, so they
    // are looked up fresh rather than through the shell-element cache.
    var img = ui.$('#trialImg');
    var counter = ui.$('#trialCounter');
    var btnAi = ui.$('#btnAi');
    var btnReal = ui.$('#btnReal');

    var i = 0;
    var shownAt = 0;
    var accepting = false;
    var offKeys = null;
    var offVisibility = null;
    var resolveBlock;

    var done = new Promise(function (res) { resolveBlock = res; });

    function updateProgress() {
      var frac = opts.progressBase + opts.progressSpan * (i / trials.length);
      ui.setProgress(frac, opts.step + ' \u00b7 ' + Math.min(i + 1, trials.length) + '/' + trials.length);
    }

    function setEnabled(on) {
      btnAi.disabled = !on;
      btnReal.disabled = !on;
      if (!on) {
        btnAi.classList.remove('is-armed');
        btnReal.classList.remove('is-armed');
      }
    }

    function showTrial() {
      if (i >= trials.length) return finish();

      var trial = trials[i];
      counter.textContent = 'Image ' + (i + 1) + ' of ' + trials.length;
      updateProgress();

      accepting = false;
      setEnabled(false);
      img.style.visibility = 'hidden';
      img.src = trial.src;

      var reveal = function () {
        img.style.visibility = 'visible';
        shownAt = performance.now();
        setEnabled(true);
        // Short lockout so a carried-over keypress cannot answer the next image.
        setTimeout(function () { accepting = true; }, cfg.responseLockoutMs);
      };

      if (img.complete && img.naturalWidth) reveal();
      else img.onload = img.onerror = reveal;

      // Warm the next image so it appears instantly.
      if (trials[i + 1]) RAI.stimuli.preload(trials[i + 1].src);
    }

    function answer(response, inputMethod) {
      if (!accepting) return;
      accepting = false;

      var trial = trials[i];
      var rt = Math.round(performance.now() - shownAt);
      var correct = (response === 'ai') === trial.isAI;

      (response === 'ai' ? btnAi : btnReal).classList.add('is-armed');
      setEnabled(false);

      RAI.store.logTrial({
        phase: trial.phase,
        block: trial.block,
        blockRatio: trial.blockRatio,
        index: trial.index,
        bucketId: trial.bucketId,
        category: trial.category,
        variant: trial.variant,
        isAI: trial.isAI,
        response: response,
        correct: correct,
        rtMs: rt,
        inputMethod: inputMethod,
        feedbackShown: !!opts.showFeedback
      });

      i++;

      var after = function () {
        btnAi.classList.remove('is-armed');
        btnReal.classList.remove('is-armed');
        showTrial();
      };

      if (opts.showFeedback) {
        var truth = trial.isAI ? 'That one was AI-generated' : 'That one was a real photograph';
        ui.flash(correct, truth).then(function () {
          return ui.delay(80);
        }).then(after);
      } else {
        ui.delay(cfg.interTrialMs).then(after);
      }
    }

    function finish() {
      if (offKeys) offKeys();
      if (offVisibility) document.removeEventListener('visibilitychange', offVisibility);
      ui.setProgress(opts.progressBase + opts.progressSpan, opts.step + ' \u00b7 done');
      document.body.classList.remove('is-task');
      resolveBlock();
    }

    var keyMap = {};
    LEFT_KEYS.forEach(function (k) { keyMap[k] = function () { answer('ai', 'key'); }; });
    RIGHT_KEYS.forEach(function (k) { keyMap[k] = function () { answer('real', 'key'); }; });
    offKeys = ui.keys(keyMap);

    btnAi.addEventListener('click', function () { answer('ai', 'click'); });
    btnReal.addEventListener('click', function () { answer('real', 'click'); });

    // Tab-switching mid-block is worth knowing about when cleaning the data.
    offVisibility = function () {
      RAI.store.logEvent(document.hidden ? 'page_hidden' : 'page_visible', {
        phase: opts.step, trialIndex: i
      });
    };
    document.addEventListener('visibilitychange', offVisibility);

    RAI.stimuli.preloadAll(trials, 3).then(showTrial);

    return done;
  }

  RAI.screens.judgement = { runBlock: runBlock };
})(window);
