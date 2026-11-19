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
          '<div class="card center hero">' +
            '<div class="hero__icon" aria-hidden="true">&#128065;</div>' +
            '<div class="eyebrow">Research study</div>' +
            '<h1>Real or AI?</h1>' +
            '<p class="lead">A short study about how people judge digital images.</p>' +
            '<ul class="factlist factlist--inline">' +
              '<li><span class="bullet" aria-hidden="true">&#9201;</span><span>About 10 minutes</span></li>' +
              '<li><span class="bullet" aria-hidden="true">&#128274;</span><span>No sign-up, fully anonymous</span></li>' +
              '<li><span class="bullet" aria-hidden="true">&#128260;</span><span>You can stop at any time</span></li>' +
            '</ul>' +
            '<div class="btn-row btn-row--center">' +
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
