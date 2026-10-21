/* Blue Crescent — lessons > subjects > chapters > subchapters, plus optional sub-subjects */
(function () {
  'use strict';
  if (window.__bcApp) return;
  window.__bcApp = true;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c];
    });
  };
  var read = function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  var app = $('#app'), crumbsEl = $('#crumbs'), quizRoot = $('#quiz');
  var repo = { subjects: [] };
  try { localStorage.removeItem('bc_local'); } catch (e) {}
  var done = read('bc_done', {});

  function quizUrl(sub, ch, leaf, group) {
    if (leaf && leaf.quiz) return leaf.quiz;
    if (!leaf && ch.quiz) return ch.quiz;
    return 'lessons/' + sub.id + '/' + (group ? group.id + '/' : '') + ch.id + (leaf ? '/' + leaf.id : '') + '/quiz.json';
  }
  function getQuiz(sub, ch, leaf, group) {
    return fetch(encodeURI(quizUrl(sub, ch, leaf, group)), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function hasQuiz(ch) { return ch.hasQuiz !== false; }
  function itemKey(s, c, sub, group) { return s.id + '/' + (group ? group.id + '/' : '') + c.id + (sub ? '/' + sub.id : ''); }
  function itemHref(s, c, sub, group) {
    var base = '#/lessons/' + encodeURIComponent(s.id) + (group ? '/' + encodeURIComponent(group.id) : '') + '/' + encodeURIComponent(c.id);
    if (sub) return base + '/' + encodeURIComponent(sub.id);
    if (c.subs && c.subs.length && hasQuiz(c)) return base + '/quiz';
    return base;
  }
  function leavesOf(s, c, group) {
    var list = [];
    if (hasQuiz(c)) list.push({ subject: s, chapter: c, sub: null, group: group || null });
    (c.subs || []).forEach(function (sub) { list.push({ subject: s, chapter: c, sub: sub, group: group || null }); });
    return list;
  }
  function chaptersInOrder(s) {
    var list = (s.chapters || []).map(function (c) { return { c: c, g: null }; });
    (s.groups || []).forEach(function (g) {
      (g.chapters || []).forEach(function (c) { list.push({ c: c, g: g }); });
    });
    return list;
  }
  function allLeaves() {
    var list = [];
    repo.subjects.forEach(function (s) {
      chaptersInOrder(s).forEach(function (row) {
        leavesOf(s, row.c, row.g).forEach(function (leaf) { list.push(leaf); });
      });
    });
    return list;
  }
  function chapterDone(s, c, group) {
    var leaves = leavesOf(s, c, group);
    return leaves.length > 0 && leaves.every(function (leaf) { return done[itemKey(leaf.subject, leaf.chapter, leaf.sub, leaf.group)]; });
  }
  function groupDone(s, g) {
    return (g.chapters || []).length > 0 && g.chapters.every(function (c) { return chapterDone(s, c, g); });
  }
  function quizCount(chapters) {
    return (chapters || []).reduce(function (n, c) {
      return n + (hasQuiz(c) ? 1 : 0) + ((c.subs || []).length);
    }, 0);
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

  function pretty(id) {
    var t = id.replace(/^\d+[-_.\s]*/, '').replace(/^zz-/, '').replace(/[-_]+/g, ' ').trim() || id;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function fromTree(paths) {
    var groupSet = {};
    paths.forEach(function (p) {
      var parts = p.split('/');
      if (parts.length === 4 && parts[0] === 'lessons' && parts[3] === 'subsubject.json' && parts[1].indexOf('.') === -1 && parts[2].indexOf('.') === -1) {
        groupSet[parts[1] + '/' + parts[2]] = true;
      }
    });
    var map = {}, order = [];
    function tidyChapter(c) {
      delete c.seenSub;
      c.subs.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    }
    paths.forEach(function (p) {
      var parts = p.split('/');
      if (parts[0] !== 'lessons' || parts.length < 3) return;
      var sid = parts[1];
      if (!sid || sid.indexOf('.') !== -1) return;
      var s = map[sid];
      if (!s) {
        s = map[sid] = { id: sid, name: pretty(sid), icon: '📁', chapters: [], groups: [], seen: {}, seenGroup: {} };
        order.push(sid);
      }
      if (parts[2] === 'subject.json') { s.hasMeta = true; return; }
      var cid = parts[2];
      if (!cid || cid.indexOf('.') !== -1) return;
      if (groupSet[sid + '/' + cid]) {
        var g = s.seenGroup[cid];
        if (!g) {
          g = s.seenGroup[cid] = { id: cid, name: pretty(cid.replace(/^zz-/, '')), icon: '📚', chapters: [], seen: {}, hasMeta: false };
          s.groups.push(g);
        }
        if (parts.length === 4 && parts[3] === 'subsubject.json') { g.hasMeta = true; return; }
        if (parts.length < 5) return;
        var gcid = parts[3];
        if (!gcid || gcid.indexOf('.') !== -1) return;
        var gch = g.seen[gcid];
        if (!gch) {
          gch = g.seen[gcid] = { id: gcid, name: pretty(gcid), subs: [], seenSub: {}, hasQuiz: false };
          g.chapters.push(gch);
        }
        if (parts.length === 5 && parts[4] === 'quiz.json') { gch.hasQuiz = true; return; }
        if (parts.length >= 6 && parts[4].indexOf('.') === -1) {
          var gsubid = parts[4];
          if (!gch.seenSub[gsubid]) {
            gch.seenSub[gsubid] = 1;
            gch.subs.push({ id: gsubid, name: pretty(gsubid) });
          }
        }
        return;
      }
      var ch = s.seen[cid];
      if (!ch) {
        ch = s.seen[cid] = { id: cid, name: pretty(cid), subs: [], seenSub: {}, hasQuiz: false };
        s.chapters.push(ch);
      }
      if (parts.length === 4 && parts[3] === 'quiz.json') { ch.hasQuiz = true; return; }
      if (parts.length >= 5 && parts[3].indexOf('.') === -1) {
        var subid = parts[3];
        if (!ch.seenSub[subid]) {
          ch.seenSub[subid] = 1;
          ch.subs.push({ id: subid, name: pretty(subid) });
        }
      }
    });
    order.sort();
    return order.map(function (id) {
      var s = map[id];
      delete s.seen;
      delete s.seenGroup;
      s.chapters.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
      s.chapters.forEach(tidyChapter);
      s.groups.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
      s.groups.forEach(function (g) {
        delete g.seen;
        g.chapters.sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
        g.chapters.forEach(tidyChapter);
      });
      return s;
    });
  }

  function discover() {
    var host = location.hostname, parts = location.pathname.split('/').filter(Boolean);
    if (!/\.github\.io$/.test(host)) return Promise.resolve([]);
    var owner = host.split('.')[0];
    var repoName = parts[0] && parts[0].indexOf('.') === -1 ? parts[0] : host;
    var cacheKey = 'bc_tree_v3', cached = read(cacheKey, null);
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
        var subjectMeta = !s.hasMeta ? Promise.resolve(s) : fetch(encodeURI('lessons/' + s.id + '/subject.json'), { cache: 'no-cache' })
          .then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
          .then(function (m) { if (m.name) s.name = m.name; if (m.icon) s.icon = m.icon; return s; });
        return subjectMeta.then(function () {
          return Promise.all((s.groups || []).map(function (g) {
            if (!g.hasMeta) return g;
            return fetch(encodeURI('lessons/' + s.id + '/' + g.id + '/subsubject.json'), { cache: 'no-cache' })
              .then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
              .then(function (m) {
                if (m.name) g.name = m.name;
                if (m.icon) g.icon = m.icon;
                if (m.blurb) g.blurb = m.blurb;
                var byId = {};
                (m.chapters || []).forEach(function (c) { if (c && c.id) byId[c.id] = c; });
                g.chapters.forEach(function (c) {
                  var o = byId[c.id];
                  if (!o) return;
                  if (o.name) c.name = o.name;
                  if (o.level) c.level = o.level;
                });
                return g;
              });
          })).then(function () { return s; });
        });
      }));
    }).catch(function () { return []; });
  }

  function combine(manifest, found) {
    var map = {}, order = [];
    function takeSub(ch, sub) {
      if (!ch.subs.some(function (x) { return x.id === sub.id; })) ch.subs.push({ id: sub.id, name: sub.name, quiz: sub.quiz });
    }
    function mergeChapter(list, c) {
      var existing = list.filter(function (x) { return x.id === c.id; })[0];
      if (!existing) {
        existing = { id: c.id, name: c.name, quiz: c.quiz, subs: [], hasQuiz: c.hasQuiz, level: c.level };
        list.push(existing);
      } else {
        if (c.level && !existing.level) existing.level = c.level;
        if (c.hasQuiz === true) existing.hasQuiz = true;
        else if (c.hasQuiz === false && existing.hasQuiz !== true) existing.hasQuiz = false;
      }
      (c.subs || []).forEach(function (sub) { takeSub(existing, sub); });
    }
    manifest.concat(found).forEach(function (s) {
      var m = map[s.id];
      if (!m) { m = map[s.id] = { id: s.id, name: s.name, icon: s.icon, chapters: [], groups: [] }; order.push(s.id); }
      else {
        if (!m.name && s.name) m.name = s.name;
        if (!m.icon && s.icon) m.icon = s.icon;
        if (!m.groups) m.groups = [];
      }
      (s.chapters || []).forEach(function (c) { mergeChapter(m.chapters, c); });
      (s.groups || []).forEach(function (g) {
        var existing = m.groups.filter(function (x) { return x.id === g.id; })[0];
        if (!existing) {
          existing = { id: g.id, name: g.name, icon: g.icon || '📚', blurb: g.blurb, chapters: [] };
          m.groups.push(existing);
        } else {
          if (g.name && existing.name === pretty(g.id.replace(/^zz-/, ''))) existing.name = g.name;
          if (g.icon) existing.icon = g.icon;
          if (g.blurb) existing.blurb = g.blurb;
        }
        (g.chapters || []).forEach(function (c) { mergeChapter(existing.chapters, c); });
      });
    });
    return order.map(function (id) { return map[id]; });
  }

  function setCrumbs(items) {
    crumbsEl.innerHTML = items.map(function (c) {
      return '<span class="sep">/</span>' + (c[1] ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span>' + esc(c[0]) + '</span>');
    }).join('');
  }

  var qInput = $('#q'), hits = $('#hits'), searchForm = $('#search-form');

  function counts() {
    var chapters = 0, subs = 0, groups = 0;
    repo.subjects.forEach(function (s) {
      groups += (s.groups || []).length;
      chaptersInOrder(s).forEach(function (row) {
        chapters++;
        subs += (row.c.subs || []).length;
      });
    });
    return { chapters: chapters, subs: subs, groups: groups, quizzes: allLeaves().length };
  }
  function findHits(query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    var out = [];
    function walkChapter(s, c, group) {
      var gname = group ? group.name : '';
      if ((c.name + ' ' + c.id + ' ' + s.name + ' ' + gname).toLowerCase().indexOf(q) !== -1) {
        out.push({ kind: 'chapter', subject: s, chapter: c, group: group || null });
      }
      (c.subs || []).forEach(function (sub) {
        if ((sub.name + ' ' + sub.id + ' ' + c.name + ' ' + s.name + ' ' + gname).toLowerCase().indexOf(q) !== -1) {
          out.push({ kind: 'sub', subject: s, chapter: c, sub: sub, group: group || null });
        }
      });
    }
    repo.subjects.forEach(function (s) {
      if ((s.name + ' ' + s.id).toLowerCase().indexOf(q) !== -1) out.push({ kind: 'subject', subject: s });
      s.chapters.forEach(function (c) { walkChapter(s, c, null); });
      (s.groups || []).forEach(function (g) {
        if ((g.name + ' ' + g.id + ' ' + s.name).toLowerCase().indexOf(q) !== -1) out.push({ kind: 'group', subject: s, group: g });
        g.chapters.forEach(function (c) { walkChapter(s, c, g); });
      });
    });
    return out;
  }
  function leafCard(s, c, sub, meta, title, group) {
    var key = itemKey(s, c, sub, group);
    var isDone = !!done[key];
    var name = title || (sub ? sub.name : c.name);
    return '<a class="folder' + (isDone ? ' done' : '') + '" href="' + itemHref(s, c, sub, group) + '">' +
      '<span class="ico">' + (isDone ? '✅' : esc(sub ? '📄' : (group ? '📄' : (s.icon || '📂')))) + '</span>' +
      '<span class="name">' + esc(name) + '</span>' +
      '<span class="meta">' + esc(meta) + '</span></a>';
  }
  function markTab(first) {
    Array.prototype.forEach.call(document.querySelectorAll('#tabs a'), function (a) {
      var on = a.getAttribute('data-tab') === first;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function mixOf(pool, n) {
    var arr = pool.slice(), seed = Math.floor(Date.now() / 86400000) || 1;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr.slice(0, n);
  }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function chapterBits(c) {
    var n = (c.subs || []).length;
    var bits = [];
    if (c.level) bits.push(c.level);
    if (hasQuiz(c)) bits.push('quiz');
    if (n) bits.push(plural(n, 'subchapter'));
    return bits.join(' · ') || 'Quiz';
  }
  function subjectMeta(s) {
    var subCount = s.chapters.reduce(function (n, c) { return n + (c.subs || []).length; }, 0);
    var gcount = (s.groups || []).length;
    return plural(s.chapters.length, 'chapter') + (gcount ? ' · ' + plural(gcount, 'sub-subject') : '') + (subCount ? ' · ' + plural(subCount, 'subchapter') : '');
  }
  function leafContext(it) {
    var base = it.group ? it.subject.name + ' · ' + it.group.name : it.subject.name;
    if (it.sub) base += ' · ' + it.chapter.name;
    if (!it.sub && it.chapter.level) base += ' · ' + it.chapter.level;
    return base;
  }

  function home() {
    var c = counts();
    setCrumbs([]);
    app.innerHTML = '<section class="panel"><h1>Welcome 🌙</h1>' +
      '<p class="sub">Search at the top, open For You for a short path, or browse subjects, sub-subjects, chapters, and subchapters.</p>' +
      '<div class="folders">' +
      '<a class="folder" href="#/foryou"><span class="ico">✨</span><span class="name">For You</span><span class="meta">Picked from quizzes you have not finished</span></a>' +
      '<a class="folder" href="#/lessons"><span class="ico">📁</span><span class="name">Lessons</span><span class="meta">' +
      plural(repo.subjects.length, 'subject') + (c.groups ? ' · ' + plural(c.groups, 'sub-subject') : '') + ' · ' + plural(c.chapters, 'chapter') + ' · ' + plural(c.subs, 'subchapter') + '</span></a>' +
      '</div></section>';
  }

  function forYou() {
    setCrumbs([['For You']]);
    var items = allLeaves();
    var total = items.length;
    var finished = items.filter(function (it) { return done[itemKey(it.subject, it.chapter, it.sub, it.group)]; }).length;
    var pct = total ? Math.round(finished / total * 100) : 0;
    var last = read('bc_last', null), lastItem = null;
    if (last && last.s && last.c) {
      repo.subjects.forEach(function (s) {
        if (s.id !== last.s) return;
        chaptersInOrder(s).forEach(function (row) {
          if (row.c.id !== last.c) return;
          if ((row.g ? row.g.id : null) !== (last.g || null)) return;
          if (last.sub) {
            (row.c.subs || []).forEach(function (sub) { if (sub.id === last.sub) lastItem = { subject: s, chapter: row.c, sub: sub, group: row.g }; });
          } else if (hasQuiz(row.c)) lastItem = { subject: s, chapter: row.c, sub: null, group: row.g };
        });
      });
    }
    var upNext = [];
    repo.subjects.forEach(function (s) {
      var next = null;
      chaptersInOrder(s).forEach(function (row) {
        if (next) return;
        leavesOf(s, row.c, row.g).forEach(function (leaf) {
          if (!next && !done[itemKey(leaf.subject, leaf.chapter, leaf.sub, leaf.group)]) next = leaf;
        });
      });
      if (next) upNext.push(next);
    });
    var pool = items.filter(function (it) { return !done[itemKey(it.subject, it.chapter, it.sub, it.group)]; });
    if (!pool.length) pool = items.slice();
    var mix = mixOf(pool, Math.min(4, pool.length));
    var html = '<section class="panel"><h1>✨ For You</h1>' +
      '<p class="sub">Unfinished quizzes come first. Today\'s mix changes each day.</p>' +
      '<div class="meter" role="img" aria-label="' + pct + ' percent finished"><i style="width:' + pct + '%"></i></div>' +
      '<p class="sub">' + finished + ' of ' + total + ' quizzes finished</p>';
    if (lastItem) {
      html += '<h2 class="h2">Jump back in</h2><div class="folders">' +
        leafCard(lastItem.subject, lastItem.chapter, lastItem.sub, leafContext(lastItem), null, lastItem.group) +
        '</div>';
    }
    html += '<h2 class="h2">Up next</h2>' + (upNext.length
      ? '<div class="folders">' + upNext.map(function (it) {
          return leafCard(it.subject, it.chapter, it.sub, 'Continue ' + leafContext(it), null, it.group);
        }).join('') + '</div>'
      : '<div class="empty">You have started every subject. Great work — practice any quiz again from Lessons.</div>');
    html += '<h2 class="h2">Today\'s mix</h2><div class="folders">' + mix.map(function (it) {
      return leafCard(it.subject, it.chapter, it.sub, leafContext(it), null, it.group);
    }).join('') + '</div></section>';
    app.innerHTML = html;
  }

  function searchPage(query) {
    var q = query || '';
    setCrumbs([['Search']]);
    var list = findHits(q);
    if (qInput && qInput.value !== q) qInput.value = q;
    var body = list.length ? '<div class="folders">' + list.map(function (h) {
      if (h.kind === 'subject') {
        var subCount = h.subject.chapters.reduce(function (n, c) { return n + (c.subs || []).length; }, 0);
        var gcount = (h.subject.groups || []).length;
        return '<a class="folder" href="#/lessons/' + encodeURIComponent(h.subject.id) + '"><span class="ico">' + esc(h.subject.icon || '📁') + '</span><span class="name">' + esc(h.subject.name) + '</span><span class="meta">Subject · ' + plural(h.subject.chapters.length, 'chapter') + (gcount ? ' · ' + plural(gcount, 'sub-subject') : '') + (subCount ? ' · ' + plural(subCount, 'subchapter') : '') + '</span></a>';
      }
      if (h.kind === 'group') {
        return '<a class="folder" href="#/lessons/' + encodeURIComponent(h.subject.id) + '/' + encodeURIComponent(h.group.id) + '"><span class="ico">' + esc(h.group.icon || '📚') + '</span><span class="name">' + esc(h.group.name) + '</span><span class="meta">' + esc(h.subject.name) + ' · sub-subject · ' + plural(quizCount(h.group.chapters), 'quiz') + '</span></a>';
      }
      if (h.kind === 'sub') return leafCard(h.subject, h.chapter, h.sub, leafContext(h), null, h.group);
      var href = (h.chapter.subs && h.chapter.subs.length)
        ? '#/lessons/' + encodeURIComponent(h.subject.id) + (h.group ? '/' + encodeURIComponent(h.group.id) : '') + '/' + encodeURIComponent(h.chapter.id)
        : itemHref(h.subject, h.chapter, null, h.group);
      var isDone = chapterDone(h.subject, h.chapter, h.group);
      var where = h.group ? h.subject.name + ' · ' + h.group.name : h.subject.name;
      return '<a class="folder' + (isDone ? ' done' : '') + '" href="' + href + '"><span class="ico">' + (isDone ? '✅' : '📂') + '</span><span class="name">' + esc(h.chapter.name) + '</span><span class="meta">' + esc(where + ' · ' + chapterBits(h.chapter)) + '</span></a>';
    }).join('') + '</div>' : '<div class="empty">No lessons match that. Try Fractions, Planets, or Spanish.</div>';
    app.innerHTML = '<section class="panel"><h1>Search</h1><p class="sub">' +
      (q ? 'Results for “' + esc(q) + '”' : 'Type in the search bar to find a subject, sub-subject, chapter, or subchapter.') + '</p>' + body + '</section>';
  }

  function lessons(subs) {
    setCrumbs([['Lessons']]);
    app.innerHTML = '<section class="panel"><h1>📁 Lessons</h1><p class="sub">Choose a subject. Big subjects can hold sub-subjects. Chapters can hold subchapters.</p>' +
      (subs.length ? '<div class="folders">' + subs.map(function (s) {
        return '<a class="folder" href="#/lessons/' + encodeURIComponent(s.id) + '"><span class="ico">' + esc(s.icon || '📁') + '</span>' +
          '<span class="name">' + esc(s.name) + '</span><span class="meta">' + subjectMeta(s) + '</span></a>';
      }).join('') + '</div>' : '<div class="empty">No subjects yet. Check back soon.</div>') + '</section>';
  }

  function subject(sub) {
    setCrumbs([['Lessons', '#/lessons'], [sub.name]]);
    var groups = sub.groups || [];
    var cards = sub.chapters.map(function (c) {
      var isDone = chapterDone(sub, c, null);
      var href = (c.subs && c.subs.length) ? '#/lessons/' + encodeURIComponent(sub.id) + '/' + encodeURIComponent(c.id) : itemHref(sub, c, null);
      return '<a class="folder' + (isDone ? ' done' : '') + '" href="' + href + '">' +
        '<span class="ico">' + (isDone ? '✅' : '📂') + '</span><span class="name">' + esc(c.name) + '</span>' +
        '<span class="meta">' + esc(isDone ? 'Completed' : chapterBits(c)) + '</span></a>';
    }).join('');
    var groupCards = groups.map(function (g) {
      var isDone = groupDone(sub, g);
      return '<a class="folder' + (isDone ? ' done' : '') + '" href="#/lessons/' + encodeURIComponent(sub.id) + '/' + encodeURIComponent(g.id) + '">' +
        '<span class="ico">' + (isDone ? '✅' : esc(g.icon || '📚')) + '</span><span class="name">' + esc(g.name) + '</span>' +
        '<span class="meta">' + (isDone ? 'Completed · ' : '') + 'Sub-subject · ' + plural(quizCount(g.chapters), 'quiz') + '</span></a>';
    }).join('');
    app.innerHTML = '<section class="panel"><h1>' + esc(sub.icon || '📁') + ' ' + esc(sub.name) + '</h1><p class="sub">' +
      (groups.length ? 'Choose a chapter. Sub-subjects are at the end.' : 'Choose a chapter.') + '</p>' +
      ((cards || groupCards) ? '<div class="folders">' + cards + groupCards + '</div>' : '<div class="empty">No chapters yet. Check back soon.</div>') + '</section>';
  }

  function groupFolder(sub, g) {
    setCrumbs([['Lessons', '#/lessons'], [sub.name, '#/lessons/' + encodeURIComponent(sub.id)], [g.name]]);
    var cards = (g.chapters || []).map(function (c) {
      var isDone = chapterDone(sub, c, g);
      var href = (c.subs && c.subs.length)
        ? '#/lessons/' + encodeURIComponent(sub.id) + '/' + encodeURIComponent(g.id) + '/' + encodeURIComponent(c.id)
        : itemHref(sub, c, null, g);
      return '<a class="folder' + (isDone ? ' done' : '') + '" href="' + href + '">' +
        '<span class="ico">' + (isDone ? '✅' : '📄') + '</span><span class="name">' + esc(c.name) + '</span>' +
        '<span class="meta">' + esc(isDone ? 'Completed' : chapterBits(c)) + '</span></a>';
    }).join('');
    app.innerHTML = '<section class="panel"><h1>' + esc(g.icon || '📚') + ' ' + esc(g.name) + '</h1><p class="sub">' +
      esc(g.blurb || (sub.name + ' · sub-subject. Choose a quiz.')) + '</p>' +
      (cards ? '<div class="folders">' + cards + '</div>' : '<div class="empty">No quizzes yet. Check back soon.</div>') + '</section>';
  }

  function chapterFolder(sub, ch, group) {
    var crumbs = [['Lessons', '#/lessons'], [sub.name, '#/lessons/' + encodeURIComponent(sub.id)]];
    if (group) crumbs.push([group.name, '#/lessons/' + encodeURIComponent(sub.id) + '/' + encodeURIComponent(group.id)]);
    crumbs.push([ch.name]);
    setCrumbs(crumbs);
    var cards = '';
    if (hasQuiz(ch)) {
      cards += leafCard(sub, ch, null, done[itemKey(sub, ch, null, group)] ? 'Completed' : 'Quiz for the whole chapter', 'Chapter quiz', group);
    }
    (ch.subs || []).forEach(function (leaf) {
      cards += leafCard(sub, ch, leaf, done[itemKey(sub, ch, leaf, group)] ? 'Completed' : 'Subchapter quiz', null, group);
    });
    var where = group ? sub.name + ' · ' + group.name : sub.name;
    app.innerHTML = '<section class="panel"><h1>📂 ' + esc(ch.name) + '</h1><p class="sub">' + esc(where) + ' · chapter. Open a subchapter, or take the chapter quiz.</p>' +
      (cards ? '<div class="folders">' + cards + '</div>' : '<div class="empty">No subchapters yet. Check back soon.</div>') + '</section>';
  }

  function openLeaf(sub, ch, leaf, group) {
    var hash = location.hash;
    var key = itemKey(sub, ch, leaf, group);
    write('bc_last', { s: sub.id, c: ch.id, sub: leaf ? leaf.id : null, g: group ? group.id : null });
    var crumbs = [['Lessons', '#/lessons'], [sub.name, '#/lessons/' + encodeURIComponent(sub.id)]];
    if (group) crumbs.push([group.name, '#/lessons/' + encodeURIComponent(sub.id) + '/' + encodeURIComponent(group.id)]);
    if (ch.subs && ch.subs.length) {
      crumbs.push([ch.name, '#/lessons/' + encodeURIComponent(sub.id) + (group ? '/' + encodeURIComponent(group.id) : '') + '/' + encodeURIComponent(ch.id)]);
    }
    crumbs.push([leaf ? leaf.name : ch.name]);
    setCrumbs(crumbs);
    var heading = leaf ? leaf.name : ch.name;
    var blurb = group
      ? sub.name + ' · ' + group.name + (leaf ? ' · ' + ch.name + ' · subchapter' : ' · quiz')
      : (leaf ? sub.name + ' · ' + ch.name + ' · subchapter' : sub.name + ' · chapter');
    if (!leaf && ch.level) blurb += ' · ' + ch.level;
    app.innerHTML = '<section class="panel"><h1>' + (leaf ? '📄 ' : (group ? '📄 ' : '📂 ')) + esc(heading) + '</h1><p class="sub">' + esc(blurb) + '</p>' +
      '<div id="status" class="empty">Loading quiz…</div><div class="row" id="actions"></div></section>';
    getQuiz(sub, ch, leaf, group).then(function (quiz) {
      if (location.hash !== hash) return;
      var st = $('#status'), act = $('#actions');
      if (!st) return;
      if (!quiz) { st.textContent = 'No quiz here yet. Check back soon.'; return; }
      var err = validate(quiz);
      if (err) { st.className = 'msg'; st.textContent = 'This quiz has a problem: ' + err; return; }
      var hasInfo = [].concat(quiz.info || []).filter(Boolean).length > 0;
      st.className = '';
      st.innerHTML = '<strong>' + esc(quiz.title || heading) + '</strong><br>' + plural(quiz.questions.length, 'question') + (hasInfo ? ' · starts with a short intro' : '');
      act.innerHTML = '<button class="btn good" id="start">' + (done[key] ? 'Practice again' : 'Start quiz') + '</button>';
      $('#start').onclick = function () { runQuiz(quiz, key, heading, !!leaf); };
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
    if (hits) hits.hidden = true;
    if (qInput) qInput.setAttribute('aria-expanded', 'false');
    markTab(p[0] || '');
    if (!p.length) return home();
    if (p[0] === 'foryou') return forYou();
    if (p[0] === 'search') return searchPage(p.slice(1).join('/'));
    if (p[0] !== 'lessons') return home();
    if (p.length === 1) return lessons(subs);
    var sub = subs.filter(function (s) { return s.id === p[1]; })[0];
    if (!sub) return notFound();
    if (p.length === 2) return subject(sub);
    var group = (sub.groups || []).filter(function (g) { return g.id === p[2]; })[0];
    if (group) {
      if (p.length === 3) return groupFolder(sub, group);
      var gch = group.chapters.filter(function (c) { return c.id === p[3]; })[0];
      if (!gch) return notFound();
      if (p.length === 4) {
        if (gch.subs && gch.subs.length) return chapterFolder(sub, gch, group);
        return openLeaf(sub, gch, null, group);
      }
      if (p[4] === 'quiz') return openLeaf(sub, gch, null, group);
      var gleaf = (gch.subs || []).filter(function (s) { return s.id === p[4]; })[0];
      if (!gleaf) return notFound();
      return openLeaf(sub, gch, gleaf, group);
    }
    var ch = sub.chapters.filter(function (c) { return c.id === p[2]; })[0];
    if (!ch) return notFound();
    if (p.length === 3) {
      if (ch.subs && ch.subs.length) return chapterFolder(sub, ch, null);
      return openLeaf(sub, ch, null, null);
    }
    if (p[3] === 'quiz') return openLeaf(sub, ch, null, null);
    var leaf = (ch.subs || []).filter(function (s) { return s.id === p[3]; })[0];
    if (!leaf) return notFound();
    openLeaf(sub, ch, leaf, null);
  }

  function runQuiz(quiz, key, title, isSub) {
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
      var opts = quizRoot.querySelectorAll('.opt');
      if (isText) {
        var inp = $('#ans'); inp.focus();
        inp.oninput = function () { main.disabled = !inp.value.trim(); };
      } else {
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
      done[key] = true;
      write('bc_done', done);

      if (window.bcSaveProgress) window.bcSaveProgress();
      if (window.bcUpdateLeaderboard) window.bcUpdateLeaderboard();

      var acc = Math.round(firstTry / total * 100);
      frame('<div class="result"><div class="big">🎉</div><h2>' + (isSub ? 'Subchapter complete!' : 'Chapter complete!') + '</h2>' +
        '<div class="stats"><div class="stat"><b>' + acc + '%</b>first try</div><div class="stat"><b>❤ ' + hearts + '</b>hearts left</div></div></div>',
        '<button class="btn good" id="main">Continue</button>', 100);
      $('#main').onclick = close;
    }
    info.length ? intro() : begin();
  }

  function paintHits() {
    if (!qInput || !hits) return;
    var q = qInput.value;
    var list = findHits(q);
    if (!q.trim()) { hits.hidden = true; hits.innerHTML = ''; qInput.setAttribute('aria-expanded', 'false'); return; }
    if (!list.length) {
      hits.hidden = false;
      hits.innerHTML = '<div class="empty">No lessons match that.</div>';
      qInput.setAttribute('aria-expanded', 'true');
      return;
    }
    var shown = list.slice(0, 8).map(function (h) {
      if (h.kind === 'subject') {
        return '<a href="#/lessons/' + encodeURIComponent(h.subject.id) + '"><span>' + esc(h.subject.icon || '📁') + ' ' + esc(h.subject.name) + '</span><small>Subject</small></a>';
      }
      if (h.kind === 'group') {
        return '<a href="#/lessons/' + encodeURIComponent(h.subject.id) + '/' + encodeURIComponent(h.group.id) + '"><span>' + esc(h.group.icon || '📚') + ' ' + esc(h.group.name) + '</span><small>' + esc(h.subject.name) + ' · sub-subject</small></a>';
      }
      if (h.kind === 'sub') {
        return '<a href="' + itemHref(h.subject, h.chapter, h.sub, h.group) + '"><span>📄 ' + esc(h.sub.name) + '</span><small>' + esc(leafContext(h)) + '</small></a>';
      }
      var href = (h.chapter.subs && h.chapter.subs.length)
        ? '#/lessons/' + encodeURIComponent(h.subject.id) + (h.group ? '/' + encodeURIComponent(h.group.id) : '') + '/' + encodeURIComponent(h.chapter.id)
        : itemHref(h.subject, h.chapter, null, h.group);
      return '<a href="' + href + '"><span>' + (h.group ? '📄' : esc(h.subject.icon || '📂')) + ' ' + esc(h.chapter.name) + '</span><small>' + esc(leafContext({ subject: h.subject, chapter: h.chapter, sub: null, group: h.group || null })) + '</small></a>';
    }).join('');
    var more = list.length > 8
      ? '<a href="#/search/' + encodeURIComponent(q.trim()) + '"><span>See all ' + list.length + ' results</span><small>Search</small></a>'
      : '';
    hits.hidden = false;
    hits.innerHTML = shown + more;
    qInput.setAttribute('aria-expanded', 'true');
  }
  if (qInput && searchForm && hits) {
    qInput.addEventListener('input', paintHits);
    qInput.addEventListener('focus', paintHits);
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = qInput.value.trim();
      if (!q) return;
      location.hash = '#/search/' + encodeURIComponent(q);
      hits.hidden = true;
      qInput.blur();
    });
    document.addEventListener('click', function (e) {
      if (!searchForm.contains(e.target)) { hits.hidden = true; qInput.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hits.hidden = true; qInput.setAttribute('aria-expanded', 'false'); }
      var typing = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
      if (e.key === '/' && !typing && quizRoot.hidden) { e.preventDefault(); qInput.focus(); }
    });
  }

  window.addEventListener('hashchange', render);
  var manifestP = fetch('lessons/lessons.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : { subjects: [] }; })
    .catch(function () { return { subjects: [] }; });
  Promise.all([manifestP, discover()]).then(function (res) {
    repo = { subjects: combine(res[0] && res[0].subjects ? res[0].subjects : [], res[1]) };
    render();
  });
})();

