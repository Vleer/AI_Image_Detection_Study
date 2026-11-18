/* Study configuration.
   This is the only file you need to touch to re-tune the experiment. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};

  RAI.config = {
    /* ---------------------------------------------------------- stimuli */

    // While true the site renders generated placeholder images so the whole
    // flow is testable without any photo assets. Set to false once the real
    // photos are dropped into Photos/ (see js/stimuli.js).
    useDummyStimuli: false,

    // How many buckets the placeholder set pretends to have. The real set is
    // 100 buckets (one real photo + its ChatGPT and Gemini counterparts).
    dummyBucketCount: 100,

    categories: [
      { id: 'faces',     label: 'People & faces' },
      { id: 'landscape', label: 'Nature landscapes' },
      { id: 'interior',  label: 'Rooms & interiors' },
      { id: 'object',    label: 'Objects' }
    ],

    aiSources: ['chatgpt', 'gemini'],

    // A bucket holds three versions of the same scene. Showing a participant
    // two versions of one scene would leak the answer, so each bucket is used
    // at most once for the entire session.
    uniqueBucketsAcrossStudy: true,

    /* ------------------------------------------------------------ trials */

    trials: {
      baseline: 20,      // P3
      primingBlock: 20,  // P4, per ratio block
      posttest: 40       // P5
    },

    /* ----------------------------------------------------------- priming */

    // 'between' -> each participant is randomly assigned exactly one ratio.
    // 'within'  -> each participant runs all three blocks in random order.
    primingDesign: 'between',

    primingRatios: [0.20, 0.50, 0.80],

    // Force a condition for piloting, e.g. ?ratio=0.75 in the URL. null = random.
    forcedPrimingRatio: null,

    /* ---------------------------------------------------------- timings */

    feedbackMs: 900,          // how long the green/red screen stays up
    interTrialMs: 250,        // blank gap between trials
    responseLockoutMs: 150,   // ignore input right after image onset (mis-clicks)

    /* -------------------------------------------------------- data sink */

    storageKey: 'rai.session.v1',

    // Optional: POST each completed session as JSON to your own endpoint.
    // Leave null to keep everything client-side.
    uploadEndpoint: null,

    // Show the participant their own scores at the very end.
    showResultsToParticipant: true,

    // Let the participant download their own data file at the end.
    allowSelfExport: true
  };

  // URL overrides make piloting easier: ?ratio=0.5&trials=5&debug=1
  var params = new URLSearchParams(global.location.search);
  var cfg = RAI.config;

  if (params.has('ratio')) {
    var r = parseFloat(params.get('ratio'));
    if (!isNaN(r) && r > 0 && r < 1) cfg.forcedPrimingRatio = r;
  }
  if (params.has('trials')) {
    var t = parseInt(params.get('trials'), 10);
    if (t > 0) {
      cfg.trials.baseline = t;
      cfg.trials.primingBlock = t;
      cfg.trials.posttest = t;
    }
  }
  if (params.get('design') === 'within' || params.get('design') === 'between') {
    cfg.primingDesign = params.get('design');
  }
  cfg.debug = params.get('debug') === '1';
})(window);
