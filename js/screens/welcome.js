/* P0 — Simple welcoming page.
   Kept intentionally minimal so the first thing a participant sees is not the
   consent form. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  RAI.screens.welcome = {
    render: function (ctx) {
      var ui = RAI.ui;
      ui.setProgress(null);
      ui.setFooter('Anonymous \u00b7 you can stop at any time');

      ui.render(
        '<div class="prose prose--narrow">' +
          '<div class="card center">' +
            '<div class="eyebrow">Research study</div>' +
            '<h1>Real or AI?</h1>' +
            '<p class="lead">A short study about how people judge digital images.</p>' +
            '<div class="btn-row" style="justify-content:center">' +
              '<button class="btn btn--primary btn--lg" id="continue">Continue</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );

      ui.on('#continue', 'click', function () {
        RAI.store.logEvent('welcome_viewed');
        ctx.next();
      });
    }
  };
})(window);