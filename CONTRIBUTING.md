# Contributing

Install Node.js 22 or newer, then install dependencies:

```sh
npm install
```

Before submitting a change, run the same validation used in CI:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Keep changes focused on the Anaconda Jira tab-group workflow. Add or update tests whenever behavior changes, avoid broad Chrome permissions, and do not commit generated `dist/` output.

See `README.md` for local Chrome installation instructions and `AGENTS.md` for the project's scope and design constraints.
