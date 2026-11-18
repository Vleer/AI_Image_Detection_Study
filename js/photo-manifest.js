/* Real photo manifest.
   ---------------------------------------------------------------------------
   A "bucket" is one scene in three versions: the original photograph, the
   ChatGPT-generated version and the Gemini-generated version. A participant
   only ever sees one version of any given bucket, so the three files must
   really depict the same subject.

   Expected layout on disk:

     Photos/real/faces-001.jpg
     Photos/chatgpt/faces-001.jpg
     Photos/gemini/faces-001.jpg

   To go live: fill in `counts` below with how many buckets you have per
   category, then set `useDummyStimuli: false` in js/config.js.
   --------------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};

  var counts = {
    faces: 0,
    landscape: 0,
    interior: 0,
    object: 0
  };

  var ext = 'jpg';

  function pad(n) { return String(n).padStart(3, '0'); }

  function build() {
    var buckets = [];
    Object.keys(counts).forEach(function (category) {
      for (var i = 1; i <= counts[category]; i++) {
        var file = category + '-' + pad(i) + '.' + ext;
        buckets.push({
          id: category + '-' + pad(i),
          category: category,
          variants: {
            real: 'Photos/real/' + file,
            chatgpt: 'Photos/chatgpt/' + file,
            gemini: 'Photos/gemini/' + file
          }
        });
      }
    });
    return buckets;
  }

  RAI.photoManifest = { counts: counts, build: build };
})(window);
