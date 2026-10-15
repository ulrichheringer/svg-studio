# svg-studio — SVG Optimizer & Previewer

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=20232A)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f?style=flat)](LICENSE)

Optimize an SVG in your browser, compare the original and optimized versions, and export the result. Files are processed locally and are not sent to a server.

## Run locally

Requires Node.js 20.19 or later.

```sh
npm install
npm run dev
```

Paste an SVG or choose a file, then select **Optimize SVG** to preview and export it. Run `npm test` for the optimization and validation tests, or `npm run build` to create the static app in `dist/`.

The optimizer removes comments and empty groups, compacts whitespace, and removes scripts, event handlers, embedded content, and external references. Review the result before using it; SVGs that rely on external links may change.
