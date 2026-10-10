/* Blue Crescent accounts — Supabase + GitHub login + progress + streak */
(function () {
  var SUPABASE_URL = 'https://qdviglvmnqhdamymfwhs.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_uS1vL0jWipIXHYhL68fm1A_gBAenhXv';

  if (!window.supabase) {
    console.warn('Supabase client not loaded');
    return;
  }

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var user = null;
  var streak = 0;

  function $(s) { return document.querySelector(s); }

  function updateUI() {
    var btn = $('#auth-btn');
    var info = $('#auth-info');
    if (!btn) return;
    if (user) {
      btn.textContent = 'Sign out';
      btn.onclick = signOut;
      if (info) info.textContent = (user.user_metadata && user.user_metadata.user_name) || user.email || 'Signed in';
    } else {
      btn.textContent = 'Sign in with GitHub';
      btn.onclick = signIn;
      if (info) info.textContent = '';
    }
  }

  async function signIn() {
    var { error } = await sb.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: location.origin + location.pathname }
    });
    if (error) console.error(error);
  }

  async function signOut() {
    await sb.auth.signOut();
    user = null;
    updateUI();
    location.reload();
  }

  async function loadProgress() {
    if (!user) return;
    var { data, error } = await sb.from('progress').select('*').eq('user_id', user.id).maybeSingle();
    if (error) { console.warn(error); return; }
    if (data && data.done) {
      try {
        localStorage.setItem('bc_done', JSON.stringify(data.done));
      } catch (e) {}
      streak = data.streak || 0;
    }
    // simple streak check
    var today = new Date().toISOString().slice(0, 10);
    if (data && data.last_active !== today) {
      var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (data.last_active === yesterday) streak = (data.streak || 0) + 1;
      else if (data.last_active !== today) streak = 1;
      await saveProgress();
    }
  }

  async function saveProgress() {
    if (!user) return;
    var done = {};
    try { done = JSON.parse(localStorage.getItem('bc_done') || '{}'); } catch (e) {}
    var today = new Date().toISOString().slice(0, 10);
    var { error } = await sb.from('progress').upsert({
      user_id: user.id,
      done: done,
      streak: streak,
      last_active: today,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('save progress', error);
  }

  // expose so app.js can call it after finishing a quiz
  window.bcSaveProgress = saveProgress;
  window.bcGetStreak = function () { return streak; };

  async function init() {
    var { data: { session } } = await sb.auth.getSession();
    user = session && session.user;
    updateUI();
    if (user) await loadProgress();

    sb.auth.onAuthStateChange(async function (event, session) {
      user = session && session.user;
      updateUI();
      if (user) await loadProgress();
    });
  }

  // add button to header
  var header = document.querySelector('header.top');
  if (header) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:auto;';
    wrap.innerHTML = '<span id="auth-info" style="font-size:.85rem;color:var(--soft)"></span>' +
      '<button id="auth-btn" class="btn" style="padding:8px 14px;font-size:.9rem">Sign in</button>';
    header.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
