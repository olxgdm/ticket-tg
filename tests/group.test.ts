import { describe, expect, it, vi } from "vitest";
import { buildGroupTitle, createTicketTabGroup, type GroupingApi } from "../src/group";

function createApi(): GroupingApi {
  return {
    tabs: {
      group: vi.fn().mockResolvedValue(42),
      ungroup: vi.fn().mockResolvedValue(undefined),
    },
    tabGroups: {
      update: vi.fn().mockResolvedValue({ id: 42 }),
    },
  };
}

describe("buildGroupTitle", () => {
  it.each([
    ["PKG-17095", "numpy 2.5.2", "PKG-17095 numpy 2.5.2"],
    ["PKG-17096", "numpy", "PKG-17096 numpy"],
    ["SCI-17110", "  scipy  1.17.0  ", "SCI-17110 scipy  1.17.0"],
    ["OPS42-8", "nodejs\nfollow-up", "OPS42-8 nodejs\nfollow-up"],
  ])("joins %s and an opaque title with one space", (ticketId, title, expected) => {
    expect(buildGroupTitle(ticketId, title)).toBe(expected);
  });

  it.each([
    ["", "numpy"],
    ["  ", "numpy"],
    ["PKG-1", ""],
    ["PKG-1", " \t\n "],
  ])("rejects missing group-title input", (ticketId, title) => {
    expect(buildGroupTitle(ticketId, title)).toBeNull();
  });
});

describe("createTicketTabGroup", () => {
  it("groups only the requested tab and assigns the complete title", async () => {
    const api = createApi();

    await expect(createTicketTabGroup(17, "PKG-17095", "numpy 2.5.2", api)).resolves.toBe(42);
    expect(api.tabs.group).toHaveBeenCalledWith({ tabIds: [17] });
    expect(api.tabGroups.update).toHaveBeenCalledWith(42, { title: "PKG-17095 numpy 2.5.2" });
    expect(api.tabs.ungroup).not.toHaveBeenCalled();
  });

  it("does not call Chrome APIs when required input is invalid", async () => {
    const api = createApi();

    await expect(createTicketTabGroup(17, "PKG-17095", "  ", api)).rejects.toThrow(
      "A valid tab ID, ticket ID, and ticket title are required.",
    );
    expect(api.tabs.group).not.toHaveBeenCalled();
    expect(api.tabGroups.update).not.toHaveBeenCalled();
  });

  it("ungroups the tab and preserves the title-assignment error", async () => {
    const api = createApi();
    const titleError = new Error("title update failed");
    vi.mocked(api.tabGroups.update).mockRejectedValue(titleError);

    await expect(createTicketTabGroup(17, "PKG-17095", "numpy", api)).rejects.toBe(titleError);
    expect(api.tabs.ungroup).toHaveBeenCalledWith([17]);
  });

  it("keeps the original error when rollback also fails", async () => {
    const api = createApi();
    const titleError = new Error("title update failed");
    const rollbackError = new Error("rollback failed");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(api.tabGroups.update).mockRejectedValue(titleError);
    vi.mocked(api.tabs.ungroup).mockRejectedValue(rollbackError);

    await expect(createTicketTabGroup(17, "PKG-17095", "numpy", api)).rejects.toBe(titleError);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to roll back the unnamed ticket tab group.",
      rollbackError,
    );

    errorSpy.mockRestore();
  });
});
