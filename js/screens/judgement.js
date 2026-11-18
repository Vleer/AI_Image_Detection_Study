/* The trial runner.

   One function drives every block of images. P3 and P5 run it with feedback
   switched off; P4 runs it with a neutral self-paced feedback page. Keeping
   a single implementation means the pre- and post-test are guaranteed to be
   identical apart from the feedback itself. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  function btn(rating, label) {
    return '<button class="answer" id="btn' + rating + '" type="button" data-rating="' + rating + '">' +
      '<span class="answer__label">' + label + '</span>' +
      '</button>';
  }

  function layout(opts) {
    return '' +
      '<div class="trial">' +
        '<div class="trial__head">' +
          (opts.phaseLabel ? '<div class="trial__phase">' + RAI.ui.escapeHtml(opts.phaseLabel) + '</div>' : '') +
          (opts.explanation ? '<div class="trial__explanation muted">' + RAI.ui.escapeHtml(opts.explanation) + '</div>' : '') +
          '<div class="trial__question">' + opts.question + '</div>' +
          '<div class="trial__counter" id="trialCounter"></div>' +
        '</div>' +
        '<div class="trial__stage">' +
          '<img class="trial__img" id="trialImg" alt="Image to judge" draggable="false">' +
        '</div>' +
        '<div class="trial__result hidden" id="trialResult"></div>' +
        '<div class="trial__foot">' +
          '<div class="answers">' +
            btn(1, 'Definitely real') +
            btn(2, 'Most likely real') +
            btn(3, 'Most likely AI') +
            btn(4, 'Definitely AI') +
          '</div>' +
          '<div class="keyhint">Use keys 1\u20134 to answer</div>' +
        '</div>' +
      '</div>';
  }

  function feedbackLayout(text) {
    return '<div class="prose prose--narrow">' +
      '<div class="card center">' +
        '<div class="eyebrow">Feedback</div>' +
        '<p class="lead" style="margin:1.25rem 0">' + RAI.ui.escapeHtml(text) + '</p>' +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn--primary btn--lg" id="continueFeedback">Continue</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /**
   * Runs one block of trials to completion.
   */
  function runBlock(opts) {
    var ui = RAI.ui;
    var cfg = RAI.config;
    var trials = opts.trials;

    var resolveBlock;
    var done = new Promise(function (res) { resolveBlock = res; });

    var i = 0;
    var shownAt = 0;
    var accepting = false;
    var offKeys = null;
    var offVisibility = null;

    var img = null;
    var counter = null;
    var result = null;
    var buttons = [];

    function bindControls() {
      buttons = [1, 2, 3, 4].map(function (r) { return ui.$('#btn' + r); });
      buttons.forEach(function (b) {
        if (!b) return;
        b.addEventListener('click', function () {
          answer(+b.getAttribute('data-rating'), 'click');
        });
      });
    }

    function renderTrialLayout() {
      ui.render(layout({ question: opts.question, phaseLabel: opts.phaseLabel, explanation: opts.explanation }), { task: true });
      img = ui.$('#trialImg');
      counter = ui.$('#trialCounter');
      result = ui.$('#trialResult');
      bindControls();
    }

    function updateProgress() {
      var frac = opts.progressBase + opts.progressSpan * (i / trials.length);
      ui.setProgress(frac, opts.step + ' \u00b7 ' + Math.min(i + 1, trials.length) + '/' + trials.length);
    }

    function setEnabled(on) {
      buttons.forEach(function (b) { if (b) b.disabled = !on; });
    }

    function beginTrial() {
      if (i >= trials.length) return finish();
      var trial = trials[i];
      counter.textContent = 'Image ' + (i + 1) + ' of ' + trials.length;
      updateProgress();

      accepting = false;
      setEnabled(false);
      img.style.visibility = 'hidden';
      img.src = trial.src;

      if (result) { result.classList.add('hidden'); result.innerHTML = ''; }

      var reveal = function () {
        img.style.visibility = 'visible';
        shownAt = performance.now();
        setEnabled(true);
        setTimeout(function () { accepting = true; }, cfg.responseLockoutMs);
      };

      if (img.complete && img.naturalWidth) reveal();
      else img.onload = img.onerror = reveal;

      for (var k = 1; k <= 5; k++) {
        if (trials[i + k]) RAI.stimuli.preload(trials[i + k].src);
      }    }

    function showTrial() {
      renderTrialLayout();
      beginTrial();
    }

    function answer(rating, inputMethod) {
      if (!accepting) return;
      accepting = false;

      var trial = trials[i];
      var response = rating >= 3 ? 'ai' : 'real';
      var correct = (response === 'ai') === trial.isAI;
      var rt = Math.round(performance.now() - shownAt);

      var armed = ui.$('#btn' + rating);
      if (armed) armed.classList.add('is-armed');
      setEnabled(false);

      var attentionPassed = trial.isAttentionCheck ? (rating >= 3) : null;

      RAI.store.logTrial({
        phase: trial.phase,
        block: trial.block,
        blockRatio: trial.blockRatio,
        index: trial.index,
        bucketId: trial.bucketId,
        category: trial.category,
        variant: trial.variant,
        isAI: trial.isAI,
        isAttentionCheck: !!trial.isAttentionCheck,
        attentionPassed: attentionPassed,
        rating: rating,
        response: response,
        correct: correct,
        rtMs: rt,
        inputMethod: inputMethod,
        feedbackShown: !!opts.showFeedback
      });

      i++;

      function cleanupArmed() {
        [1, 2, 3, 4].forEach(function (r) {
          var b = ui.$('#btn' + r);
          if (b) { b.classList.remove('is-armed'); b.classList.remove('is-correct'); b.classList.remove('is-wrong'); }
        });
      }

      var after = function () {
        cleanupArmed();
        showTrial();
      };

      if (opts.showFeedback) {
        var truth = trial.isAI ? 'This image was AI-generated.' : 'This image was real.';
        var armedBtn = ui.$('#btn' + rating);
        if (armedBtn) {
          armedBtn.classList.remove('is-armed');
          armedBtn.classList.add(correct ? 'is-correct' : 'is-wrong');
        }
        if (result) {
          result.classList.remove('hidden');
          result.innerHTML =
            '<div class="trial__result-text ' + (correct ? 'trial__result-text--correct' : 'trial__result-text--wrong') + '">' +
              RAI.ui.escapeHtml(truth) +
            '</div>' +
            '<div class="btn-row" style="justify-content:center;margin-top:.75rem">' +
              '<button class="btn btn--primary" id="continueFeedback">Continue</button>' +
            '</div>';
        }
        var cont = ui.$('#continueFeedback');
        var offFb = null;
        var proceed = function () {
          if (offFb) offFb();
          if (cont) cont.removeEventListener('click', proceed);
          after();
        };
        if (cont) cont.addEventListener('click', proceed);
        offFb = ui.keys({ Enter: proceed, ' ': proceed });
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
    [1, 2, 3, 4].forEach(function (r) {
      keyMap[String(r)] = function () { answer(r, 'key'); };
    });
    offKeys = ui.keys(keyMap);

    // Loading state + preload all images for this phase before first trial.
    ui.render('<div class="prose prose--narrow"><div class="card center"><p>Loading images\u2026</p></div></div>');
    offVisibility = function () {
      RAI.store.logEvent(document.hidden ? 'page_hidden' : 'page_visible', {
        phase: opts.step, trialIndex: i
      });
    };
    document.addEventListener('visibilitychange', offVisibility);

    RAI.stimuli.preloadAll(trials).then(function () {
      renderTrialLayout();
      beginTrial();
    });

    return done;
  }

  RAI.screens.judgement = { runBlock: runBlock };
})(window);