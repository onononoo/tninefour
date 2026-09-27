# tninefour

A simple, open source text editor for Windows that detects what language you're writing and highlights it automatically.

## Install

- **Installer:** run `tninefour-setup-<version>.exe` and follow the steps. It updates itself when a new version comes out.
- **Portable:** run `tninefour-portable-<version>.exe`. Nothing is installed, so it can live anywhere, like a USB stick. It doesn't update itself; download the new one from Releases.

Windows may say "Windows protected your PC" the first time. (because im not fucking rich enough to get a shitty windows liscense under this.) Click **More info → Run anyway**.

- **File** menu: New (Ctrl+N), Open (Ctrl+O), Save (Ctrl+S), Save As (Ctrl+Shift+S)
- The detected language is shown in the window title, and Save suggests its file extension (`.py`, `.cpp`, `.html`, …)
- **Syntax** menu: pick the language yourself, or go back to **Auto detect**
- Tab indents; press Esc then Tab to move focus out of the editor

## Build from source

```
npm install
npm start        # run it
npm run dist     # build the installers and zips into dist/
```

## Releasing

1. Bump `version` in `package.json` and run `npm run dist`.
2. Make a GitHub release tagged `v<version>` (e.g. `v1.1.5`), not a draft or pre-release.
3. Upload everything in `dist/installer/` (the updater needs `latest.yml`, the `.exe` and the `.blockmap`) and the zip from `dist/portable/`.

Installed copies pick it up the next time they start.

## License

Copyright (C) 2026 kaiklund INC.

Licensed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE).
