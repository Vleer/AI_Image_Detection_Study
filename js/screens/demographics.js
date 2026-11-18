/* P2 — Background questions.

   Kept short. The AI-exposure items are the ones likely to moderate baseline
   accuracy, so they are asked before the task rather than after. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  function choices(name, options, required) {
    return '<div class="choices">' + options.map(function (opt, i) {
      var id = name + '-' + i;
      return '<label class="choice">' +
        '<input type="radio" name="' + name + '" id="' + id + '" value="' + RAI.ui.escapeHtml(opt.value) + '"' +
        (required && i === 0 ? ' data-required="1"' : '') + '>' +
        '<span>' + RAI.ui.escapeHtml(opt.label) + '</span></label>';
    }).join('') + '</div>';
  }

  function likert(name, low, high) {
    var row = '';
    for (var i = 1; i <= 7; i++) {
      row += '<label class="likert__opt">' +
        '<input type="radio" name="' + name + '" value="' + i + '">' +
        '<span>' + i + '</span></label>';
    }
    return '<div class="likert">' +
      '<div class="likert__row">' + row + '</div>' +
      '<div class="likert__ends"><span>' + low + '</span><span>' + high + '</span></div>' +
      '</div>';
  }

  var FREQ = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'A few times a year' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' }
  ];

  RAI.screens.demographics = {
    render: function (ctx) {
      var ui = RAI.ui;
      ui.setProgress(0.08, 'Background');
      ui.setFooter('Step 1 of 5');

      ui.render(
        '<div class="prose prose--narrow">' +
          '<form class="card" id="demoForm" novalidate>' +
            '<div class="eyebrow">A few questions first</div>' +
            '<h2>About you</h2>' +
            '<p class="muted">All fields are optional except age and how often you view generated images. ' +
            'Answer whatever you are comfortable with.</p>' +

            '<div class="form-grid" style="margin-top:1.5rem">' +
              '<div class="field">' +
                '<label for="age">Age</label>' +
                '<input type="number" id="age" name="age" min="18" max="110" inputmode="numeric" placeholder="e.g. 29">' +
              '</div>' +

              '<div class="field">' +
                '<label for="gender">Gender</label>' +
                '<select id="gender" name="gender">' +
                  '<option value="">Prefer not to say</option>' +
                  '<option value="woman">Woman</option>' +
                  '<option value="man">Man</option>' +
                  '<option value="nonbinary">Non-binary</option>' +
                  '<option value="self-describe">Prefer to self-describe</option>' +
                '</select>' +
              '</div>' +

              '<div class="field">' +
                '<label for="education">Highest completed education</label>' +
                '<select id="education" name="education">' +
                  '<option value="">Prefer not to say</option>' +
                  '<option value="secondary">Secondary school</option>' +
                  '<option value="vocational">Vocational</option>' +
                  '<option value="bachelor">Bachelor\u2019s</option>' +
                  '<option value="master">Master\u2019s</option>' +
                  '<option value="doctorate">Doctorate</option>' +
                '</select>' +
              '</div>' +

              '<div class="field">' +
                '<label for="vision">Are you doing this with your usual glasses or lenses, if you wear them?</label>' +
                '<select id="vision" name="vision">' +
                  '<option value="na">I do not need them</option>' +
                  '<option value="yes">Yes</option>' +
                  '<option value="no">No</option>' +
                '</select>' +
              '</div>' +

              '<fieldset class="field--wide">' +
                '<legend>How often do you look at AI-generated images?</legend>' +
                choices('aiExposure', FREQ, true) +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How often do you create images with tools like ChatGPT, Midjourney or Gemini?</legend>' +
                choices('aiUse', FREQ, false) +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How confident are you that you can tell an AI-generated image from a photograph?</legend>' +
                likert('confidencePre', 'Not at all confident', 'Extremely confident') +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How much experience do you have with photography or image editing?</legend>' +
                likert('photoExperience', 'None at all', 'Professional') +
              '</fieldset>' +
            '</div>' +

            '<div class="form-error" id="demoError" role="alert"></div>' +

            '<div class="btn-row btn-row--end">' +
              '<button type="submit" class="btn btn--primary btn--lg">Continue</button>' +
            '</div>' +
          '</form>' +
        '</div>'
      );

      ui.on('#demoForm', 'submit', function (e) {
        e.preventDefault();
        var form = e.target;
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });

        var err = ui.ref('demoError');
        if (!data.age || +data.age < 18 || +data.age > 110) {
          err.textContent = 'Please enter your age (18 or over) to continue.';
          ui.$('#age').focus();
          return;
        }
        if (!data.aiExposure) {
          err.textContent = 'Please tell us how often you look at AI-generated images.';
          return;
        }
        err.textContent = '';

        data.age = +data.age;
        ['confidencePre', 'photoExperience'].forEach(function (k) {
          if (data[k]) data[k] = +data[k];
        });

        RAI.store.set('demographics', data);
        RAI.store.logEvent('demographics_submitted');
        ctx.next();
      });
    }
  };
})(window);
