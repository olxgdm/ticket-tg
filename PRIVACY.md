````markdown
# Privacy Policy

## Anaconda Ticket Tab Group

Last updated: August 18, 2026

Anaconda Ticket Tab Group is a Chrome extension designed to create and organize Chrome tab groups for Anaconda Jira tickets.

The extension is intentionally small and processes only the information required to provide this functionality.

## Information the Extension Accesses

When the user explicitly triggers the extension by clicking its toolbar icon or using the configured keyboard shortcut, the extension may access:

- the URL of the currently active browser tab;
- the visible title of the active Anaconda Jira ticket page.

The URL is used to identify the Jira ticket ID.

The visible Jira ticket title is used together with the ticket ID to construct the Chrome tab group name.

For example:

```text
PKG-17095 numpy 2.5.2
```

The ticket title is treated as an opaque string. The extension does not attempt to interpret package names, versions, or other information contained in the title.

## How Information Is Used

The information accessed by the extension is used only to provide its single purpose:

> Create a Chrome tab group for the active Anaconda Jira ticket and move the current ticket tab into that group.

The extension does not use the information for any unrelated purpose.

## Local Processing

All processing performed by the extension occurs locally in the user's browser.

The extension does not transmit Jira ticket URLs, ticket titles, browsing information, or other page content to the developer or to any external server.

The extension does not operate a backend service.

## Data Storage

The extension does not store Jira ticket URLs, Jira ticket titles, browsing history, or other website content.

No persistent user profile or browsing database is created by the extension.

## Data Sharing

The extension does not sell, transfer, disclose, or share user data with third parties.

No user data is provided to:

- advertising services;
- analytics providers;
- data brokers;
- external APIs;
- other third-party services.

## Analytics and Telemetry

The extension does not use analytics, telemetry, advertising, tracking technologies, or usage-reporting services.

## Authentication Information

The extension does not collect, access, or store Jira usernames, passwords, API tokens, authentication credentials, or other login information.

It relies entirely on the Jira session that is already active in the user's browser.

## Permissions

The extension uses only the Chrome permissions required for its functionality.

These permissions are used to:

- obtain temporary access to the active tab after an explicit user action;
- read the visible Jira ticket title;
- create and name the Chrome tab group.

The extension does not request persistent access to all websites.

## Web Browsing Activity

The extension accesses the URL of the active tab only when explicitly triggered by the user.

This information is used solely to determine whether the current page is a supported Anaconda Jira ticket and to extract the Jira ticket ID required for the tab group name.

The extension does not collect or retain browsing history.

## Website Content

The extension reads only the visible Jira ticket title required to construct the tab group name.

It does not collect unrelated website content and does not transmit page content outside the user's browser.

## Remote Code

The extension does not download or execute remotely hosted code.

All executable code used by the extension is included in the installed extension package.

## Chrome Web Store Limited Use

The use of information received from Chrome APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

Information accessed by the extension is used only for the user-facing functionality described in this policy and in the Chrome Web Store listing.

## Changes to This Privacy Policy

This privacy policy may be updated if the extension's functionality or data-handling practices change.

Any updated version will be published at the same public location and the "Last updated" date will be revised accordingly.

## Contact

Questions regarding this privacy policy may be submitted through the project's public GitHub repository:

https://github.com/olxgdm/ticket-tg
````