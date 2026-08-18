import { describe, expect, it } from "vitest";
import {
  extractTicketId,
  isSupportedJiraTicketUrl,
  normalizeTicketTitle,
} from "../src/jira";

describe("extractTicketId", () => {
  it.each([
    ["https://anaconda.atlassian.net/browse/PKG-17095", "PKG-17095"],
    ["https://anaconda.atlassian.net/browse/CORE2-9/", "CORE2-9"],
    ["https://anaconda.atlassian.net/browse/SCI-117?focusedCommentId=1", "SCI-117"],
    ["https://anaconda.atlassian.net/browse/OPS42-8/#details", "OPS42-8"],
  ])("extracts a generic Jira ticket ID from %s", (url, expected) => {
    expect(extractTicketId(url)).toBe(expected);
    expect(isSupportedJiraTicketUrl(url)).toBe(true);
  });

  it.each([
    "http://anaconda.atlassian.net/browse/PKG-17095",
    "https://example.atlassian.net/browse/PKG-17095",
    "https://anaconda.atlassian.net/browse/PKG-17095/details",
    "https://anaconda.atlassian.net/browse/PKG-17095//",
    "https://anaconda.atlassian.net/browse/pkg-17095",
    "https://anaconda.atlassian.net/browse/PKG-ABC",
    "https://anaconda.atlassian.net/issues/PKG-17095",
    "https://anaconda.atlassian.net/browse/PKG-17095%2Fdetails",
    "not a URL",
  ])("rejects unsupported or malformed URL %s", (url) => {
    expect(extractTicketId(url)).toBeNull();
    expect(isSupportedJiraTicketUrl(url)).toBe(false);
  });
});

describe("normalizeTicketTitle", () => {
  it("trims only surrounding whitespace", () => {
    expect(normalizeTicketTitle(" \t numpy  2.5.2\nnext line \r\n")).toBe(
      "numpy  2.5.2\nnext line",
    );
  });

  it("preserves arbitrary opaque title content", () => {
    expect(normalizeTicketTitle("  pytorch-cuda 13.0 / rebuild: phase 2  ")).toBe(
      "pytorch-cuda 13.0 / rebuild: phase 2",
    );
  });

  it.each([null, undefined, "", " \t\n "])("rejects missing title %s", (title) => {
    expect(normalizeTicketTitle(title)).toBeNull();
  });
});
