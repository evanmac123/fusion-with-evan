# Afterglow — dance teacher website

A one-page static site (HTML, CSS, vanilla JS). No build step.

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000

## Host on GitHub Pages
1. Create a repo and push this folder to `main`.
2. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. Your site goes live at `https://<user>.github.io/<repo>/`. All paths are relative, so project sites work as-is.

## Customise
- Replace `[Your Name]`, prices, schedule, testimonials and `hello@afterglow.dance` in `index.html` (and the mailto in `main.js`).
- Swap photos in `assets/img/`. Photography credit: Philip Bell.
- Colours are CSS variables at the top of `styles.css`.
