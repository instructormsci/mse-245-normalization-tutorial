# Normalization Tutorial — MSE 245

Interactive, self-guided tutorial walking students through database
normalization (UNF → 1NF → 2NF → 3NF). Built with React + Vite.

**Live site:** https://instructormsci.github.io/mse-245-normalization-tutorial/

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Deploy to GitHub Pages

Deployment uses the [`gh-pages`](https://www.npmjs.com/package/gh-pages)
package, which builds the app and pushes `dist/` to the `gh-pages` branch.

```bash
npm run deploy
```

Then, once (in the GitHub repo): **Settings → Pages → Build and deployment
→ Source: Deploy from a branch → Branch: `gh-pages` / `root`**.

### Notes

- `vite.config.js` sets `base: "/mse-245-normalization-tutorial/"`. If you
  rename the repo, update that value (and `homepage` in `package.json`) to
  match, or assets will 404 on Pages.
- `npm run build` also copies `index.html` to `404.html` so the SPA handles
  deep links and refreshes.
