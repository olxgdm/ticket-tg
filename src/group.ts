import { normalizeTicketTitle } from "./jira";

export interface GroupingApi {
  tabs: {
    group(options: { tabIds: [number, ...number[]] }): Promise<number>;
    ungroup(tabIds: [number, ...number[]]): Promise<void>;
  };
  tabGroups: {
    update(groupId: number, properties: { title: string }): Promise<unknown>;
  };
}

export function buildGroupTitle(ticketId: string, ticketTitle: string): string | null {
  const normalizedId = ticketId.trim();
  const normalizedTitle = normalizeTicketTitle(ticketTitle);

  if (normalizedId.length === 0 || normalizedTitle === null) {
    return null;
  }

  return `${normalizedId} ${normalizedTitle}`;
}

export async function createTicketTabGroup(
  tabId: number,
  ticketId: string,
  ticketTitle: string,
  api?: GroupingApi,
): Promise<number> {
  const groupTitle = buildGroupTitle(ticketId, ticketTitle);
  if (!Number.isInteger(tabId) || tabId < 0 || groupTitle === null) {
    throw new Error("A valid tab ID, ticket ID, and ticket title are required.");
  }

  const groupingApi: GroupingApi = api ?? {
    tabs: {
      group: (options) => chrome.tabs.group(options),
      ungroup: (tabIds) => chrome.tabs.ungroup(tabIds),
    },
    tabGroups: {
      update: (groupId, properties) => chrome.tabGroups.update(groupId, properties),
    },
  };

  const groupId = await groupingApi.tabs.group({ tabIds: [tabId] });

  try {
    await groupingApi.tabGroups.update(groupId, { title: groupTitle });
  } catch (groupingError) {
    try {
      await groupingApi.tabs.ungroup([tabId]);
    } catch (rollbackError) {
      console.error("Failed to roll back the unnamed ticket tab group.", rollbackError);
    }

    throw groupingError;
  }

  return groupId;
}
