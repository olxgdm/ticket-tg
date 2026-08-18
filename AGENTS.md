# AGENTS.md

## Project Overview

This repository contains a small Chrome extension for the Anaconda ticket-based browser workflow.

The extension is intended to reduce repetitive manual work when working with multiple Anaconda package-maintenance tickets in Jira.

When an Anaconda Jira ticket is open in the active Chrome tab, the extension creates a Chrome tab group for that ticket and moves the current Jira tab into the newly created group.

The group name is derived from:

1. the Jira ticket ID extracted from the ticket URL;
2. the Jira ticket title as displayed on the ticket page.

The resulting group name follows this format:

```text
<ticket-id> <ticket-title>
```

For example, given the Jira URL:

```text
https://anaconda.atlassian.net/browse/PKG-17095
```

and a ticket title such as:

```text
numpy 2.5.2
```

the extension creates the tab group:

```text
PKG-17095 numpy 2.5.2
```

`numpy 2.5.2` is only an example.

The ticket title may contain any package name, package version, descriptive text, or other text used by the Jira ticket.

Other valid examples could be:

```text
PKG-17096 numpy
PKG-17110 scipy 1.17.0
PKG-17121 nodejs
PKG-17134 pytorch-cuda 13.0
```

The extension must treat the Jira title as an opaque user-facing string.

It must not attempt to interpret the title as a structured combination of package name, version, release type, or any other semantic components.

This is not a general-purpose Jira client and not a general-purpose browser tab manager.

It is a focused productivity tool for the Anaconda package-maintenance workflow.

---

## Primary User Workflow

The intended workflow is:

1. Open an Anaconda Jira ticket in Chrome.
2. Trigger the extension using either:
   - the extension toolbar action; or
   - the configured keyboard shortcut.
3. Read the ticket ID from the current Jira URL.
4. Read the Jira ticket title.
5. Construct the group name:

   ```text
   <ticket-id> <ticket-title>
   ```

6. Create a Chrome tab group.
7. Move the current Jira tab into that group.
8. Leave any additional tabs to be added to the group manually by the user.

For the initial implementation, the extension must not automatically discover, open, move, or organize unrelated tabs.

---

## Supported Jira Scope

The extension is designed specifically for Anaconda Jira tickets hosted under:

```text
https://anaconda.atlassian.net/
```

A supported ticket URL is expected to contain the ticket ID in the Jira browse path, for example:

```text
https://anaconda.atlassian.net/browse/PKG-17095
```

In this example:

```text
PKG-17095
```

is the ticket ID.

Do not hard-code a particular numeric ticket value.

The extraction logic must work for supported ticket IDs following the expected Jira ticket URL structure.

---

## Tab Group Naming

The tab group title must use the following format:

```text
<ticket-id> <ticket-title>
```

Use exactly one space between the ticket ID and the ticket title.

For example:

```text
PKG-17095 numpy 2.5.2
```

Do not add separators such as:

```text
|
:
-
/
```

unless a future requirement explicitly changes the naming format.

The Jira title should otherwise be preserved as displayed, apart from reasonable trimming of surrounding whitespace.

### Important invariant

The extension must not parse the Jira title into package name and version fields.

For example:

```text
numpy 2.5.2
```

must be treated as one title string.

Likewise:

```text
numpy
```

is already a complete valid title.

The extension does not need to know whether a package version exists.

---

## User Interaction

The extension should support two equivalent ways of triggering the same operation.

### Toolbar action

Clicking the extension icon should create the ticket tab group for the active Jira ticket.

### Keyboard command

The default keyboard shortcut is intended to be:

macOS:

```text
Command+Shift+Y
```

Windows/Linux:

```text
Ctrl+Shift+Y
```

The toolbar action and keyboard command must execute the same underlying workflow.

Do not maintain separate implementations of the group-creation logic for each trigger.

---

## Technology

The production extension should use:

