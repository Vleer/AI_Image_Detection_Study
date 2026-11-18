/* P4 — Feedback training.

   This is the manipulation. The participant keeps judging images, but now sees
   whether each answer was right or wrong. What varies between conditions is
   the base rate of AI images in the block: 25%, 50% or 75%. Nothing on screen
   mentions the base rate, and the blocks are introduced as "practice with
   feedback" so the participant has no reason to reason about proportions. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  /** Picks the participant's condition and records it on the session. */
  function assignCondition(rng) {
    var cfg = RAI.config;

    if (cfg.forcedPrimingRatio !== null) return [cfg.forcedPrimingRatio];
    if (cfg.primingDesign === 'within') return rng.shuffle(cfg.primingRatios);
    return [rng.pick(cfg.primingRatios)];
  }

  function ratioLabel(r) { return Math.round(r * 100) + '%'; }

  /**
   * Runs every priming block back to back.
   * @param {object} ctx  study context from app.js
   * @param {object} span {base, span} slice of the progress bar to occupy
   */
  function run(ctx, span) {
    var cfg = RAI.config;
    var ui = RAI.ui;
    var ratios = ctx.session.condition.primingRatios;
    var perBlock = span.span / ratios.length;

    var chain = Promise.resolve();

    ratios.forEach(function (ratio, blockIndex) {
      chain = chain.then(function () {
        var trials = RAI.stimuli.buildTrials({
          allocator: ctx.allocator,
          count: cfg.trials.primingBlock,
          aiRatio: ratio,
          phase: 'priming',
          block: blockIndex,
          rng: ctx.rng
        });

        RAI.store.logEvent('priming_block_start', { block: blockIndex, ratio: ratio });

        var isFirst = blockIndex === 0;
        var intro = isFirst
          ? '<p>This next set works the same way, with one difference: after each answer you will ' +
            'be told straight away whether you were right or wrong.</p>' +
            '<p class="muted">Use the feedback however you like. Go with your gut, and keep a ' +
            'steady pace rather than deliberating for a long time on any single image.</p>'
          : '<p>Same again &mdash; another set of images with feedback after each answer.</p>' +
            '<p class="muted">Take a breather if you need one, then continue when you are ready.</p>';

        return showIntro({
          eyebrow: isFirst ? 'Phase 2' : 'Continuing',
          title: isFirst ? 'Phase 2 \u2013 you will now receive feedback' : 'Next set',
          body: intro,
          cta: isFirst ? 'Start' : 'Continue',
          progress: span.base + perBlock * blockIndex,
          step: 'Training ' + (blockIndex + 1) + '/' + ratios.length,
          footer: 'Step 3 of 5'
        }).then(function () {
          return RAI.screens.judgement.runBlock({
            trials: trials,
            showFeedback: true,
            question: 'Is this a real photograph or AI-generated?',
            step: 'Training ' + (blockIndex + 1) + '/' + ratios.length,
            progressBase: span.base + perBlock * blockIndex,
            progressSpan: perBlock
          });
        }).then(function () {
          var stats = RAI.store.summarise(function (t) {
            return t.phase === 'priming' && t.block === blockIndex;
          });
          RAI.store.logEvent('priming_block_end', {
            block: blockIndex, ratio: ratio, accuracy: stats.accuracy
          });
        });
      });
    });

    return chain;
  }

  /** Promise-wrapped version of the shared interstitial. */
  function showIntro(opts) {
    return new Promise(function (resolve) {
      RAI.screens.instructions.make({
        eyebrow: opts.eyebrow,
        title: opts.title,
        body: opts.body,
        cta: opts.cta,
        progress: opts.progress,
        step: opts.step,
        footer: opts.footer,
        showKeys: true
      }).render({ next: resolve });
    });
  }

  RAI.screens.priming = {
    assignCondition: assignCondition,
    ratioLabel: ratioLabel,
    run: run,
    showIntro: showIntro
  };
})(window);
