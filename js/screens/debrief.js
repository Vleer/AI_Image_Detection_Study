/* End of study — debrief, personal results and data export. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};
  RAI.screens = RAI.screens || {};

  function stat(value, label) {
    return '<div class="stat"><div class="stat__value">' + value + '</div>' +
           '<div class="stat__label">' + label + '</div></div>';
  }

  RAI.screens.debrief = {
    render: function (ctx) {
      var ui = RAI.ui;
      var cfg = RAI.config;
      var session = RAI.store.get();

      ui.setProgress(1, 'Complete');
      ui.setFooter('Session ' + session.participantId);

      var pre = RAI.store.summarise(function (t) { return t.phase === 'baseline'; });
      var post = RAI.store.summarise(function (t) { return t.phase === 'posttest'; });
      var training = RAI.store.summarise(function (t) { return t.phase === 'priming'; });
      var ratios = (session.condition.primingRatios || []).map(function (r) {
        return Math.round(r * 100) + '%';
      }).join(', ');

      var results = cfg.showResultsToParticipant
        ? '<div class="card">' +
            '<h3>How you did</h3>' +
            '<div class="stats">' +
              stat(ui.pct(pre.accuracy), 'First set') +
              stat(ui.pct(training.accuracy), 'With feedback') +
              stat(ui.pct(post.accuracy), 'Last set') +
              stat(ui.pct(post.aiResponseRate), 'Called &ldquo;AI&rdquo; at the end') +
            '</div>' +
            '<p class="faint">Chance is 50%. Most people land somewhere between 50% and 70% on this kind ' +
            'of task, so do not read too much into a single session.</p>' +
          '</div>'
        : '';

      var exportBlock = cfg.allowSelfExport
        ? '<div class="card">' +
            '<h3>Your data</h3>' +
            '<p class="muted">Everything stayed in this browser. You can keep a copy, and you can wipe ' +
            'it from this device entirely.</p>' +
            '<div class="btn-row">' +
              '<button class="btn" id="dlJson">Download JSON</button>' +
              '<button class="btn" id="dlCsv">Download CSV</button>' +
              '<button class="btn btn--ghost" id="wipe">Delete my data from this device</button>' +
            '</div>' +
            '<p class="faint" id="exportNote" style="margin-top:.75rem"></p>' +
          '</div>'
        : '';

      ui.render(
        '<div class="prose prose--narrow">' +
          '<div class="card">' +
            '<div class="eyebrow">Thank you</div>' +
            '<h1>You&rsquo;re all done</h1>' +
            '<p class="lead">Your responses have been recorded. Here is what the study was actually about.</p>' +

            '<h3>What we were testing</h3>' +
            '<p>You were told we were collecting impressions of digital images. That was true, but not the ' +
            'whole story. The real question is whether a short spell of <strong>feedback training can change ' +
            'how readily someone calls an image AI-generated</strong> &mdash; and whether that makes them ' +
            '<em>worse</em> rather than better.</p>' +

            '<p>The middle blocks were the manipulation. Without telling you, we set the proportion of ' +
            'AI-generated images in those blocks to <strong>' + ratios + '</strong>. If a block is mostly ' +
            'AI images, guessing &ldquo;AI&rdquo; is rewarded more often, which can nudge people into ' +
            'saying &ldquo;AI&rdquo; too often afterwards; a block that is mostly real photographs can push ' +
            'the opposite way. Either shift hurts accuracy on a balanced set. The final block, which was ' +
            'balanced, is where we look for that after-effect.</p>' +

            '<h3>Why we could not tell you up front</h3>' +
            '<p>Knowing that the proportions were rigged would have made it trivial to ignore them, which ' +
            'would have removed the very effect we are measuring. Nothing else about the study was ' +
            'misrepresented, and no images were mislabelled: every piece of feedback you saw was accurate.</p>' +

            '<div class="notice">If you would rather we did not use your responses now that you know the ' +
            'purpose, you can delete them below and nothing will be kept.</div>' +
          '</div>' +

          results +
          exportBlock +

          '<div class="card center">' +
            '<h3>Completion code</h3>' +
            '<p class="muted">If you were asked to provide one, this is it:</p>' +
            '<p><span class="code" style="font-size:1.3rem">' + session.participantId + '</span></p>' +
            '<p class="faint" id="uploadNote"></p>' +
          '</div>' +
        '</div>'
      );

      RAI.store.finish().then(function (res) {
        var note = ui.ref('uploadNote');
        if (!note) return;
        if (res.uploaded) note.textContent = 'Saved to the research server.';
        else if (res.reason === 'no endpoint configured') note.textContent = 'Stored locally on this device.';
        else note.textContent = 'Could not reach the server; your data is still stored on this device.';
      });

      ui.on('#dlJson', 'click', function () { RAI.store.exportJson(); });
      ui.on('#dlCsv', 'click', function () { RAI.store.exportCsv(); });
      ui.on('#wipe', 'click', function () {
        RAI.store.clear();
        var note = ui.ref('exportNote');
        if (note) note.textContent = 'Deleted. Nothing from this session remains in this browser.';
        ['dlJson', 'dlCsv', 'wipe'].forEach(function (id) {
          var b = ui.ref(id);
          if (b) b.disabled = true;
        });
      });
    }
  };
})(window);
