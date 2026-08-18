import { createTicketTabGroup } from "./group";
import { extractTicketId, readJiraTicketTitle } from "./jira";

export async function groupJiraTicketTab(tab: chrome.tabs.Tab): Promise<void> {
  if (tab.id === undefined || tab.url === undefined) {
    console.warn("The active tab does not expose the information needed to create a ticket group.");
    return;
  }

  const ticketId = extractTicketId(tab.url);
  if (ticketId === null) {
    console.warn("The active tab is not a supported Anaconda Jira ticket.");
    return;
  }

  const ticketTitle = await readJiraTicketTitle(tab.id);
  if (ticketTitle === null) {
    console.warn("The Jira ticket title could not be read from the active tab.");
    return;
  }

  await createTicketTabGroup(tab.id, ticketId, ticketTitle);
}

chrome.action.onClicked.addListener((tab) => {
  void groupJiraTicketTab(tab).catch((error: unknown) => {
    console.error("Unable to create the Jira ticket tab group.", error);
  });
});
