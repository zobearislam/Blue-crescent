/* Blue Crescent — folders (lessons > subjects > chapters) + Duolingo-style quizzes */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var slug = function (s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var read = function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  var app = $('#app'), crumbsEl = $('#crumbs'), quizRoot = $('#quiz');
  var repo = { subjects: [] };
  try { localStorage.removeItem('bc_local'); } catch (e) {}
  var done = read('bc_done', {});

  /* ---------- data ---------- */
  function getQuiz(sub, ch) {
    var key = sub.id + '/' + ch.id;
    return fetch(encodeURI('lessons/' + (ch.quiz || key + '/quiz.json')), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function validate(d) {
    if (!d || !Array.isArray(d.questions) || !d.questions.length) return 'Needs a "questions" list with at least one question.';
    for (var i = 0; i < d.questions.length; i++) {
      var q = d.questions[i], n = 'Question ' + (i + 1);
      if (!q || !q.q) return n + ' is missing "q".';
      if (q.type === 'text') {
        if (q.answer == null || q.answer === '') return n + ' needs an "answer".';
      } else {
        if (!Array.isArray(q.options) || q.options.length < 2) return n + ' needs at least 2 "options".';
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length || q.answer % 1)
          return n + ': "answer" must be the position of the right option, starting at 0.';
      }
    }
    return null;
  }

  /* ---------- auto-discovery of repo folders (GitHub Pages) ---------- */
  // Any folder lessons/<subject>/<chapter>/ in the repo shows up automatically.
  // Optional lessons/<subject>/subject.json: { "name": "History", "icon": "📜" }
  function pretty(id) {
    var t = id.replace(/^\d+[-_.\s]*/, '').replace(/[-_]+/g, ' ').trim() || id;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function fromTree(paths) {
    var map = {}, order = [];
    paths.forEach(function (p) {
      var m = /^lessons\/([^\/]+)\/([^\/]+)\/.+/.exec(p);
      if (m) {
        var s = map[m[1]];
        if (!s) { s = map[m[1]] = { id: m[1], name: pretty(m[1]), icon: '📁', chapters: [], seen: {} }; order.push(m[1]); }
        if (!s.seen[m[2]]) { s.seen[m[2]] = 1; s.chapters.push({ id: m[2], name: pretty(m[2]) }); }
      }
    });
    order.sort(); 
    return order.map(function (id) {
      var s = map[id]; delete s.seen;
      s.chapters.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
      s.hasMeta = paths.indexOf('lessons/' + id + '/subject.json') !== -1;
      return s;
    });
  }

  function discover() {
    var host = location.hostname, parts = location.pathname.split('/').filter(Boolean);
    if (!/\.github\.io$/.test(host)) return Promise.resolve([]);
    var owner = host.split('.')[0];
    var repoName = parts[0] && parts[0].indexOf('.') === -1 ? parts[0] : host;
    var cacheKey = 'bc_tree', cached = read(cacheKey, null);
    var tree = cached && Date.now() - cached.t < 120000
      ? Promise.resolve(cached.paths)
      : fetch('https://api.github.com/repos/' + owner + '/' + repoName + '/git/trees/HEAD?recursive=1')
          .then(function (r) { if (!r.ok) throw new Error('tree'); return r.json(); })
          .then(function (d) {
            var paths = (d.tree || []).filter(function (n) { return n.type === 'blob'; }).map(function (n) { return n.path; });
            write(cacheKey, { t: Date.now(), paths: paths });
            return paths;
          });
    return tree.then(function (paths) {
      var subs = fromTree(paths);
      return Promise.all(subs.map(function (s) {
        if (!s.hasMeta) return s;
        return fetch(encodeURI('lessons/' + s.id + '/subject.json'), { cache: 'no-cache' })
          .then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
          .then(function (m) { if (m.name) s.name = m.name; if (m.icon) s.icon = m.icon; return s; });
      }));
    }).catch(function () { return []; });
  }

  // lessons.json wins on names/icons; discovered folders fill in the rest.
  function combine(manifest, found) {
    var map = {}, order = [];
    manifest.concat(found).forEach(function (s) {
      var m = map[s.id];
      if (!m) { m = map[s.id] = { id: s.id, name: s.name, icon: s.icon, chapters: [] }; order.push(s.id); }
      (s.chapters || []).forEach(function (c) {
        if (!m.chapters.some(function (x) { return x.id === c.id; })) m.chapters.push({ id: c.id, name: c.name, quiz: c.quiz });
      });
    });
    return order.map(function (id) { return map[id]; });
  }

  /* ---------- views ---------- */
  function setCrumbs(items) {
    crumbsEl.innerHTML = items.map(function (c) {
      return '<span class="sep">/</span>' + (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span>' + esc(c[0]) + '</span>');
    }).join('');
  }

  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  function home(subs) {
    setCrumbs([]);
    app.innerHTML = '<section class="panel"><h1>Welcome 🌙</h1>' +
      '<p class="sub">Open Lessons, pick a subject, then a chapter to start a quiz.</p>' +
      '<div class="folders"><a class="folder" href="#/lessons"><span class="ico">📁</span><span class="name">Lessons</span>' +
      '<span class="meta">' + plural(subs.length, 'subject') + '</span></a></div></section>';
  }

  function lessons(subs) {
    setCrumbs([['Lessons']]);
    app.innerHTML = '<section class="panel"><h1>📁 Lessons</h1><p class="sub">Choose a subject.</p>' +
      (subs.length ? '<div class="folders">' + subs.map(function (s) {
        return '<a class="folder" href="#/lessons/' + encodeURIComponent(s.id) + '"><span class="ico">' + esc(s.icon || '📁') + '</span>' +
          '<span class="name">' + esc(s.name) + '</span><span class="meta">' + plural(s.chapters.length, 'chapter') + '</span></a>';
      }).join('') + '</div>' : '<div class="empty">No subjects yet. Check back soon.</div>') + '</section>';
  }

  function subject(sub) {
    setCrumbs([['Lessons', '#/lessons'], [sub.name]]);
    app.innerHTML = '<section class="panel"><h1>' + esc(sub.icon || '📁') + ' ' + esc(sub.name) + '</h1><p class="sub">Choose a chapter.</p>' +
      (sub.chapters.length ? '<div class="folders">' + sub.chapters.map(function (c) {
        var isDone = done[sub.id + '/' + c.id];
        return '<a class="folder' + (isDone ? ' done' : '') + '" href="#/lessons/' + encodeURIComponent(sub.id) + '/' + encodeURIComponent(c.id) + '">' +
          '<span class="ico">' + (isDone ? '✅' : '📂') + '</span><span class="name">' + esc(c.name) + '</span>' +
          '<span class="meta">' + (isDone ? 'Completed' : 'Not started') + '</span></a>';
      }).join('') + '</div>' : '<div class="empty">No chapters yet. Check back soon.</div>') + '</section>';
  }

  function chapter(sub, ch) {
    var hash = location.hash;
    var key = sub.id + '/' + ch.id;
    setCrumbs([['Lessons', '#/lessons'], [sub.name, '#/lessons/' + encodeURIComponent(sub.id)], [ch.name]]);
    app.innerHTML = '<section class="panel"><h1>📂 ' + esc(ch.name) + '</h1><p class="sub">' + esc(sub.name) + '</p>' +
      '<div id="status" class="empty">Loading quiz…</div><div class="row" id="actions"></div></section>';

    getQuiz(sub, ch).then(function (quiz) {
      if (location.hash !== hash) return;
      var st = $('#status'), act = $('#actions');
      if (!quiz) { st.textContent = 'No quiz here yet. Check back soon.'; return; }
      var err = validate(quiz);
      if (err) { st.className = 'msg'; st.textContent = 'This quiz has a problem: ' + err; return; }
      var hasInfo = [].concat(quiz.info || []).filter(Boolean).length > 0;
      st.className = ''; st.innerHTML = '<strong>' + esc(quiz.title || ch.name) + '</strong><br>' + plural(quiz.questions.length, 'question') + (hasInfo ? ' · starts with a short intro' : '');
      act.innerHTML = '<button class="btn good" id="start">' + (done[key] ? 'Practice again' : 'Start quiz') + '</button>';
      $('#start').onclick = function () { runQuiz(quiz, key, ch.name); };
    });
  }

  function notFound() {
    setCrumbs([['Lessons', '#/lessons']]);
    app.innerHTML = '<section class="panel"><h1>Folder not found</h1><p class="sub">It may have been renamed or removed.</p><a class="btn" href="#/lessons">Back to Lessons</a></section>';
  }

  function render() {
    var p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    var subs = repo.subjects;
    window.scrollTo(0, 0);
    if (p[0] !== 'lessons') return home(subs);
    if (p.length === 1) return lessons(subs);
    var sub = subs.filter(function (s) { return s.id === p[1]; })[0];
    if (!sub) return notFound();
    if (p.length === 2) return subject(sub);
    var ch = sub.chapters.filter(function (c) { return c.id === p[2]; })[0];
    if (!ch) return notFound();
    chapter(sub, ch);
  }

  /* ---------- quiz (Duolingo-style) ---------- */
  function runQuiz(quiz, key, title) {
    var qs = quiz.questions, total = qs.length;
    var info = [].concat(quiz.info || []).filter(Boolean);
    var queue, solved, hearts, firstTry, seen;

    quizRoot.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    function close() {
      quizRoot.hidden = true; quizRoot.innerHTML = '';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      render();
    }
    function onKey(e) {
      if (quizRoot.hidden) return;
      var main = $('#main', quizRoot);
      if (e.key === 'Enter' && main && !main.disabled) { e.preventDefault(); main.click(); return; }
      var typing = document.activeElement && document.activeElement.tagName === 'INPUT';
      if (!typing && /^[1-9]$/.test(e.key)) {
        var o = quizRoot.querySelectorAll('.opt')[+e.key - 1];
        if (o && !o.disabled) o.click();
      }
    }
    function frame(body, foot, pct) {
      quizRoot.innerHTML = '<div class="q-shell"><div class="q-top"><button class="q-x" aria-label="Quit quiz">✕</button>' +
        '<div class="q-bar"><i style="width:' + pct + '%"></i></div><div class="q-hearts" aria-label="Hearts left">❤ ' + (hearts == null ? 3 : hearts) + '</div></div>' +
        '<div class="q-body">' + body + '</div><div class="q-foot">' + foot + '</div></div>';
      $('.q-x', quizRoot).onclick = close;
    }
    function begin() {
      queue = qs.map(function (_, i) { return i; });
      solved = 0; hearts = 3; firstTry = 0; seen = {};
      ask();
    }
    function intro() {
      hearts = 3;
      frame('<h2>' + esc(quiz.title || title) + '</h2><div class="info">' + info.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>',
        '<button class="btn good" id="main">Start quiz</button>', 0);
      $('#main').onclick = begin;
    }

    function ask() {
      if (!queue.length) return finish();
      var i = queue[0], q = qs[i], isText = q.type === 'text', picked = null, checked = false;
      var body = '<h2>' + esc(q.q) + '</h2>' + (isText
        ? '<input class="typed" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer">'
        : '<div class="opts">' + q.options.map(function (o, k) { return '<button class="opt" data-k="' + k + '"><kbd>' + (k + 1) + '</kbd>' + esc(o) + '</button>'; }).join('') + '</div>');
      frame(body, '<button class="btn" id="main" disabled>Check</button>', solved / total * 100);
      $('.q-hearts', quizRoot).textContent = '❤ ' + hearts;
      var main = $('#main'), foot = $('.q-foot', quizRoot);

      if (isText) {
        var inp = $('#ans'); inp.focus();
        inp.oninput = function () { main.disabled = !inp.value.trim(); };
      } else {
        var opts = quizRoot.querySelectorAll('.opt');
        Array.prototype.forEach.call(opts, function (b) {
          b.onclick = function () {
            if (checked) return;
            picked = +b.dataset.k;
            Array.prototype.forEach.call(opts, function (x) { x.classList.toggle('sel', x === b); });
            main.disabled = false;
          };
        });
      }

      main.onclick = function () {
        if (checked) { return hearts <= 0 ? failed() : ask(); }
        checked = true;
        var ok, shown;
        if (isText) {
          var answers = [].concat(q.answer).map(function (a) { return String(a).trim().toLowerCase(); });
          var inp2 = $('#ans'); inp2.disabled = true;
          ok = answers.indexOf(inp2.value.trim().toLowerCase()) !== -1;
          shown = [].concat(q.answer)[0];
        } else {
          ok = picked === q.answer;
          shown = q.options[q.answer];
          Array.prototype.forEach.call(opts, function (b, k) {
            b.disabled = true;
            b.classList.remove('sel');
            if (k === q.answer) b.classList.add('right');
            else if (k === picked) b.classList.add('wrong');
          });
        }
        queue.shift();
        if (ok) { solved++; if (!seen[i]) firstTry++; } else { hearts--; queue.push(i); }
        seen[i] = true;

        var praise = ['Correct!', 'Nice one!', 'Well done!', 'Exactly right!'][Math.floor(Math.random() * 4)];
        foot.className = 'q-foot ' + (ok ? 'good' : 'bad');
        foot.innerHTML = '<div class="fb">' + (ok ? praise : 'Not quite. Answer: ' + esc(shown)) +
          (q.explain ? '<small>' + esc(q.explain) + '</small>' : '') + '</div><button class="btn ' + (ok ? 'good' : 'red') + '" id="main">Continue</button>';
        $('.q-hearts', quizRoot).textContent = '❤ ' + hearts;
        $('.q-bar i', quizRoot).style.width = (solved / total * 100) + '%';
        main = $('#main'); main.onclick = function () { hearts <= 0 ? failed() : ask(); };
        main.focus();
      };
    }

    function failed() {
      frame('<div class="result"><div class="big">💔</div><h2>Out of hearts</h2><p>Take another look and try again.</p></div>',
        '<button class="btn good" id="main">Try again</button>', solved / total * 100);
      $('#main').onclick = begin;
    }

    function finish() {
      done[key] = true; write('bc_done', done);
      var acc = Math.round(firstTry / total * 100);
      frame('<div class="result"><div class="big">🎉</div><h2>Chapter complete!</h2>' +
        '<div class="stats"><div class="stat"><b>' + acc + '%</b>first try</div><div class="stat"><b>❤ ' + hearts + '</b>hearts left</div></div></div>',
        '<button class="btn good" id="main">Continue</button>', 100);
      $('#main').onclick = close;
    }

    info.length ? intro() : begin();
  }

  /* ---------- start ---------- */
  window.addEventListener('hashchange', render);
  var manifestP = fetch('lessons/lessons.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : { subjects: [] }; })
    .catch(function () { return { subjects: [] }; });
  Promise.all([manifestP, discover()]).then(function (res) {
    repo = { subjects: combine(res[0] && res[0].subjects ? res[0].subjects : [], res[1]) };
    render();
  });
})();
