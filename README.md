# svg-studio

Optimize an SVG in your browser, compare the original and optimized versions, and export the result. Files are processed locally and are not sent to a server.

## Run locally

Requires Node.js 20.19 or later.

```sh
npm install
npm run dev
```

Paste an SVG or choose a file, then select **Optimize SVG** to preview and export it. Run `npm test` for the optimization and validation tests, or `npm run build` to create the static app in `dist/`.

The optimizer removes comments and empty groups, compacts whitespace, and removes scripts, event handlers, embedded content, and external references. Review the result before using it; SVGs that rely on external links may change.
