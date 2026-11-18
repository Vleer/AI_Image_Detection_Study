/* Informed consent screen.
   Full consent text comes from IRB Appendix B; placeholder text is used until
   that appendix is inserted. Continue stays disabled until both boxes are ticked. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  RAI.screens.consent = {
    render: function (ctx) {
      var ui = RAI.ui;
      ui.setProgress(0.02, 'Consent');
      ui.setFooter('Step 1 of 5');

      ui.render(
        '<div class="prose" style="max-width:48rem">' +
          '<div class="card">' +
            '<div class="eyebrow">Informed consent</div>' +
            '<h2>Before we begin</h2>' +
            '<div class="consent-text" style="max-height:40vh;overflow:auto;padding:1rem;border:1px solid var(--line);border-radius:var(--radius);background:var(--bg-elev)">' +
              '<!-- TODO: replace with full IRB Appendix B consent text -->' +
              '<p class="muted">[Full informed consent text from IRB Appendix B goes here.]</p>' +
            '</div>' +
            '<form id="consentForm" novalidate style="margin-top:1.5rem">' +
              '<div style="display:grid;gap:.6rem">' +
                '<label class="choice" style="display:flex;align-items:center;gap:.5rem">' +
                  '<input type="checkbox" id="ageCheck" name="ageCheck">' +
                  '<span>I confirm that I am at least 18 years old.</span>' +
                '</label>' +
                '<label class="choice" style="display:flex;align-items:center;gap:.5rem">' +
                  '<input type="checkbox" id="agreeCheck" name="agreeCheck">' +
                  '<span>I confirm that I have read and understood the information above, and that I agree to participate in this study.</span>' +
                '</label>' +
              '</div>' +
              '<div class="btn-row" style="margin-top:1.5rem;justify-content:center">' +
                '<button type="submit" class="btn btn--primary btn--lg" id="consentContinue" disabled>Continue</button>' +
              '</div>' +
            '</form>' +
          '</div>' +
        '</div>'
      );

      var ageBox = ui.ref('ageCheck');
      var agreeBox = ui.ref('agreeCheck');
      var btn = ui.ref('consentContinue');

      function update() {
        btn.disabled = !(ageBox.checked && agreeBox.checked);
      }
      ageBox.addEventListener('change', update);
      agreeBox.addEventListener('change', update);

      ui.on('#consentForm', 'submit', function (e) {
        e.preventDefault();
        if (btn.disabled) return;
        RAI.store.logEvent('consent_given');
        ctx.next();
      });
    }
  };
})(window);