- TypeScript;
- Chrome Manifest V3;
- standard Chrome Extension APIs;
- a Manifest V3 service worker where background behavior is required;
- minimal page scripting only where necessary;
- npm for dependency and script management.

Avoid adding frameworks without a concrete requirement.

In particular, do not introduce React, Vue, Angular, Svelte, or another UI framework for the initial implementation.

The initial extension does not require a complex user interface.

---

## Project Architecture

Keep the architecture small and focused.

Production code should be divided according to responsibility rather than concentrated into one large file.

A likely structure is:

```text
src/
├── background.ts
├── jira.ts
└── group.ts
```

The exact file structure may evolve, but responsibilities should remain clearly separated.

### Background/service worker responsibilities

Background Chrome integration should be responsible for:

- handling extension toolbar actions;
- handling configured keyboard commands;
- obtaining the active Chrome tab;
- coordinating the ticket-group creation workflow;
- calling Chrome Extension APIs.

Avoid putting Jira-specific parsing logic directly into event handlers when it can be isolated into testable functions.

### Jira-specific responsibilities

Jira-specific logic should be responsible for:

- determining whether the current URL represents a supported Anaconda Jira ticket;
- extracting the ticket ID from the URL;
- obtaining the ticket title;
- validating required Jira-derived information.

Jira-specific logic should not create Chrome tab groups directly.

### Tab-group responsibilities

Tab-group logic should be responsible for:

- constructing the group title;
- creating a Chrome tab group;
- moving the current tab into the group;
- assigning the generated title to the group.

Keep pure string construction logic separate from direct Chrome API interaction where practical.

---

## Chrome API Usage

Use standard Chrome Extension APIs.

Expected APIs may include:

```text
chrome.action
chrome.commands
chrome.tabs
chrome.tabGroups
chrome.scripting
```

Only use APIs that are required by the implemented behavior.

Do not add permissions speculatively.

---

## Permissions and Security

Chrome permissions must be kept as narrow as reasonably possible.

Do not request:

```text
<all_urls>
```

unless a future requirement explicitly makes it necessary.

If page-level access is required for Jira title extraction, limit host access to the Anaconda Jira host:

```text
https://anaconda.atlassian.net/*
```

The extension must not:

- store Jira credentials;
- store authentication tokens;
- request Jira API tokens;
- access Jira REST APIs unless explicitly required in a future change;
- collect browsing history;
- collect unrelated page content;
- send ticket information to external services;
- include telemetry or analytics by default;
- execute remotely hosted code;
- introduce backend services for the initial workflow.

The extension should operate entirely locally inside Chrome whenever possible.

---

## Jira Authentication

The extension must rely on the user's existing authenticated Jira browser session.

It must not implement its own Jira authentication flow.

No Jira username, password, API token, OAuth flow, or other Jira credential mechanism is required for the intended workflow.

---

## Title Extraction

Prefer the simplest reliable mechanism for obtaining the Jira ticket title.

Do not introduce Jira REST API integration merely to obtain the title.

If the browser tab title does not provide the exact required Jira ticket title, minimal DOM access may be used to read the visible ticket heading.

DOM selectors should be isolated in Jira-specific code so that future Jira UI changes can be handled without affecting the rest of the extension.

Avoid spreading Jira DOM knowledge throughout the project.

---

## Error Handling

The extension should fail safely and predictably.

Expected invalid states include:

- the active tab is not an Anaconda Jira ticket;
- no active tab is available;
- the ticket ID cannot be extracted;
- the ticket title cannot be obtained;
- Chrome rejects the tab-group operation.

Do not create malformed or partially named tab groups when required ticket information is unavailable.

Keep user-facing failure behavior lightweight.

Do not introduce complex notification systems unless needed.

---

## Automated Tests

Automated tests should primarily cover deterministic application logic.

Examples include:

