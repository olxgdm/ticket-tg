# Anaconda Ticket Tab Group

A small Chrome extension for organizing Anaconda package-maintenance work. When an Anaconda Jira ticket is active, the extension creates a new tab group, moves that ticket tab into it, and names the group:

```text
<ticket-id> <ticket-title>
```

For example, ticket `PKG-17095` with title `numpy 2.5.2` becomes `PKG-17095 numpy 2.5.2`. These values are examples: the Jira title is kept as one opaque string and is not parsed as a package name or version.

## Features

- Supports `https://anaconda.atlassian.net/browse/<ticket-id>` URLs.
- Runs from the extension toolbar or a keyboard shortcut.
- Reads the visible Jira ticket heading using the current browser session.
- Groups only the active Jira tab and performs all work locally.

## Requirements

- Google Chrome with Manifest V3 extension support
- Node.js 22 or newer
- npm

## Development

Install dependencies and run the validation suite:

```sh
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run dev` watches the TypeScript source and rebuilds `dist/background.js`. Reload the extension in Chrome after a rebuild. If files under `public/` change, restart the watch command so they are recopied.

Other useful commands:

```sh
npm run icons  # regenerate the checked-in temporary PNG icons
```

## Install in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this repository's `dist/` directory.

## Usage

Open a supported Anaconda Jira ticket, then either click the extension icon or use:

- macOS: `Command+Shift+Y`
- Windows/Linux: `Ctrl+Shift+Y`

Chrome may reserve or reassign extension shortcuts. They can be reviewed at `chrome://extensions/shortcuts`.

## Permissions and privacy

The extension requests only `activeTab`, `scripting`, and `tabGroups`. It temporarily reads the active page when explicitly triggered, does not request access to all sites, and does not use Jira APIs, store credentials, collect analytics, or send ticket information elsewhere.

## Current limitations

- Only exact Anaconda Jira browse URLs are supported.
- Jira UI changes may require updating the isolated ticket-heading selectors.
- Existing groups are not detected or reused.
- Additional related tabs must be added to the group manually.
- There is no popup, settings page, or Chrome Web Store publishing workflow.
