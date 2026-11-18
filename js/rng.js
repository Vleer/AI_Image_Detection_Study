/* Seeded pseudo-random number generation.
   Every participant gets a seed that is stored with their data, so any
   session's exact trial order can be reconstructed afterwards. */
(function (global) {
  'use strict';

  var RAI = global.RAI = global.RAI || {};

  function hashString(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // mulberry32
  function makeRng(seed) {
    var a = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;
    function rng() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    rng.int = function (maxExclusive) {
      return Math.floor(rng() * maxExclusive);
    };
    rng.pick = function (arr) {
      return arr[Math.floor(rng() * arr.length)];
    };
    // Fisher-Yates on a copy
    rng.shuffle = function (arr) {
      var out = arr.slice();
      for (var i = out.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    };
    rng.sample = function (arr, n) {
      return rng.shuffle(arr).slice(0, n);
    };
    return rng;
  }

  function randomId(len) {
    var alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    var bytes = new Uint8Array(len || 8);
    if (global.crypto && global.crypto.getRandomValues) {
      global.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    var out = '';
    for (var k = 0; k < bytes.length; k++) out += alphabet[bytes[k] % alphabet.length];
    return out;
  }

  RAI.rng = { make: makeRng, hashString: hashString, randomId: randomId };
})(window);
