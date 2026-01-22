# Contributing

Thanks for your interest in contributing to Iconify Downloader. Contributions are welcome: bug fixes, features, docs, and UX improvements.

## Quick Start
1. Fork the repo and create your branch from `main`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the app:
   ```bash
   pnpm dev
   ```
4. Typecheck before submitting:
   ```bash
   pnpm exec tsc -p tsconfig.json --noEmit
   pnpm exec tsc -p tsconfig.electron.json --noEmit
   ```

## What to Contribute
- Fixes for downloads, ZIP export, naming, and file output behaviors
- UI improvements (Collections grouping, Favorites, History, presets)
- Performance improvements (virtualization, caching, batching)
- Docs (README, usage, troubleshooting)

## Project Structure (High-Level)
- `src/` — Renderer (React + Vite)
- `electron/` — Electron main/preload and Node-side services
- `src/data/collection-groups.json` — Manual mapping for grouping collections

## Guidelines
- Keep changes small and reviewable (prefer multiple small PRs over one large PR).
- Follow existing TypeScript patterns and keep types strict.
- Don’t add secrets or API keys.
- Avoid logging sensitive paths or user data.
- Prefer existing utilities and conventions in the codebase.

## Commit & PR Rules
- Write clear PR titles and descriptions.
- Include screenshots/GIFs for UI changes.
- Link relevant issues in the PR description (e.g. `Fixes #123`).

## Reporting Bugs
Please use the bug report template and include:
- OS + Node version
- Steps to reproduce
- Expected vs actual behavior
- Console logs (sanitized)

