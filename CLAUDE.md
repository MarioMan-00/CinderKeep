# Cinderkeep: notes for Claude

**Start with `HANDOFF.md`.** It has the current state, the open decisions (the user is choosing new phase-3 wings for the final boss), the code map and how to test.

Rules that always apply:
- **The Playtest Vault:** never touch it. That means its website, its database and its repository.
- **The repo:** add no secrets, tokens or stray files.
- **Publishing:** anything that lands on `main` publishes the game to every tester through `.github/workflows/vault-publish.yml`.
  - Put `[skip publish] [skip ci]` in commit messages, unless the user asks for a playtest release.
  - Pull request titles starting with `WIP:` don't publish when merged.
- **`cinderkeep/`:** this folder is exactly what testers get, so it holds game files only.
- **Code and testing:**
  - The game is vanilla JS and Canvas with no build step; everything lives in `cinderkeep/js/game.js`.
  - Test in a throwaway copy with Playwright (see `HANDOFF.md`).
- **The user:** show them pictures of visual changes before building them into the game.
