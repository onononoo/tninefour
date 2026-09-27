# tninefour

A simple, open source text editor for Windows that detects what language you're writing and highlights it automatically.

## Install

Run `tninefour Setup 1.0.0.exe` (installer) or `tninefour 1.0.0.exe` (portable, no install).

- **File** menu: New (Ctrl+N), Open (Ctrl+O), Save (Ctrl+S), Save As (Ctrl+Shift+S)
- The detected language is shown in the window title
- Tab indents; press Esc then Tab to move focus out of the editor

## Build from source

```
npm install
npm start        # run it
npm run dist     # build the installers into dist/
```

## License

Copyright (C) 2026 kaiklund INC.

Licensed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE).
