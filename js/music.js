/* Blue Crescent background music — grand piano theme (synthesized).
   Tap the button in the bottom-right (or anywhere once) to start. */
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  var ctx, master, running = false, timer = null, nextTime = 0, step = 0;
  var KEY = 'bc-music';
  var STEP = 0.42;

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

  function piano(midi, t, vel, dur) {
    var f = mtof(midi);
    var out = ctx.createGain();
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(9000, f * 6 + 800);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.008);
    out.gain.exponentialRampToValueAtTime(vel * 0.4, t + 0.3);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(lp); lp.connect(master);

    var amps = [1, 0.55, 0.3, 0.15, 0.08];
    for (var h = 0; h < amps.length; h++) {
      for (var s = 0; s < 2; s++) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f * (h + 1);
        o.detune.value = s ? 4 : -4;
        g.gain.setValueAtTime(amps[h] * 0.6, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (1 + h * 0.5));
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + dur + 0.05);
      }
    }
  }

  function schedule() {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 1.2) {
      var c = Math.floor(step / 8) % 4;
      var k = step % 8;
      var t = nextTime;

      if (k === 0) {
        piano(bass[c], t, 0.45, 4.5);
        piano(bass[c] + 12, t, 0.28, 4);
      }
      if (k === 4) piano(bass[c] + 7, t, 0.3, 3);

      if (Math.random() < 0.9) {
        piano(tones[c][pattern[k]], t, 0.22 + Math.random() * 0.1, 2.8);
      }
      if ((k === 0 || k === 3 || k === 6) && Math.random() < 0.5) {
        piano(melody[c][Math.floor(Math.random() * 4)], t + 0.02, 0.35, 4);
      }
      nextTime += STEP;
      step++;
    }
  }

  function start() {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.75; // louder so it is clearly audible
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    nextTime = ctx.currentTime + 0.05;
    if (timer) clearInterval(timer);
    timer = setInterval(schedule, 200);
    running = true;
    try { localStorage.setItem(KEY, 'on'); } catch (e) {}
    render();
  }

  function stop() {
    if (timer) clearInterval(timer);
    if (ctx && ctx.state === 'running') ctx.suspend();
    running = false;
    try { localStorage.setItem(KEY, 'off'); } catch (e) {}
    render();
  }

  // Toggle button (bottom right)
  var btn = document.createElement('button');
  btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;width:56px;height:56px;' +
    'border-radius:50%;border:3px solid #fff;font-size:26px;cursor:pointer;color:#fff;' +
    'background:#4aa3d8;box-shadow:0 3px 8px rgba(0,0,0,.35);';
  btn.setAttribute('aria-label', 'Toggle music');
  function render() {
    btn.innerHTML = running ? '♫' : '🔇';
    btn.style.background = running ? '#4aa3d8' : '#e27d7d';
  }
  btn.onclick = function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (running) stop(); else start();
  };
  document.body.appendChild(btn);
  render();

  // Start on first interaction if not previously turned off
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved !== 'off') {
    var started = false;
    var first = function () {
      if (started) return;
      started = true;
      document.removeEventListener('click', first);
      document.removeEventListener('touchstart', first);
      document.removeEventListener('keydown', first);
      start();
    };
    document.addEventListener('click', first);
    document.addEventListener('touchstart', first);
    document.addEventListener('keydown', first);
  }
})();
