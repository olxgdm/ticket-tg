const SUPPORTED_JIRA_HOSTNAME = "anaconda.atlassian.net";
const TICKET_PATH_PATTERN = /^\/browse\/([A-Z][A-Z0-9]*-\d+)\/?$/;

export function extractTicketId(input: string): string | null {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== SUPPORTED_JIRA_HOSTNAME) {
    return null;
  }

  return url.pathname.match(TICKET_PATH_PATTERN)?.[1] ?? null;
}

export function isSupportedJiraTicketUrl(input: string): boolean {
  return extractTicketId(input) !== null;
}

export function normalizeTicketTitle(input: string | null | undefined): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const normalized = input.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function readJiraTicketTitle(tabId: number): Promise<string | null> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: (): string | null => {
      const selectors = [
        '[data-testid="issue.views.issue-base.foundation.summary.heading"]',
        '[data-testid="issue.views.issue-base.foundation.summary"] h1',
        "main h1",
      ];

      for (const selector of selectors) {
        const text = document.querySelector(selector)?.textContent;
        if (typeof text === "string" && text.trim().length > 0) {
          return text;
        }
      }

      return null;
    },
  });

  return normalizeTicketTitle(results[0]?.result);
}
