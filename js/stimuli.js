/* Stimulus pool and trial construction.

   Vocabulary used throughout:
     bucket  - one scene, available as three variants (real / chatgpt / gemini)
     variant - which version of the bucket is shown on a trial
     trial   - one bucket+variant shown once, awaiting one judgement          */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};

  function buildPool() {
    var cfg = RAI.config;

    if (!cfg.useDummyStimuli) {
      var real = RAI.photoManifest.build();
      if (!real.length) {
        throw new Error('No photos in the manifest. Fill in js/photo-manifest.js ' +
                        'or set useDummyStimuli back to true.');
      }
      return real;
    }

    var cats = cfg.categories.map(function (c) { return c.id; });
    var buckets = [];
    for (var i = 0; i < cfg.dummyBucketCount; i++) {
      var category = cats[i % cats.length];
      var n = Math.floor(i / cats.length) + 1;
      var id = category + '-' + String(n).padStart(3, '0');
      buckets.push({
        id: id,
        category: category,
        variants: {
          real: RAI.dummyImages.make(category, id, 'real'),
          chatgpt: RAI.dummyImages.make(category, id, 'chatgpt'),
          gemini: RAI.dummyImages.make(category, id, 'gemini')
        }
      });
    }
    return buckets;
  }

  /* ------------------------------------------------------------ allocator */

  /** Hands out buckets so no scene is ever shown to a participant twice. */
  function Allocator(buckets, rng) {
    this.rng = rng;
    this.byCategory = {};
    var self = this;
    rng.shuffle(buckets).forEach(function (b) {
      (self.byCategory[b.category] = self.byCategory[b.category] || []).push(b);
    });
    this.categories = Object.keys(this.byCategory);
    this.cursor = 0;
    this.exhausted = false;
    this.reuseCount = 0;
    this.allBuckets = buckets;
  }

  Allocator.prototype.remaining = function () {
    var total = 0, self = this;
    this.categories.forEach(function (c) { total += self.byCategory[c].length; });
    return total;
  };

  /** Draws `n` buckets, rotating through categories so each phase stays
      roughly balanced across faces / landscapes / interiors / objects. */
  Allocator.prototype.take = function (n) {
    var out = [];
    var guard = 0;

    while (out.length < n && guard++ < n * 40) {
      if (this.remaining() === 0) break;
      var cat = this.categories[this.cursor % this.categories.length];
      this.cursor++;
      var pool = this.byCategory[cat];
      if (pool && pool.length) out.push(pool.pop());
    }

    // Not enough unique buckets configured: fall back to reuse rather than
    // aborting the session, and flag it so the data can be filtered later.
    if (out.length < n) {
      this.exhausted = true;
      var spare = this.rng.shuffle(this.allBuckets);
      var k = 0;
      while (out.length < n) {
        var b = spare[k++ % spare.length];
        out.push(b);
        this.reuseCount++;
      }
    }

    return this.rng.shuffle(out);
  };

  /* --------------------------------------------------------------- trials */

  /** Reshuffles until no answer repeats more than `maxRun` times in a row, so
      participants cannot ride a streak instead of judging each image. */
  function orderWithMaxRun(items, keyOf, maxRun, rng) {
    for (var attempt = 0; attempt < 250; attempt++) {
      var candidate = rng.shuffle(items);
      var run = 1, ok = true;
      for (var i = 1; i < candidate.length; i++) {
        run = keyOf(candidate[i]) === keyOf(candidate[i - 1]) ? run + 1 : 1;
        if (run > maxRun) { ok = false; break; }
      }
      if (ok) return candidate;
    }
    return rng.shuffle(items);
  }

  /**
   * Build the trial list for one phase or priming block.
   * @param {object} opts
   * @param {Allocator} opts.allocator
   * @param {number} opts.count      number of trials
   * @param {number} opts.aiRatio    proportion of trials that are AI-generated
   * @param {string} opts.phase      'baseline' | 'priming' | 'posttest'
   * @param {number} [opts.block]    priming block index
   * @param {function} opts.rng
   */
  function buildTrials(opts) {
    var rng = opts.rng;
    var cfg = RAI.config;
    var count = opts.count;
    var nAI = Math.round(count * opts.aiRatio);
    var nReal = count - nAI;

    var buckets = opts.allocator.take(count);

    // Split ChatGPT/Gemini as evenly as possible within the AI trials.
    var sources = [];
    for (var i = 0; i < nAI; i++) sources.push(cfg.aiSources[i % cfg.aiSources.length]);
    sources = rng.shuffle(sources);

    var trials = buckets.map(function (bucket, idx) {
      var isAI = idx < nAI;
      var variant = isAI ? sources[idx] : 'real';
      return {
        phase: opts.phase,
        block: opts.block === undefined ? null : opts.block,
        blockRatio: opts.aiRatio,
        bucketId: bucket.id,
        category: bucket.category,
        variant: variant,
        isAI: isAI,
        src: bucket.variants[variant]
      };
    });

    var ordered = orderWithMaxRun(trials, function (t) { return t.isAI; }, 3, rng);
    ordered.forEach(function (t, i) { t.index = i; });

    if (cfg.debug) {
      console.log('[stimuli]', opts.phase, opts.block, 'AI', nAI, 'real', nReal);
    }
    return ordered;
  }

  /* -------------------------------------------------------------- preload */

  var preloadCache = {};

  function preload(src) {
    if (!src || preloadCache[src]) return preloadCache[src] || Promise.resolve();
    preloadCache[src] = new Promise(function (resolve) {
      var img = new Image();
      img.onload = img.onerror = function () { resolve(src); };
      img.src = src;
    });
    return preloadCache[src];
  }

  function preloadAll(trials, upTo) {
    var slice = trials.slice(0, upTo || trials.length);
    return Promise.all(slice.map(function (t) { return preload(t.src); }));
  }

  RAI.stimuli = {
    buildPool: buildPool,
    Allocator: Allocator,
    buildTrials: buildTrials,
    preload: preload,
    preloadAll: preloadAll
  };
})(window);
