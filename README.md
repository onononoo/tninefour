# tninefour

A simple, open source text editor for Windows that detects what language you're writing and highlights it automatically.

## Install

- **Installer:** run `tninefour Setup <version>.exe` and follow the steps.
- **Portable:** run `tninefour Portable <version>.exe`. Nothing is installed, so it can live anywhere, like a USB stick.

Windows may say "Windows protected your PC" the first time. Click **More info → Run anyway**.

- **File** menu: New (Ctrl+N), Open (Ctrl+O), Save (Ctrl+S), Save As (Ctrl+Shift+S)
- The detected language is shown in the window title
- Tab indents; press Esc then Tab to move focus out of the editor

## Build from source

```
npm install
npm start        # run it
npm run dist     # build the installers and zips into dist/
```

## License

Copyright (C) 2026 kaiklund INC.

Licensed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE).
