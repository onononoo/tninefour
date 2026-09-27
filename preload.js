// tninefour — Copyright (C) 2026 kaiklund INC. GPL-3.0-or-later.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  initial: () => ipcRenderer.invoke('initial'),
  open: () => ipcRenderer.invoke('open'),
  save: (text, saveAs, ext) => ipcRenderer.invoke('save', text, saveAs, ext),
  new: () => ipcRenderer.send('new'),
  dirty: d => ipcRenderer.send('dirty', d),
  onMenu: fn => ipcRenderer.on('menu', (e, cmd, arg) => fn(cmd, arg)),
});
