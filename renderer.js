// tninefour — Copyright (C) 2026 kaiklund INC. GPL-3.0-or-later.
const ed = document.getElementById('ed'), code = document.querySelector('#hl code');
let lang = 'plaintext', name = 'untitled', dirty = false, detectTimer, lastKey;
let picked = null; // language chosen from the Syntax menu; null = auto-detect

// File extension suggested when saving, per detected language (anything unlisted is .txt).
const EXT = {
  bash: 'sh', c: 'c', cpp: 'cpp', csharp: 'cs', css: 'css', diff: 'diff', go: 'go', graphql: 'graphql',
  ini: 'ini', java: 'java', javascript: 'js', json: 'json', kotlin: 'kt', less: 'less', lua: 'lua',
  makefile: 'mk', markdown: 'md', objectivec: 'm', perl: 'pl', php: 'php', 'php-template': 'php',
  python: 'py', r: 'r', ruby: 'rb', rust: 'rs', scss: 'scss', shell: 'sh', sql: 'sql', swift: 'swift',
  typescript: 'ts', vbnet: 'vb', wasm: 'wat', yaml: 'yaml',
};
// highlight.js reports HTML as "xml", so tell them apart by the tags.
const ext = () => lang === 'xml'
  ? (/<(!doctype html|html|head|body|div|p|a)\b/i.test(ed.value) ? 'html' : 'xml')
  : EXT[lang] || 'txt';

// Fast path: re-highlight with the known language on every keystroke,
// re-detect the language (slow, tries every grammar) once typing pauses.
function render() {
  code.innerHTML = hljs.highlight(ed.value + '\n', { language: lang, ignoreIllegals: true }).value;
  sync();
}
// php-template mistakes plain HTML for PHP; real PHP is still caught by "php".
const AUTO = hljs.listLanguages().filter(l => l !== 'php-template' && l !== 'python-repl');
// highlight.js usually calls Java "csharp" or another C-like language.
// These patterns never appear in those languages, only in Java.
const JAVA = /\bSystem\.(out|err)\.|^\s*import javax?\.|^\s*package [\w.]+;|\bstatic void main\s*\(\s*String|@Override\b/m;
const C_LIKE = ['csharp', 'cpp', 'c', 'typescript', 'javascript', 'kotlin', 'swift'];
function detect() {
  if (picked) lang = picked;
  else {
    const r = hljs.highlightAuto(ed.value, AUTO);
    // ponytail: fixed relevance cutoff; prose scores ~1, real code scores well above.
    // Tune if short snippets get mislabelled as plain text.
    lang = C_LIKE.includes(r.language) && JAVA.test(ed.value) ? 'java'
      : r.relevance >= 3 ? r.language : 'plaintext';
  }
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
  picked = null; // main resets the Syntax menu to Auto on new/open too
  setDirty(false);
  detect();
  ed.focus();
}
const discardOk = () => !dirty || confirm('You have unsaved changes. Discard them?');

const commands = {
  new() { if (discardOk()) { api.new(); load({ name: 'untitled', text: '' }); } },
  async open() { if (discardOk()) load(await api.open()); },
  async save(saveAs) {
    clearTimeout(detectTimer);
    detect(); // don't save with a stale guess if typing just stopped
    const n = await api.save(ed.value, saveAs, ext());
    if (n) { name = n; setDirty(false); }
  },
  saveAs() { return commands.save(true); },
  syntax(l) { picked = l; detect(); },
};
api.onMenu(async (cmd, arg) => { try { await commands[cmd](arg); } catch (e) { alert(e.message); } });

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
