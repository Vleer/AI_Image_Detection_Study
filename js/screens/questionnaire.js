/* P6 — Exit questionnaire.

   Runs before the debrief so the answers are not contaminated by learning what
   the study was actually about. The strategy and suspicion items are the ones
   used to screen participants who worked out the manipulation. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  function likert(name, low, high) {
    var row = '';
    for (var i = 1; i <= 7; i++) {
      row += '<label class="likert__opt"><input type="radio" name="' + name + '" value="' + i + '">' +
             '<span>' + i + '</span></label>';
    }
    return '<div class="likert"><div class="likert__row">' + row + '</div>' +
           '<div class="likert__ends"><span>' + low + '</span><span>' + high + '</span></div></div>';
  }

  RAI.screens.questionnaire = {
    render: function (ctx) {
      var ui = RAI.ui;
      ui.setProgress(0.93, 'Final questions');
      ui.setFooter('Step 5 of 5');

      ui.render(
        '<div class="prose prose--narrow">' +
          '<form class="card" id="exitForm" novalidate>' +
            '<div class="eyebrow">Almost done</div>' +
            '<h2>How was that?</h2>' +
            '<p class="muted">Last few questions. There are no right answers &mdash; please just say ' +
            'what you actually thought while doing the task.</p>' +

            '<div class="form-grid" style="margin-top:1.5rem">' +

              '<fieldset class="field--wide">' +
                '<legend>How confident are you now that you can tell an AI-generated image from a photograph?</legend>' +
                likert('confidencePost', 'Not at all confident', 'Extremely confident') +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How difficult did you find the task?</legend>' +
                likert('difficulty', 'Very easy', 'Very difficult') +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>Roughly what share of all the images you saw do you think were AI-generated?</legend>' +
                '<div class="field">' +
                  '<input type="number" id="estimatedAiShare" name="estimatedAiShare" min="0" max="100" ' +
                  'inputmode="numeric" placeholder="0\u2013100">' +
                  '<span class="field__hint">Your best guess as a percentage.</span>' +
                '</div>' +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>Did the sets of images feel different from each other in any way?</legend>' +
                '<div class="choices">' +
                  '<label class="choice"><input type="radio" name="setsDiffered" value="no"><span>No, they felt the same</span></label>' +
                  '<label class="choice"><input type="radio" name="setsDiffered" value="maybe"><span>Maybe</span></label>' +
                  '<label class="choice"><input type="radio" name="setsDiffered" value="yes"><span>Yes, clearly</span></label>' +
                '</div>' +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>Were you distracted or interrupted during the image blocks?</legend>' +
                '<div class="choices">' +
                  '<label class="choice"><input type="radio" name="attentive" value="focused"><span>No, I was focused throughout</span></label>' +
                  '<label class="choice"><input type="radio" name="attentive" value="somewhat"><span>Somewhat</span></label>' +
                  '<label class="choice"><input type="radio" name="attentive" value="often"><span>Yes, quite often</span></label>' +
                '</div>' +
                '<p class="faint" style="margin:.6rem 0 0">Answering honestly does not affect anything &mdash; ' +
                'it just helps us clean the data.</p>' +
              '</fieldset>' +
            '</div>' +

            '<div class="form-error" id="exitError" role="alert"></div>' +

            '<div class="btn-row btn-row--end">' +
              '<button type="submit" class="btn btn--primary btn--lg">Finish</button>' +
            '</div>' +
          '</form>' +
        '</div>'
      );

      ui.on('#exitForm', 'submit', function (e) {
        e.preventDefault();
        var data = {};
        new FormData(e.target).forEach(function (v, k) { data[k] = v; });

        var err = ui.ref('exitError');
        if (!data.confidencePost || !data.difficulty) {
          err.textContent = 'Please answer the two rating questions before finishing.';
          return;
        }
        err.textContent = '';

        ['confidencePost', 'difficulty', 'estimatedAiShare'].forEach(function (k) {
          if (data[k] !== undefined && data[k] !== '') data[k] = +data[k];
        });

        RAI.store.set('questionnaire', data);
        RAI.store.logEvent('questionnaire_submitted');
        ctx.next();
      });
    }
  };
})(window);
