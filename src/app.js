// Progressive enhancement. All tips, articles and FAQs remain readable without JS.
(() => {
  'use strict';
  const lang = document.documentElement.lang === 'en' ? 'en' : 'id';
  const en = lang === 'en';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const toast = $('#notice');
  let noticeTimer;
  function say(message) {
    if (!toast) return;
    clearTimeout(noticeTimer);
    toast.textContent = message;
    toast.hidden = false;
    noticeTimer = setTimeout(() => { toast.hidden = true; }, 4200);
  }
  let canStore = true;
  const read = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { canStore = false; return fallback; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { canStore = false; say(en ? 'Storage unavailable. Changes last only in this tab.' : 'Penyimpanan tidak tersedia. Perubahan hanya berlaku di tab ini.'); return false; }
  };
  const validTheme = ['light', 'dark'].includes(read('tbr-theme', null)) ? read('tbr-theme', null) : null;
  if (validTheme) document.documentElement.dataset.theme = validTheme;
  const themeButton = $('#theme');
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');
  function themeLabel() {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : darkQuery.matches;
    if (themeButton) {
      const label = en ? (dark ? 'Use light mode' : 'Use dark mode') : (dark ? 'Pakai mode terang' : 'Pakai mode gelap');
      themeButton.setAttribute('aria-label', label); themeButton.title = label;
      themeButton.setAttribute('aria-pressed', String(dark));
    }
  }
  themeLabel();
  darkQuery.addEventListener('change', themeLabel);
  themeButton?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : darkQuery.matches;
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    write('tbr-theme', dark ? 'light' : 'dark'); themeLabel();
  });
  const storedSaved = read('tbr-saved', []);
  const saved = new Set(Array.isArray(storedSaved) ? storedSaved.filter(x => typeof x === 'string') : []);
  function renderSaves() {
    $$('[data-save]').forEach(button => {
      const active = saved.has(button.dataset.save);
      button.setAttribute('aria-pressed', String(active));
      const title = button.dataset.title || '';
      button.setAttribute('aria-label', (en ? (active ? 'Unsave: ' : 'Save: ') : (active ? 'Hapus simpanan: ' : 'Simpan: ')) + title);
      button.title = en ? (active ? 'Unsave tip' : 'Save tip') : (active ? 'Hapus simpanan' : 'Simpan tips');
      const label = button.querySelector('[data-save-label]');
      if (label) label.textContent = en ? (active ? 'Saved' : 'Save tip') : (active ? 'Tersimpan' : 'Simpan tips');
    });
    const count = $('#saved-count'); if (count) count.textContent = String(saved.size);
  }
  $$('[data-save]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.save;
    if (saved.has(key)) saved.delete(key); else saved.add(key);
    write('tbr-saved', [...saved]); renderSaves();
    say(en ? (saved.has(key) ? 'Tip saved on this device.' : 'Tip removed from saved items.') : (saved.has(key) ? 'Tips disimpan di perangkat ini.' : 'Tips dihapus dari simpanan.'));
    if (savedOnly) filterTips(false);
  }));
  renderSaves();
  let selectedCategory = 'all', savedOnly = false, shown = 6;
  const cards = $$('.tip-preview');
  const search = $('#search');
  const normalize = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(lang).trim();
  const params = new URLSearchParams(location.search);
  if (search) search.value = params.get('q') || '';
  if ($$('[data-category]').some(b => b.dataset.category === params.get('room'))) selectedCategory = params.get('room');
  function filterTips(reset = true) {
    if (!cards.length) return;
    if (reset) shown = 6;
    const query = normalize(search?.value || '');
    const words = query.split(/\s+/).filter(Boolean);
    const matched = cards.filter(card => (selectedCategory === 'all' || card.dataset.room === selectedCategory) && (!savedOnly || saved.has(card.dataset.slug)) && words.every(word => normalize(card.dataset.search).includes(word)));
    cards.forEach(card => { card.hidden = true; });
    matched.slice(0, shown).forEach(card => { card.hidden = false; });
    const count = $('#result-count');
    if (count) count.textContent = en ? `${matched.length} ${matched.length === 1 ? 'guide' : 'guides'}` : `${matched.length} panduan`;
    const empty = $('#empty'); if (empty) empty.hidden = matched.length > 0;
    const more = $('#more'); if (more) more.hidden = matched.length <= shown;
    $$('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === selectedCategory)));
    const nextParams = new URLSearchParams();
    if (search?.value.trim()) nextParams.set('q', search.value.trim());
    if (selectedCategory !== 'all') nextParams.set('room', selectedCategory);
    const queryString = nextParams.toString();
    history.replaceState(null, '', `${location.pathname}${queryString ? '?' + queryString : ''}${location.hash}`);
  }
  search?.addEventListener('input', () => filterTips());
  $('#search-form')?.addEventListener('submit', event => { event.preventDefault(); filterTips(); });
  $$('[data-category]').forEach(button => button.addEventListener('click', () => { selectedCategory = button.dataset.category; filterTips(); }));
  $('#saved-filter')?.addEventListener('click', event => { savedOnly = !savedOnly; event.currentTarget.setAttribute('aria-pressed', String(savedOnly)); filterTips(); });
  function clearFilters() { if (search) search.value = ''; selectedCategory = 'all'; savedOnly = false; $('#saved-filter')?.setAttribute('aria-pressed','false'); filterTips(); search?.focus(); }
  $$('[data-clear]').forEach(button => button.addEventListener('click', clearFilters));
  $('#more')?.addEventListener('click', () => {
    const before = cards.filter(c => !c.hidden).length;
    shown += 6; filterTips(false);
    const newlyVisible = cards.filter(c => !c.hidden)[before];
    newlyVisible?.querySelector('h3 a')?.focus({ preventScroll: true });
  });
  filterTips();
  const rawChecks = read('tbr-checks', {});
  const checked = rawChecks && typeof rawChecks === 'object' && !Array.isArray(rawChecks) ? rawChecks : {};
  const checkInputs = $$('[data-check]');
  let routine = 'daily';
  function renderChecks() {
    checkInputs.forEach(input => { input.checked = checked[input.dataset.check] === true; });
    const current = checkInputs.filter(input => input.dataset.check.startsWith(routine + '-'));
    const done = current.filter(input => input.checked).length;
    const status = $('#routine-status');
    if (status) status.textContent = en ? `${done} of ${current.length} done${done === current.length ? '. All set.' : '.'}` : `${done} dari ${current.length} selesai${done === current.length ? '. Beres.' : '.'}`;
    const note = $('#storage-note');
    if (note && !canStore) note.textContent = en ? 'Storage unavailable. Checklist lasts only in this tab.' : 'Penyimpanan tidak tersedia. Checklist hanya berlaku di tab ini.';
  }
  checkInputs.forEach(input => input.addEventListener('change', () => { checked[input.dataset.check] = input.checked; write('tbr-checks', checked); renderChecks(); }));
  $$('[data-routine]').forEach(button => button.addEventListener('click', () => {
    routine = button.dataset.routine;
    $$('[data-routine]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.routine === routine)));
    $$('[data-routine-panel]').forEach(panel => { panel.hidden = panel.dataset.routinePanel !== routine; });
    renderChecks();
  }));
  if (checkInputs.length) { const weekly = $('[data-routine-panel="weekly"]'); if (weekly) weekly.hidden = true; renderChecks(); }
  $('#reset-routine')?.addEventListener('click', () => { checkInputs.filter(i => i.dataset.check.startsWith(routine + '-')).forEach(i => { delete checked[i.dataset.check]; }); write('tbr-checks',checked); renderChecks(); say(en ? 'Checklist reset.' : 'Checklist diulang.'); });
  $$('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
  $('#copy')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.origin + location.pathname); say(en ? 'Link copied.' : 'Tautan disalin.'); }
    catch { say(en ? 'Could not copy. Copy the address from your browser.' : 'Gagal menyalin. Salin alamat dari bilah browser.'); }
  });
  // Reveal controls only after initialization succeeds. No loading UI needed: data is inline.
  document.documentElement.classList.add('js');
})();
