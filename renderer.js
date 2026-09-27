// tninefour — Copyright (C) 2026 kaiklund INC. GPL-3.0-or-later.
const ed = document.getElementById('ed'), code = document.querySelector('#hl code');
let lang = 'plaintext', name = 'untitled.txt', dirty = false, detectTimer, lastKey;

// Fast path: re-highlight with the known language on every keystroke,
// re-detect the language (slow, tries every grammar) once typing pauses.
function render() {
  code.innerHTML = hljs.highlight(ed.value + '\n', { language: lang, ignoreIllegals: true }).value;
  sync();
}
function detect() {
  lang = (ed.value.trim() && hljs.highlightAuto(ed.value).language) || 'plaintext';
  render();
  title();
}
function sync() { code.style.transform = `translate(${-ed.scrollLeft}px, ${-ed.scrollTop}px)`; }
function title() { document.title = `${dirty ? '● ' : ''}${name} — ${lang} — tninefour`; }
function setDirty(d) { if (d !== dirty) api.dirty(dirty = d); title(); }
function load(file) {
  if (!file) return;
  ed.value = file.text;
  name = file.name;
  ed.scrollTop = ed.scrollLeft = 0;
  setDirty(false);
  detect();
  ed.focus();
}
const discardOk = () => !dirty || confirm('You have unsaved changes. Discard them?');

const commands = {
  new() { if (discardOk()) { api.new(); load({ name: 'untitled.txt', text: '' }); } },
  async open() { if (discardOk()) load(await api.open()); },
  async save(saveAs) { const n = await api.save(ed.value, saveAs); if (n) { name = n; setDirty(false); } },
  saveAs() { return commands.save(true); },
};
api.onMenu(async cmd => { try { await commands[cmd](); } catch (e) { alert(e.message); } });

ed.addEventListener('input', () => {
  render();
  setDirty(true);
  clearTimeout(detectTimer);
  detectTimer = setTimeout(detect, 400);
});
ed.addEventListener('scroll', sync);
ed.addEventListener('keydown', e => {
  // Tab indents; Esc then Tab moves focus out, so keyboard users aren't trapped.
  if (e.key === 'Tab' && !e.shiftKey && lastKey !== 'Escape') {
    e.preventDefault();
    document.execCommand('insertText', false, '    ');
  }
  lastKey = e.key;
});

detect();
api.initial().then(load, e => alert(e.message));
