// tninefour — Copyright (C) 2026 kaiklund INC.
// Free software under the GNU GPL v3 or later. See LICENSE.
const { app, BrowserWindow, Menu, dialog, ipcMain, nativeTheme } = require('electron');
const fs = require('fs/promises');
const path = require('path');

// The main process owns the current file path, so the page can only write
// to files the user picked.
let win, filePath = null, dirty = false;

async function open(p) {
  if (!p) {
    const r = await dialog.showOpenDialog(win, { properties: ['openFile'] });
    if (r.canceled) return null;
    p = r.filePaths[0];
  }
  const text = await fs.readFile(p, 'utf8');
  filePath = p;
  return { name: path.basename(p), text };
}

ipcMain.handle('initial', () => {
  const arg = process.argv.slice(app.isPackaged ? 1 : 2).find(a => !a.startsWith('-') && a !== '.');
  return arg ? open(path.resolve(arg)) : null;
});
ipcMain.handle('open', () => open());
ipcMain.handle('save', async (e, text, saveAs) => {
  if (saveAs || !filePath) {
    const r = await dialog.showSaveDialog(win, { defaultPath: filePath || 'untitled.txt' });
    if (r.canceled) return null;
    filePath = r.filePath;
  }
  await fs.writeFile(filePath, text);
  return path.basename(filePath);
});
ipcMain.on('new', () => { filePath = null; });
ipcMain.on('dirty', (e, d) => { dirty = d; });

const send = cmd => win.webContents.send('menu', cmd);

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: '&File', submenu: [
      { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => send('new') },
      { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: () => send('open') },
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('save') },
      { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('saveAs') },
      { type: 'separator' },
      { role: 'quit' },
    ] },
    { role: 'editMenu' },
    { label: '&Help', submenu: [
      { label: 'About tninefour', click: () => dialog.showMessageBox(win, {
        title: 'About tninefour',
        message: `tninefour ${app.getVersion()}`,
        detail: 'Copyright (C) 2026 kaiklund INC.\nFree software under the GNU General Public License v3.',
      }) },
    ] },
  ]));

  win = new BrowserWindow({
    width: 1000,
    height: 700,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0d1117' : '#ffffff',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.on('close', e => {
    if (dirty && dialog.showMessageBoxSync(win, {
      type: 'warning', buttons: ['Discard', 'Cancel'], defaultId: 1, cancelId: 1,
      message: 'You have unsaved changes. Discard them?',
    }) === 1) e.preventDefault();
  });
  win.loadFile('index.html');
});

app.on('window-all-closed', () => app.quit());
