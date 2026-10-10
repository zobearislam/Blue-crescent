/* Blue Crescent background music — grand piano theme (synthesized, no audio files).
   Add before </body> on every page:  <script src="js/music.js"></script> */
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  var ctx, master, running = false, timer = null, nextTime = 0, step = 0;
  var KEY = 'bc-music';
  var STEP = 0.48; // seconds per eighth note (slow and gentle)

  // MIDI notes. Progression: Am - F - C - G, 8 steps each
  var bass = [45, 41, 48, 43];
  var tones = [
    [57, 60, 64, 69],
    [53, 57, 60, 65],
    [60, 64, 67, 72],
    [55, 59, 62, 67]
  ];
  var melody = [
    [72, 76, 79, 81],
    [72, 77, 79, 81],
    [76, 79, 84, 72],
    [74, 79, 71, 83]
  ];
  var pattern = [0, 1, 2, 3, 2, 1, 2, 3];

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Piano-ish voice: two slightly detuned strings, decaying harmonics, soft hammer thump
  function piano(midi, t, vel, dur) {
    var f = mtof(midi);
    var out = ctx.createGain();
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(9000, f * 6 + 800);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.006);
    out.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.25);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(lp); lp.connect(master);

    var amps = [1, 0.5, 0.28, 0.14, 0.07];
    for (var h = 0; h < amps.length; h++) {
      for (var s = 0; s < 2; s++) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f * (h + 1) * (1 + (h * h) * 0.0004); // slight inharmonicity
        o.detune.value = s ? 3 : -3;
        g.gain.setValueAtTime(amps[h] * 0.5, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (1 + h * 0.6));
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + dur + 0.05);
      }
    }
    // hammer thump
    var nb = ctx.createBuffer(1, 2205, ctx.sampleRate);
    var d = nb.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    var ns = ctx.createBufferSource(), ng = ctx.createGain();
    ns.buffer = nb; ng.gain.value = vel * 0.1;
    ns.connect(ng); ng.connect(lp); ns.start(t);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 1.0) {
      var c = Math.floor(step / 8) % 4;
      var k = step % 8;
      var t = nextTime + (Math.random() - 0.5) * 0.03; // human timing

      if (k === 0) {
        piano(bass[c], t, 0.28, 5);
        piano(bass[c] + 12, t, 0.16, 4);
      }
      if (k === 4) piano(bass[c] + 7, t, 0.18, 3.5);

      if (Math.random() < 0.85) {
        var v = 0.12 + Math.random() * 0.07;
        piano(tones[c][pattern[k]], t, v, 3);
      }
      // occasional singing melody note
      if ((k === 0 || k === 3 || k === 6) && Math.random() < 0.4) {
        piano(melody[c][Math.floor(Math.random() * 4)], t + 0.01, 0.22, 4.5);
      }
      nextTime += STEP;
      step++;
    }
  }

  function makeReverb() {
    var len = Math.floor(ctx.sampleRate * 3.2);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    var cv = ctx.createConvolver(); cv.buffer = buf;
    return cv;
  }

  function start() {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.42; // softer background level
      master.connect(ctx.destination);
      try { // concert-hall reverb
        var rv = makeReverb(), wet = ctx.createGain();
        wet.gain.value = 0.32;
        master.connect(rv); rv.connect(wet); wet.connect(ctx.destination);
      } catch (e) {}
    }
    if (ctx.resume) ctx.resume();
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(schedule, 250);
    running = true;
    try { localStorage.setItem(KEY, 'on'); } catch (e) {}
    render();
  }

  function stop() {
    clearInterval(timer);
    if (ctx && ctx.suspend) ctx.suspend();
    running = false;
    try { localStorage.setItem(KEY, 'off'); } catch (e) {}
    render();
  }

  // Toggle button
  var btn = document.createElement('button');
  btn.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;width:48px;height:48px;' +
    'border-radius:50%;border:3px solid #fff;font-size:22px;cursor:pointer;color:#fff;' +
    'background:#89cff0;box-shadow:0 2px 6px rgba(0,0,0,.3);';
  btn.setAttribute('aria-label', 'Toggle music');
  function render() {
    btn.innerHTML = running ? '&#9835;' : '&#128263;';
    btn.style.background = running ? '#89cff0' : '#f4a0a0';
  }
  btn.onclick = function (e) { e.stopPropagation(); running ? stop() : start(); };
  document.body.appendChild(btn);
  render();

  // Browsers block audio until the visitor interacts: start on first tap/click/key
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved !== 'off') {
    var first = function () {
      document.removeEventListener('click', first);
      document.removeEventListener('touchend', first);
      document.removeEventListener('keydown', first);
      if (!running) start();
    };
    document.addEventListener('click', first);
    document.addEventListener('touchend', first);
    document.addEventListener('keydown', first);
  }
})();
