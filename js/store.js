/* Session record: everything that gets analysed later.
   Written to localStorage after every trial so a refresh or a closed laptop
   lid does not cost the whole run. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};

  function nowIso() { return new Date().toISOString(); }

  function createSession() {
    var cfg = RAI.config;
    var seed = RAI.rng.randomId(10);

    return {
      schema: 'recognize-ai/1',
      participantId: RAI.rng.randomId(8),
      seed: seed,
      startedAt: nowIso(),
      completedAt: null,
      condition: {
        design: cfg.primingDesign,
        primingRatios: null,   // filled in once assigned
        aiSourceOrder: null
      },
      config: {
        trials: JSON.parse(JSON.stringify(cfg.trials)),
        useDummyStimuli: cfg.useDummyStimuli,
        uniqueBucketsAcrossStudy: cfg.uniqueBucketsAcrossStudy
      },
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: global.screen ? global.screen.width + 'x' + global.screen.height : null,
        viewport: global.innerWidth + 'x' + global.innerHeight,
        touch: ('ontouchstart' in global) || navigator.maxTouchPoints > 0,
        timezone: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || null
      },
      demographics: {},
      questionnaire: {},
      trials: [],
      events: [],
      notes: { stimulusReuse: 0 }
    };
  }

  var session = null;

  function load() {
    try {
      var raw = global.localStorage.getItem(RAI.config.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function save() {
    try {
      global.localStorage.setItem(RAI.config.storageKey, JSON.stringify(session));
    } catch (e) {
      /* private mode / quota: the run still works, it just is not resumable */
    }
  }

  function clear() {
    try { global.localStorage.removeItem(RAI.config.storageKey); } catch (e) {}
  }

  /** Moves any leftover session into an archive list so that running several
      participants on the same device never overwrites earlier data. */
  function archivePrevious() {
    var previous = load();
    if (!previous || !previous.trials || !previous.trials.length) return;
    try {
      var key = RAI.config.storageKey + '.archive';
      var archive = JSON.parse(global.localStorage.getItem(key) || '[]');
      archive.push(previous);
      while (archive.length > 50) archive.shift();
      global.localStorage.setItem(key, JSON.stringify(archive));
    } catch (e) {
      /* out of quota: the new session still runs */
    }
  }

  /** All archived sessions plus the current one, for bulk export. */
  function allSessions() {
    var out = [];
    try {
      out = JSON.parse(global.localStorage.getItem(RAI.config.storageKey + '.archive') || '[]');
    } catch (e) {}
    if (session) out = out.concat([session]);
    return out;
  }

  function start(fresh) {
    var existing = fresh ? null : load();
    session = existing || createSession();
    // Persist only on final submit: do not write incomplete sessions to storage.
    return session;
  }

  function get() { return session; }

  function set(path, value) {
    var parts = path.split('.');
    var node = session;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = value;
    /* no intermediate persistence */
  }

  function logTrial(record) {
    record.t = nowIso();
    session.trials.push(record);
    return record;
  }

  function logEvent(name, detail) {
    session.events.push({ t: nowIso(), name: name, detail: detail || null });
  }

  function finish() {
    var already = !!session.completedAt;
    if (!already) session.completedAt = nowIso();
    // Balanced randomization bookkeeping: count completed participants per condition (once).
    try {
      if (!already && session.condition && session.condition.primingRatios && session.condition.primingRatios.length) {
        incrementConditionCount(session.condition.primingRatios[0]);
      }
    } catch (e) {}
    save();
    return upload();
  }

  /* ------------------------------------------------ condition counts */
  var CONDITION_COUNTS_KEY = null;
  function conditionCountsKey() {
    return (RAI.config.storageKey || 'rai.session.v1') + '.conditionCounts';
  }
  function getConditionCounts() {
    try { return JSON.parse(global.localStorage.getItem(conditionCountsKey()) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function incrementConditionCount(ratio) {
    try {
      var counts = getConditionCounts();
      var k = String(ratio);
      counts[k] = (counts[k] || 0) + 1;
      global.localStorage.setItem(conditionCountsKey(), JSON.stringify(counts));
    } catch (e) {}
  }

  function upload() {
    var url = RAI.config.uploadEndpoint;
    if (!url) return Promise.resolve({ uploaded: false, reason: 'no endpoint configured' });

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    }).then(function (res) {
      return { uploaded: res.ok, status: res.status };
    }).catch(function (err) {
      logEvent('upload_failed', String(err));
      return { uploaded: false, reason: String(err) };
    });
  }

  /* --------------------------------------------------------- derived data */

  /** Accuracy / hit rate / false-alarm rate for a subset of trials. */
  function summarise(filter) {
    var rows = session.trials.filter(filter || function () { return true; });
    var n = rows.length;
    if (!n) return { n: 0, correct: 0, accuracy: null, hitRate: null, falseAlarmRate: null, meanRt: null };

    var correct = 0, aiN = 0, aiHit = 0, realN = 0, falseAlarm = 0, rtSum = 0;
    rows.forEach(function (r) {
      if (r.correct) correct++;
      rtSum += r.rtMs;
      if (r.isAI) { aiN++; if (r.response === 'ai') aiHit++; }
      else { realN++; if (r.response === 'ai') falseAlarm++; }
    });

    return {
      n: n,
      correct: correct,
      accuracy: correct / n,
      hitRate: aiN ? aiHit / aiN : null,
      falseAlarmRate: realN ? falseAlarm / realN : null,
      // Proportion of trials where the participant said "AI" — the number the
      // priming manipulation is expected to move.
      aiResponseRate: rows.filter(function (r) { return r.response === 'ai'; }).length / n,
      meanRt: Math.round(rtSum / n)
    };
  }

  /* -------------------------------------------------------------- export */

  var CSV_COLUMNS = [
    'participantId', 'seed', 'design', 'assignedRatios',
    'phase', 'block', 'blockRatio', 'index',
    'bucketId', 'category', 'variant', 'isAI', 'isAttentionCheck', 'attentionPassed',
    'rating', 'response', 'correct', 'rtMs', 'inputMethod', 'feedbackShown', 't'
  ];

  function csvEscape(v) {
    if (v === null || v === undefined) return '';
    var s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function csvRows(sess) {
    var head = { participantId: sess.participantId, seed: sess.seed,
                 design: sess.condition.design,
                 assignedRatios: (sess.condition.primingRatios || []).join('|') };
    return sess.trials.map(function (tr) {
      return CSV_COLUMNS.map(function (c) {
        return csvEscape(c in head ? head[c] : tr[c]);
      }).join(',');
    });
  }

  function toCsv(sessions) {
    var list = sessions || [session];
    var lines = [CSV_COLUMNS.join(',')];
    list.forEach(function (s) { lines.push.apply(lines, csvRows(s)); });
    return lines.join('\n');
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function exportJson() {
    download('rai-' + session.participantId + '.json', JSON.stringify(session, null, 2), 'application/json');
  }

  function exportCsv() {
    download('rai-' + session.participantId + '.csv', toCsv(), 'text/csv');
  }

  /** Researcher helper: every session held on this device in one file.
      Run RAI.store.exportAll() from the browser console. */
  function exportAll() {
    var sessions = allSessions();
    var stamp = new Date().toISOString().slice(0, 10);
    download('rai-all-' + stamp + '.csv', toCsv(sessions), 'text/csv');
    download('rai-all-' + stamp + '.json', JSON.stringify(sessions, null, 2), 'application/json');
    return sessions.length;
  }

  RAI.store = {
    start: start,
    archivePrevious: archivePrevious,
    allSessions: allSessions,
    get: get,
    set: set,
    save: save,
    clear: clear,
    logTrial: logTrial,
    logEvent: logEvent,
    finish: finish,
    upload: upload,
    summarise: summarise,
    toCsv: toCsv,
    exportJson: exportJson,
    exportCsv: exportCsv,
    exportAll: exportAll,
    getConditionCounts: getConditionCounts,
    incrementConditionCount: incrementConditionCount
  };
})(window);
