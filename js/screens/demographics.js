/* Demographic questionnaire — 6 required questions (IRB Appendix C).
   Placeholder questions are used until the appendix text is inserted; structure
   follows the spec: age as a whole number 18-99, all other items radio buttons,
   one answer each, no free-text fields, all required. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  function radioGroup(name, options) {
    return '<div class="choices">' + options.map(function (opt) {
      return '<label class="choice">' +
        '<input type="radio" name="' + name + '" value="' + RAI.ui.escapeHtml(opt.value) + '">' +
        '<span>' + RAI.ui.escapeHtml(opt.label) + '</span></label>';
    }).join('') + '</div>';
  }

  var GENDER = [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' },
    { value: 'nonbinary', label: 'Non-binary' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  var EDUCATION = [
    { value: 'secondary', label: 'Secondary school' },
    { value: 'vocational', label: 'Vocational' },
    { value: 'bachelor', label: "Bachelor's" },
    { value: 'master', label: "Master's" },
    { value: 'doctorate', label: 'Doctorate' }
  ];

  var FREQ = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'A few times a year' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' }
  ];

  var CONFIDENCE = [
    { value: '1', label: '1 - Not at all confident' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7 - Extremely confident' }
  ];

  RAI.screens.demographics = {
    render: function (ctx) {
      var ui = RAI.ui;
      ui.setProgress(0.08, 'Background');
      ui.setFooter('Step 2 of 5');

      ui.render(
        '<div class="prose prose--narrow">' +
          '<form class="card" id="demoForm" novalidate>' +
            '<div class="eyebrow">A few questions first</div>' +
            '<h2>About you</h2>' +
            '<p class="muted">All questions are required.</p>' +

            '<div class="form-grid" style="margin-top:1.5rem">' +

              '<div class="field">' +
                '<label for="age">Age</label>' +
                '<input type="number" id="age" name="age" min="18" max="99" step="1" inputmode="numeric" placeholder="18\u201399" required>' +
              '</div>' +

              '<fieldset class="field--wide">' +
                '<legend>Gender</legend>' +
                radioGroup('gender', GENDER) +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>Highest completed education</legend>' +
                radioGroup('education', EDUCATION) +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How often do you look at AI-generated images?</legend>' +
                radioGroup('aiExposure', FREQ) +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How often do you create images with tools like ChatGPT, Midjourney or Gemini?</legend>' +
                radioGroup('aiUse', FREQ) +
              '</fieldset>' +

              '<fieldset class="field--wide">' +
                '<legend>How confident are you that you can tell an AI-generated image from a photograph?</legend>' +
                radioGroup('confidence', CONFIDENCE) +
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
        var age = +data.age;
        if (!Number.isInteger(age) || age < 18 || age > 99) {
          err.textContent = 'Please enter your age as a whole number between 18 and 99.';
          ui.$('#age').focus();
          return;
        }
        var required = ['gender', 'education', 'aiExposure', 'aiUse', 'confidence'];
        for (var i = 0; i < required.length; i++) {
          if (!data[required[i]]) {
            err.textContent = 'Please answer every question before continuing.';
            return;
          }
        }
        err.textContent = '';

        data.age = age;
        if (data.confidence) data.confidence = +data.confidence;

        RAI.store.set('demographics', data);
        RAI.store.logEvent('demographics_submitted');
        ctx.next();
      });
    }
  };
})(window);