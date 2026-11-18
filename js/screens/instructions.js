/* Reusable interstitial used before each block of images. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  /**
   * @param {object} opts
   * @param {string} opts.eyebrow
   * @param {string} opts.title
   * @param {string} opts.body        raw HTML
   * @param {string} [opts.cta]       button label
   * @param {number} [opts.progress]
   * @param {string} [opts.step]      progress label
   * @param {string} [opts.footer]
   * @param {boolean} [opts.showKeys] show the arrow-key legend
   */
  function make(opts) {
    return {
      render: function (ctx) {
        var ui = RAI.ui;
        ui.setProgress(opts.progress === undefined ? null : opts.progress, opts.step || '');
        if (opts.footer) ui.setFooter(opts.footer);

        var keyLegend = opts.showKeys
          ? '<div class="notice" style="margin-top:1.25rem">' +
              '<strong>Tip:</strong> you can answer with the keyboard &mdash; ' +
              '<span class="kbd">&larr;</span> for <strong>AI-generated</strong>, ' +
              '<span class="kbd">&rarr;</span> for <strong>Real photo</strong>. ' +
              'Clicking or tapping the buttons works too.' +
            '</div>'
          : '';

        ui.render(
          '<div class="prose prose--narrow">' +
            '<div class="card">' +
              (opts.eyebrow ? '<div class="eyebrow">' + opts.eyebrow + '</div>' : '') +
              '<h2>' + opts.title + '</h2>' +
              opts.body +
              keyLegend +
              '<div class="btn-row">' +
                '<button class="btn btn--primary btn--lg" id="go">' + (opts.cta || 'Begin') + '</button>' +
                '<span class="faint"><span class="kbd">Enter</span> also works</span>' +
              '</div>' +
            '</div>' +
          '</div>'
        );

        var off = ui.keys({ Enter: proceed, ' ': proceed });
        ui.on('#go', 'click', proceed);

        function proceed() {
          off();
          ctx.next();
        }
      }
    };
  }

  RAI.screens.instructions = { make: make };
})(window);