- supported Jira URL detection;
- ticket ID extraction;
- group-title construction;
- whitespace handling;
- invalid URL handling;
- missing ticket information;
- preservation of arbitrary Jira ticket titles.

Example:

```text
URL:
https://anaconda.atlassian.net/browse/PKG-17095

Title:
numpy 2.5.2

Expected:
PKG-17095 numpy 2.5.2
```

Again, `numpy 2.5.2` is only an example and must not be encoded as a special case.

Tests should also include titles without versions and titles with different content.

For example:

```text
PKG-17096 numpy
PKG-17110 scipy 1.17.0
PKG-17121 nodejs
```

Chrome API boundaries may be mocked for unit tests.

Do not reproduce or reimplement Chrome's own behavior inside application code merely to make tests easier.

---

## Development Validation

The project should provide standard development commands for:

```text
npm test
npm run typecheck
npm run lint
npm run build
```

The exact tooling may evolve, but the repository should maintain automated checks for:

- tests;
- TypeScript type correctness;
- linting;
- production build validity.

All checks should be suitable for later execution in CI.

---

## Build Output

Source files belong in the source tree.

Generated extension files should be written to a build directory such as:

```text
dist/
```

A successful production build should generate a directory that can be loaded directly into Chrome using:

```text
chrome://extensions
```

with:

```text
Developer mode
→ Load unpacked
```

The generated extension root must contain a valid:

```text
manifest.json
```

The `dist/` directory is generated output and should not normally be committed to source control unless the project's distribution policy explicitly changes.

---

## Manifest

The extension must use Chrome Manifest V3.

The manifest should contain only the permissions, commands, background configuration, icons, and other declarations required by the implemented functionality.

Keep the manifest minimal.

Do not add permissions or capabilities in anticipation of hypothetical future features.

---

## Development Principles

Prefer:

- simple solutions;
- small focused modules;
- explicit behavior;
- pure functions where possible;
- minimal Chrome permissions;
- clear TypeScript types;
- straightforward error handling;
- testable business logic;
- local-only processing;
- minimal dependencies.

Avoid:

- unnecessary abstractions;
- speculative architecture;
- premature framework adoption;
- complex state-management systems;
- backend services;
- Jira API integration without a requirement;
- parsing semantic meaning from ticket titles;
- automatic management of unrelated tabs;
- features outside the defined ticket-group workflow.

The project should remain easy to understand and maintain.

---

## Scope Discipline

Before adding functionality, determine whether it belongs to the core purpose of this repository:

> Create and manage the initial Chrome tab group associated with an Anaconda Jira ticket.

Features outside that purpose should not be introduced unless explicitly requested.

In particular, do not assume that the extension should automatically:

- search for related GitHub pull requests;
- open upstream repositories;
- open conda-forge repositories;
- discover existing package tabs;
- move arbitrary tabs;
- communicate with other local ticket tools;
- persist ticket metadata;
- parse package versions;
- modify Jira tickets;
- interact with Anaconda infrastructure.

These may become future requirements, but they are not part of the initial project scope.

---

## Relationship to Other Tools

This repository is intended to complement the existing Anaconda ticket workflow tools rather than replace them.

The browser extension is responsible for browser-side ticket organization.

Other tools may independently manage terminal sessions, ticket directories, feedstock repositories, build environments, or other parts of the Anaconda package-maintenance workflow.

Keep those responsibilities separate unless explicit integration is introduced later.

---

## Maintenance Expectations

Changes should preserve the small and focused nature of the project.

When modifying existing behavior:

1. understand the current workflow before changing it;
2. preserve existing behavior unless the task explicitly requires otherwise;
3. update or add tests for behavioral changes;
4. keep permissions minimal;
5. update documentation when user-visible behavior changes;
6. avoid unrelated refactoring in focused changes.

When uncertain about a product decision or workflow requirement, do not invent new behavior.

Prefer the simplest implementation consistent with the documented requirements.
