/* Blue Crescent games: memory, speed math, word scramble, and Orbit Lab. */
(function () {
  "use strict";

  var menu = document.getElementById("gameMenu");
  var stage = document.getElementById("gameStage");
  var hud = document.getElementById("gameHud");
  var area = document.getElementById("gameArea");
  var actions = document.getElementById("gameActions");
  if (!menu || !stage || !hud || !area || !actions) return;

  var stopCurrent = function () {};
  var burger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  menu.addEventListener("click", function (event) {
    var card = event.target.closest(".game-card");
    if (!card) return;
    menu.querySelectorAll(".game-card").forEach(function (item) {
      item.classList.remove("active");
    });
    card.classList.add("active");
    stage.classList.remove("hidden");
    stopCurrent();
    stopCurrent = function () {};
    var game = card.getAttribute("data-game");
    if (game === "memory") startMemory();
    else if (game === "math") startMath();
    else if (game === "scramble") startScramble();
    else if (game === "orbit") startOrbit();
    stage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  function button(label, fn) {
    var el = document.createElement("button");
    el.className = "btn btn-primary";
    el.type = "button";
    el.textContent = label;
    el.addEventListener("click", fn);
    return el;
  }

  /* ---------- Memory ---------- */
  function startMemory() {
    var symbols = ["🌙", "⭐", "🔬", "🪐", "🌍", "💡", "🔢", "📚"];
    var deck = symbols.concat(symbols);
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    var moves = 0;
    var matched = 0;
    var open = [];
    var lock = false;
    hud.innerHTML = "<span>MOVES <b id='memMoves'>0</b></span><span class='score'>PAIRS <b id='memPairs'>0</b>/8</span>";
    area.innerHTML = "<div class='memory-grid' id='memGrid'></div>";
    actions.innerHTML = "";
    var grid = document.getElementById("memGrid");
    deck.forEach(function (symbol, index) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "memory-card";
      card.innerHTML = "<span class='back'>✦</span><span class='face'>" + symbol + "</span>";
      card.addEventListener("click", function () {
        if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
        card.classList.add("flipped");
        open.push({ el: card, symbol: symbol, index: index });
        if (open.length < 2) return;
        moves += 1;
        document.getElementById("memMoves").textContent = String(moves);
        var a = open[0];
        var b = open[1];
        open = [];
        if (a.symbol === b.symbol && a.index !== b.index) {
          a.el.classList.add("matched");
          b.el.classList.add("matched");
          matched += 1;
          document.getElementById("memPairs").textContent = String(matched);
          if (matched === 8) {
            actions.innerHTML = "";
            actions.appendChild(button("PLAY AGAIN", startMemory));
          }
        } else {
          lock = true;
          setTimeout(function () {
            a.el.classList.remove("flipped");
            b.el.classList.remove("flipped");
            lock = false;
          }, 700);
        }
      });
      grid.appendChild(card);
    });
  }

  /* ---------- Speed math ---------- */
  function startMath() {
    var score = 0;
    var left = 45;
    var timer = 0;
    var current = null;
    hud.innerHTML = "<span>TIME <b id='mathTime'>45</b></span><span class='score'>SCORE <b id='mathScore'>0</b></span>";
    area.innerHTML =
      "<div class='math-question'><div class='expr' id='mathExpr'></div>" +
      "<div class='math-options' id='mathOpts'></div></div>";
    actions.innerHTML = "";

    function round() {
      var a = 1 + Math.floor(Math.random() * 12);
      var b = 1 + Math.floor(Math.random() * 12);
      var op = Math.random() < 0.5 ? "+" : "−";
      var answer = op === "+" ? a + b : a - b;
      if (op === "−" && b > a) {
        var swap = a;
        a = b;
        b = swap;
        answer = a - b;
      }
      var options = [answer];
      while (options.length < 4) {
        var guess = answer + (Math.floor(Math.random() * 9) - 4);
        if (options.indexOf(guess) === -1) options.push(guess);
      }
      for (var i = options.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = options[i];
        options[i] = options[j];
        options[j] = t;
      }
      current = answer;
      document.getElementById("mathExpr").textContent = a + " " + op + " " + b;
      var box = document.getElementById("mathOpts");
      box.innerHTML = "";
      options.forEach(function (value) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "math-opt";
        btn.textContent = String(value);
        btn.addEventListener("click", function () {
          if (!current && current !== 0) return;
          if (value === current) {
            score += 1;
            btn.classList.add("correct");
          } else {
            btn.classList.add("wrong");
          }
          document.getElementById("mathScore").textContent = String(score);
          current = null;
          setTimeout(round, 280);
        });
        box.appendChild(btn);
      });
    }

    round();
    timer = setInterval(function () {
      left -= 1;
      var node = document.getElementById("mathTime");
      if (node) node.textContent = String(left);
      if (left <= 0) {
        clearInterval(timer);
        area.innerHTML =
          "<div class='game-over'><h3>TIME UP</h3><p>You solved " +
          score +
          " problem" +
          (score === 1 ? "" : "s") +
          ".</p></div>";
        actions.innerHTML = "";
        actions.appendChild(button("PLAY AGAIN", startMath));
      }
    }, 1000);
    stopCurrent = function () {
      clearInterval(timer);
    };
  }

  /* ---------- Word scramble ---------- */
  function startScramble() {
    var words = [
      { word: "PLANET", hint: "A world that travels around a star" },
      { word: "GRAVITY", hint: "The pull that keeps moons in orbit" },
      { word: "ORBIT", hint: "The path a smaller body takes around a bigger one" },
      { word: "CRESCENT", hint: "A curved shape of the Moon" },
      { word: "OXYGEN", hint: "The gas we breathe" },
      { word: "ENERGY", hint: "What makes things move and glow" },
      { word: "ATOM", hint: "A tiny piece of matter" },
      { word: "RIVER", hint: "Water that flows across the land" },
    ];
    var index = 0;
    var solved = 0;
    hud.innerHTML = "<span>WORD <b id='scrN'>1</b>/8</span><span class='score'>SOLVED <b id='scrS'>0</b></span>";
    area.innerHTML =
      "<p class='scramble-hint' id='scrHint'></p>" +
      "<div class='scramble-word' id='scrWord'></div>" +
      "<form class='scramble-input-wrap' id='scrForm'>" +
      "<input id='scrInput' autocomplete='off' aria-label='Your answer'>" +
      "<button class='btn btn-primary' type='submit'>CHECK</button></form>" +
      "<p class='scramble-feedback' id='scrMsg'></p>";
    actions.innerHTML = "";

    function scramble(word) {
      var letters = word.split("");
      for (var n = 0; n < 6; n++) {
        for (var i = letters.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = letters[i];
          letters[i] = letters[j];
          letters[j] = t;
        }
        if (letters.join("") !== word) break;
      }
      return letters.join("");
    }

    function show() {
      if (index >= words.length) {
        area.innerHTML =
          "<div class='game-over'><h3>ALL DONE</h3><p>You unscrambled " +
          solved +
          " of " +
          words.length +
          ".</p></div>";
        actions.innerHTML = "";
        actions.appendChild(button("PLAY AGAIN", startScramble));
        return;
      }
      var item = words[index];
      document.getElementById("scrN").textContent = String(index + 1);
      document.getElementById("scrHint").textContent = item.hint;
      document.getElementById("scrWord").textContent = scramble(item.word);
      document.getElementById("scrMsg").textContent = "";
      document.getElementById("scrMsg").className = "scramble-feedback";
      var input = document.getElementById("scrInput");
      input.value = "";
      input.focus();
    }

    document.getElementById("scrForm").addEventListener("submit", function (event) {
      event.preventDefault();
      if (index >= words.length) return;
      var guess = document.getElementById("scrInput").value.trim().toUpperCase();
      var msg = document.getElementById("scrMsg");
      if (guess === words[index].word) {
        solved += 1;
        document.getElementById("scrS").textContent = String(solved);
        msg.textContent = "NICE";
        msg.className = "scramble-feedback ok";
        index += 1;
        setTimeout(show, 400);
      } else {
        msg.textContent = "TRY AGAIN";
        msg.className = "scramble-feedback bad";
      }
    });
    show();
  }

  /* ---------- Orbit Lab ---------- */
  var G = 64;
  var SOFT = 5;
  var FLING = 1.45;
  var COLORS = { cyan: "#05d9e8", pink: "#ff2a6d", paper: "#f4fbff", amber: "#ffd166" };

  function radiusOf(mass) {
    if (mass < 90) return clamp(8.4 + mass * 0.07, 8, 13.5);
    if (mass < 1200) return clamp(13 + (mass - 90) * 0.0065, 13, 20);
    return clamp(18 + Math.sqrt(Math.max(0, mass - 800)) * 0.22, 20, 34);
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function orbitSpeed(centralMass, distance) {
    var r2 = distance * distance + SOFT * SOFT;
    var inv = 1 / Math.sqrt(r2);
    var a = G * centralMass * inv * inv * inv * distance;
    return Math.sqrt(Math.max(0, a * distance));
  }
  function mutualSpeed(otherMass, separation, fromCenter) {
    var r2 = separation * separation + SOFT * SOFT;
    var inv = 1 / Math.sqrt(r2);
    var a = G * otherMass * inv * inv * inv * separation;
    return Math.sqrt(Math.max(0, a * fromCenter));
  }
  function accelerations(bodies, out) {
    while (out.length < bodies.length) out.push({ ax: 0, ay: 0 });
    for (var i = 0; i < bodies.length; i++) {
      var ax = 0;
      var ay = 0;
      for (var j = 0; j < bodies.length; j++) {
        if (i === j) continue;
        var dx = bodies[j].x - bodies[i].x;
        var dy = bodies[j].y - bodies[i].y;
        var r2 = dx * dx + dy * dy + SOFT * SOFT;
        var inv = 1 / Math.sqrt(r2);
        var scale = G * bodies[j].mass * inv * inv * inv;
        ax += dx * scale;
        ay += dy * scale;
      }
      out[i].ax = ax;
      out[i].ay = ay;
    }
  }

  function startOrbit() {
    var bodies = [];
    var nextId = 1;
    var focusId = null;
    var followCom = false;
    var follow = true;
    var paused = false;
    var speed = 1;
    var trails = true;
    var tool = "launch";
    var massId = "moon";
    var cam = { x: 0, y: 0, zoom: 1 };
    var nameCursor = { pebble: 0, moon: 0, planet: 0, sun: 0 };
    var orbitClock = 0.6;
    var accA = [];
    var accB = [];
    var haveA = false;
    var stride = 0;
    var raf = 0;
    var alive = true;
    var drag = null;
    var pointers = {};
    var pinch = null;
    var framed = false;
    var last = 0;
    var accum = 0;

    var MASSES = {
      pebble: { label: "Pebble", mass: 14, tint: "amber" },
      moon: { label: "Moon", mass: 32, tint: "pink" },
      planet: { label: "Planet", mass: 240, tint: "paper" },
      sun: { label: "Sun", mass: 7000, tint: "cyan" },
    };
    var NAMES = {
      pebble: ["Dot", "Nib", "Mote", "Peb"],
      moon: ["Pip", "Lumen", "Nim", "Wren", "Kip"],
      planet: ["Amber", "Harbor", "Cinder", "Dale"],
      sun: ["Ember", "Solas", "Bright"],
    };

    hud.innerHTML = "<span>ORBIT LAB</span><span class='score' id='orbitCount'>0 BODIES</span>";
    area.innerHTML =
      "<div class='orbit-shell'>" +
      "<canvas class='orbit-canvas' id='orbitCanvas' aria-label='Gravity sky'></canvas>" +
      "<p class='orbit-note' id='orbitNote'>Drag across the sky. A loop means it will orbit.</p>" +
      "<div class='orbit-row' id='orbitPresets'></div>" +
      "<div class='orbit-row' id='orbitMass'></div>" +
      "<div class='orbit-row' id='orbitTools'></div>" +
      "</div>";
    actions.innerHTML = "";

    var canvas = document.getElementById("orbitCanvas");
    var note = document.getElementById("orbitNote");
    var ctx = canvas.getContext("2d");

    function spawn(input) {
      var body = {
        id: nextId++,
        name: input.name,
        tint: input.tint,
        mass: input.mass,
        radius: input.radius || radiusOf(input.mass),
        x: input.x,
        y: input.y,
        vx: input.vx,
        vy: input.vy,
        trail: [],
      };
      bodies.push(body);
      return body;
    }
    function nextName(kind) {
      var pool = NAMES[kind];
      var base = pool[nameCursor[kind] % pool.length];
      nameCursor[kind] += 1;
      if (!bodies.some(function (body) { return body.name === base; })) return base;
      var n = 2;
      while (bodies.some(function (body) { return body.name === base + " " + n; })) n += 1;
      return base + " " + n;
    }
    function heaviest() {
      var best = null;
      bodies.forEach(function (body) {
        if (!best || body.mass > best.mass) best = body;
      });
      return best;
    }
    function focusBody() {
      var found = bodies.filter(function (body) { return body.id === focusId; })[0];
      return found || heaviest();
    }
    function focusPoint() {
      if (followCom && bodies.length) {
        var mass = 0;
        var x = 0;
        var y = 0;
        bodies.forEach(function (body) {
          mass += body.mass;
          x += body.x * body.mass;
          y += body.y * body.mass;
        });
        if (mass) return { x: x / mass, y: y / mass };
      }
      var body = focusBody();
      return body ? { x: body.x, y: body.y } : { x: 0, y: 0 };
    }
    function step(dt) {
      if (!bodies.length) return;
      if (!haveA) {
        accelerations(bodies, accA);
        haveA = true;
      }
      for (var i = 0; i < bodies.length; i++) {
        bodies[i].x += bodies[i].vx * dt + 0.5 * accA[i].ax * dt * dt;
        bodies[i].y += bodies[i].vy * dt + 0.5 * accA[i].ay * dt * dt;
      }
      accelerations(bodies, accB);
      for (var k = 0; k < bodies.length; k++) {
        bodies[k].vx += 0.5 * (accA[k].ax + accB[k].ax) * dt;
        bodies[k].vy += 0.5 * (accA[k].ay + accB[k].ay) * dt;
        accA[k].ax = accB[k].ax;
        accA[k].ay = accB[k].ay;
      }
      stride += 1;
      if (trails && stride % 2 === 0) {
        bodies.forEach(function (body) {
          body.trail.push({ x: body.x, y: body.y });
          if (body.trail.length > 140) body.trail.shift();
        });
      }
    }
    function warm() {
      for (var i = 0; i < 2.4 * 120; i++) step(1 / 120);
    }
    function loadPreset(id) {
      bodies = [];
      nextId = 1;
      haveA = false;
      followCom = false;
      focusId = null;
      if (id === "orbits") {
        var sun = spawn({ name: "Helios", mass: 10000, tint: "cyan", x: 0, y: 0, vx: 0, vy: 0, radius: 32 });
        [
          { name: "Kip", mass: 12, tint: "pink", r: 86, radius: 10, angle: 0.4 },
          { name: "Amber", mass: 16, tint: "paper", r: 132, radius: 13, angle: 2.2 },
          { name: "Harbor", mass: 24, tint: "amber", r: 184, radius: 15, angle: 4.15 },
        ].forEach(function (moon) {
          var spd = orbitSpeed(sun.mass, moon.r);
          spawn({
            name: moon.name,
            mass: moon.mass,
            tint: moon.tint,
            radius: moon.radius,
            x: Math.cos(moon.angle) * moon.r,
            y: Math.sin(moon.angle) * moon.r,
            vx: -Math.sin(moon.angle) * spd,
            vy: Math.cos(moon.angle) * spd,
          });
        });
        focusId = sun.id;
      } else if (id === "moon") {
        var sunMass = 8000;
        var planetMass = 3200;
        var orbit = 260;
        var angle = 0.55;
        var relative = orbitSpeed(sunMass + planetMass, orbit);
        var star = spawn({
          name: "Helios",
          mass: sunMass,
          tint: "cyan",
          radius: 32,
          x: 0,
          y: 0,
          vx: Math.sin(angle) * relative * (planetMass / (sunMass + planetMass)),
          vy: -Math.cos(angle) * relative * (planetMass / (sunMass + planetMass)),
        });
        var planet = spawn({
          name: "Harbor",
          mass: planetMass,
          tint: "paper",
          radius: 17,
          x: Math.cos(angle) * orbit,
          y: Math.sin(angle) * orbit,
          vx: -Math.sin(angle) * relative * (sunMass / (sunMass + planetMass)),
          vy: Math.cos(angle) * relative * (sunMass / (sunMass + planetMass)),
        });
        var moonR = 34;
        var moonAngle = angle + 1.7;
        var moonSpeed = orbitSpeed(planet.mass, moonR);
        spawn({
          name: "Pip",
          mass: 12,
          tint: "pink",
          radius: 9,
          x: planet.x + Math.cos(moonAngle) * moonR,
          y: planet.y + Math.sin(moonAngle) * moonR,
          vx: planet.vx - Math.sin(moonAngle) * moonSpeed,
          vy: planet.vy + Math.cos(moonAngle) * moonSpeed,
        });
        focusId = planet.id;
        void star;
      } else if (id === "twins") {
        var mass = 3600;
        var half = 60;
        var spd = mutualSpeed(mass, 120, half);
        var a = spawn({ name: "Helios", mass: mass, tint: "cyan", radius: 26, x: -half, y: 0, vx: 0, vy: -spd });
        spawn({ name: "Solas", mass: mass, tint: "paper", radius: 24, x: half, y: 0, vx: 0, vy: spd });
        spawn({ name: "Pip", mass: 8, tint: "pink", radius: 9, x: 268, y: 0, vx: 0, vy: orbitSpeed(mass * 2, 268) });
        focusId = a.id;
        followCom = true;
      } else {
        var quiet = spawn({ name: "Helios", mass: 8000, tint: "cyan", radius: 32, x: 0, y: 0, vx: 0, vy: 0 });
        focusId = quiet.id;
      }
      warm();
      framed = false;
      follow = true;
      paintButtons();
    }

    function dominant(x, y, ignoreId) {
      var best = null;
      var bestA = 0;
      bodies.forEach(function (body) {
        if (body.id === ignoreId) return;
        var dx = body.x - x;
        var dy = body.y - y;
        var r2 = dx * dx + dy * dy + SOFT * SOFT;
        var pull = body.mass / (r2 * Math.sqrt(r2));
        if (pull > bestA) {
          bestA = pull;
          best = body;
        }
      });
      return best;
    }
    function kindOf(point, host) {
      var dx = point.x - host.x;
      var dy = point.y - host.y;
      var distance = Math.hypot(dx, dy);
      if (distance < 1) return "fall";
      var vx = point.vx - host.vx;
      var vy = point.vy - host.vy;
      var spd = Math.hypot(vx, vy);
      var softR = Math.sqrt(distance * distance + SOFT * SOFT);
      var energy = 0.5 * spd * spd - (G * host.mass) / softR;
      if (energy >= 0) return "escape";
      if (spd < orbitSpeed(host.mass, distance) * 0.28) return "fall";
      return "orbit";
    }
    function say(text) {
      if (note) note.textContent = text;
    }

    function chip(parent, label, on, fn) {
      var el = document.createElement("button");
      el.type = "button";
      el.textContent = label;
      if (on) el.className = "on";
      el.addEventListener("click", fn);
      parent.appendChild(el);
      return el;
    }
    function paintButtons() {
      var presets = document.getElementById("orbitPresets");
      var masses = document.getElementById("orbitMass");
      var tools = document.getElementById("orbitTools");
      if (!presets) return;
      presets.innerHTML = "";
      masses.innerHTML = "";
      tools.innerHTML = "";
      [
        ["orbits", "Orbits"],
        ["moon", "Moon"],
        ["twins", "Twins"],
        ["open", "Open"],
      ].forEach(function (item) {
        chip(presets, item[1], false, function () { loadPreset(item[0]); });
      });
      ["pebble", "moon", "planet", "sun"].forEach(function (id) {
        chip(masses, MASSES[id].label, massId === id, function () {
          massId = id;
          paintButtons();
        });
      });
      chip(tools, paused ? "Play" : "Pause", false, function () {
        paused = !paused;
        paintButtons();
      });
      [["launch", "Launch"], ["toss", "Toss"], ["pan", "Pan"]].forEach(function (item) {
        chip(tools, item[1], tool === item[0], function () {
          tool = item[0];
          paintButtons();
        });
      });
      var orbitBtn = chip(tools, "Put in orbit", false, addOrbiting);
      orbitBtn.className = "primary";
      chip(tools, trails ? "Trails on" : "Trails off", trails, function () {
        trails = !trails;
        paintButtons();
      });
    }

    function laneClear(host, lane, childR) {
      if (lane < host.radius + childR + 14) return false;
      return !bodies.some(function (body) {
        if (body.id === host.id) return false;
        var dist = Math.hypot(body.x - host.x, body.y - host.y);
        return Math.abs(dist - lane) < body.radius + childR + 16;
      });
    }
    function addOrbiting() {
      if (bodies.length >= 28) {
        say("The sky is full. Pick Open to start again.");
        return;
      }
      var choice = MASSES[massId];
      var host = focusBody() || heaviest();
      if (!host) return;
      var childR = radiusOf(choice.mass);
      var base = host.radius + childR + 20;
      var lane = base + 230;
      [0, 30, 62, 98, 138, 182, 230].some(function (extra) {
        if (laneClear(host, base + extra, childR)) {
          lane = base + extra;
          return true;
        }
        return false;
      });
      var angle = orbitClock;
      orbitClock += 2.399963;
      var spd = orbitSpeed(host.mass + choice.mass, lane) * (host.mass / (host.mass + choice.mass));
      spawn({
        name: nextName(massId),
        mass: choice.mass,
        tint: choice.tint,
        x: host.x + Math.cos(angle) * lane,
        y: host.y + Math.sin(angle) * lane,
        vx: host.vx - Math.sin(angle) * spd,
        vy: host.vy + Math.cos(angle) * spd,
      });
      haveA = false;
      follow = true;
    }

    function view() {
      var w = canvas.clientWidth || 320;
      var h = canvas.clientHeight || 360;
      return { w: w, h: h, fx: w / 2, fy: h / 2 };
    }
    function project(v, x, y) {
      return { x: (x - cam.x) * cam.zoom + v.fx, y: (y - cam.y) * cam.zoom + v.fy };
    }
    function unproject(v, sx, sy) {
      return { x: (sx - v.fx) / cam.zoom + cam.x, y: (sy - v.fy) / cam.zoom + cam.y };
    }
    function frameCamera() {
      var v = view();
      if (v.w < 40) return;
      var point = focusPoint();
      var body = focusBody();
      var maxR = (followCom ? 28 : body ? body.radius : 24) + 86;
      bodies.forEach(function (item) {
        var dist = Math.hypot(item.x - point.x, item.y - point.y);
        if (dist > 8 && dist < 560) maxR = Math.max(maxR, dist + item.radius + 26);
      });
      cam.zoom = clamp((Math.min(v.w, v.h) * 0.42) / maxR, 0.28, 2.15);
      cam.x = point.x;
      cam.y = point.y;
      framed = true;
    }
    function localPoint(event) {
      var rect = canvas.getBoundingClientRect();
      return { sx: event.clientX - rect.left, sy: event.clientY - rect.top };
    }
    function hitBody(sx, sy) {
      var v = view();
      var world = unproject(v, sx, sy);
      var best = null;
      var bestD = Infinity;
      bodies.forEach(function (body) {
        var dist = Math.hypot(body.x - world.x, body.y - world.y);
        var pad = body.radius + 12 / cam.zoom;
        if (dist <= pad && dist < bestD) {
          best = body;
          bestD = dist;
        }
      });
      return best;
    }

    canvas.addEventListener("pointerdown", function (event) {
      canvas.setPointerCapture(event.pointerId);
      var point = localPoint(event);
      pointers[event.pointerId] = point;
      var ids = Object.keys(pointers);
      if (ids.length >= 2) {
        drag = { kind: "pinch" };
        pinch = null;
        follow = false;
        return;
      }
      var hit = hitBody(point.sx, point.sy);
      if (tool === "pan" || (tool === "toss" && !hit)) {
        drag = { kind: "pan", id: event.pointerId, sx: point.sx, sy: point.sy, camX: cam.x, camY: cam.y };
        follow = false;
        return;
      }
      if (hit) {
        drag = { kind: "toss", id: event.pointerId, bodyId: hit.id, sx: point.sx, sy: point.sy, moved: false, sx0: point.sx, sy0: point.sy };
        return;
      }
      var world = unproject(view(), point.sx, point.sy);
      drag = { kind: "launch", id: event.pointerId, x: world.x, y: world.y, sx: point.sx, sy: point.sy, moved: false };
    });
    canvas.addEventListener("pointermove", function (event) {
      var point = localPoint(event);
      if (pointers[event.pointerId]) pointers[event.pointerId] = point;
      if (!drag) return;
      if (drag.kind === "pinch") {
        var pts = Object.keys(pointers).map(function (key) { return pointers[key]; });
        if (pts.length < 2) return;
        var dist = Math.hypot(pts[0].sx - pts[1].sx, pts[0].sy - pts[1].sy);
        if (!pinch) {
          pinch = { dist: Math.max(12, dist), zoom: cam.zoom };
          return;
        }
        cam.zoom = clamp(pinch.zoom * (dist / pinch.dist), 0.28, 2.4);
        return;
      }
      if (drag.id !== event.pointerId) return;
      if (drag.kind === "pan") {
        var scale = 1 / cam.zoom;
        cam.x = drag.camX - (point.sx - drag.sx) * scale;
        cam.y = drag.camY - (point.sy - drag.sy) * scale;
        return;
      }
      drag.cursor = point;
      drag.moved = drag.moved || Math.hypot(point.sx - drag.sx, point.sy - drag.sy) > 8;
    });
    function endPointer(event) {
      var point = localPoint(event);
      delete pointers[event.pointerId];
      if (!drag || (drag.kind !== "pinch" && drag.id !== event.pointerId)) {
        if (Object.keys(pointers).length < 2) drag = null;
        return;
      }
      if (drag.kind === "pinch") {
        pinch = null;
        if (Object.keys(pointers).length < 2) drag = null;
        return;
      }
      if (drag.kind === "launch" && drag.moved) {
        var choice = MASSES[massId];
        var aim = unproject(view(), point.sx, point.sy);
        var vx = (aim.x - drag.x) * FLING;
        var vy = (aim.y - drag.y) * FLING;
        var mag = Math.hypot(vx, vy);
        if (mag > 460) {
          vx = (vx / mag) * 460;
          vy = (vy / mag) * 460;
        }
        if (bodies.length >= 28) say("The sky is full.");
        else {
          spawn({
            name: nextName(massId),
            mass: choice.mass,
            tint: choice.tint,
            x: drag.x,
            y: drag.y,
            vx: vx,
            vy: vy,
          });
          haveA = false;
        }
      } else if (drag.kind === "toss" && drag.moved) {
        var body = bodies.filter(function (item) { return item.id === drag.bodyId; })[0];
        if (body) {
          var aim2 = unproject(view(), point.sx, point.sy);
          body.vx = (aim2.x - body.x) * FLING;
          body.vy = (aim2.y - body.y) * FLING;
          body.trail = [];
          haveA = false;
        }
      }
      drag = null;
    }
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    function ghost() {
      if (!drag || (drag.kind !== "launch" && drag.kind !== "toss") || !drag.moved || !drag.cursor) return null;
      var v = view();
      var aim = unproject(v, drag.cursor.sx, drag.cursor.sy);
      var x;
      var y;
      var who;
      var mass;
      var tint;
      var radius;
      if (drag.kind === "launch") {
        var choice = MASSES[massId];
        x = drag.x;
        y = drag.y;
        mass = choice.mass;
        tint = choice.tint;
        radius = radiusOf(mass);
        who = "This " + choice.label.toLowerCase();
      } else {
        var body = bodies.filter(function (item) { return item.id === drag.bodyId; })[0];
        if (!body) return null;
        x = body.x;
        y = body.y;
        mass = body.mass;
        tint = body.tint;
        radius = body.radius;
        who = body.name;
      }
      var vx = (aim.x - x) * FLING;
      var vy = (aim.y - y) * FLING;
      var host = dominant(x, y);
      var kind = host ? kindOf({ x: x, y: y, vx: vx, vy: vy }, host) : "escape";
      if (host && kind === "orbit") say(who + " will circle " + host.name + ".");
      else if (host && kind === "fall") say(who + " will fall toward " + host.name + ".");
      else if (host) say(who + " will fly past " + host.name + ".");
      var clones = bodies.map(function (body) {
        return { x: body.x, y: body.y, vx: body.vx, vy: body.vy, mass: body.mass };
      });
      var probe = { x: x, y: y, vx: vx, vy: vy, mass: mass };
      clones.push(probe);
      var acc = [];
      var path = [{ x: x, y: y }];
      var dt = 1 / 40;
      for (var s = 0; s < 160; s++) {
        accelerations(clones, acc);
        for (var i = 0; i < clones.length; i++) {
          clones[i].vx += acc[i].ax * dt;
          clones[i].vy += acc[i].ay * dt;
          clones[i].x += clones[i].vx * dt;
          clones[i].y += clones[i].vy * dt;
        }
        if (s % 2 === 0) path.push({ x: probe.x, y: probe.y });
      }
      return { x: x, y: y, radius: radius, tint: tint, path: path, aim: aim, show: drag.kind === "launch" };
    }

    function drawDisk(x, y, radius, color) {
      var glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.4);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      var disk = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
      disk.addColorStop(0, "#ffffff");
      disk.addColorStop(0.35, color);
      disk.addColorStop(1, "#12081c");
      ctx.fillStyle = disk;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, radius), 0, Math.PI * 2);
      ctx.fill();
    }

    function paint() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 320;
      var h = canvas.clientHeight || 360;
      var bw = Math.max(1, Math.floor(w * dpr));
      var bh = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#070714";
      ctx.fillRect(0, 0, w, h);
      var v = view();
      if (!framed) frameCamera();
      var count = document.getElementById("orbitCount");
      if (count) count.textContent = bodies.length + (bodies.length === 1 ? " BODY" : " BODIES");
      bodies.forEach(function (body) {
        if (!trails || body.trail.length < 2) return;
        ctx.strokeStyle = COLORS[body.tint] || COLORS.cyan;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        var first = project(v, body.trail[0].x, body.trail[0].y);
        ctx.moveTo(first.x, first.y);
        for (var i = 1; i < body.trail.length; i++) {
          var p = project(v, body.trail[i].x, body.trail[i].y);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      var preview = ghost();
      if (preview) {
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = "#05d9e8";
        ctx.beginPath();
        preview.path.forEach(function (p, index) {
          var at = project(v, p.x, p.y);
          if (index === 0) ctx.moveTo(at.x, at.y);
          else ctx.lineTo(at.x, at.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        var from = project(v, preview.x, preview.y);
        var to = project(v, preview.aim.x, preview.aim.y);
        ctx.strokeStyle = "#ff2a6d";
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        if (preview.show) drawDisk(from.x, from.y, preview.radius * cam.zoom, COLORS[preview.tint]);
      }
      bodies.forEach(function (body) {
        var at = project(v, body.x, body.y);
        drawDisk(at.x, at.y, body.radius * cam.zoom, COLORS[body.tint] || COLORS.cyan);
        if (body.radius * cam.zoom > 8) {
          ctx.fillStyle = "#f4fbff";
          ctx.font = "600 12px Rajdhani, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(body.name, at.x, at.y + body.radius * cam.zoom + 14);
        }
      });
    }

    function loop(now) {
      if (!alive) return;
      var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (!paused) {
        accum += dt * speed;
        var steps = 0;
        while (accum >= 1 / 120 && steps < 8) {
          step(1 / 120);
          accum -= 1 / 120;
          steps += 1;
        }
      }
      if (follow) {
        var point = focusPoint();
        var glide = 1 - Math.exp(-3.2 * dt);
        cam.x += (point.x - cam.x) * glide;
        cam.y += (point.y - cam.y) * glide;
      }
      paint();
      raf = requestAnimationFrame(loop);
    }

    loadPreset("orbits");
    paintButtons();
    say("Smaller worlds circle the bigger one. Drag to launch your own.");
    raf = requestAnimationFrame(loop);
    stopCurrent = function () {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }
})();
