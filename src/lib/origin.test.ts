import { describe, expect, it } from "vitest";
import { resolveOrigin } from "./origin";

describe("resolveOrigin", () => {
  it("prefers SITE_URL over headers and strips the path", () => {
    expect(
      resolveOrigin({ siteUrl: "https://app.example.com/some/path", host: "evil.test" }),
    ).toBe("https://app.example.com");
  });

  it("ignores invalid or non-http SITE_URL and falls back to headers", () => {
    expect(resolveOrigin({ siteUrl: "javascript:alert(1)", host: "localhost:3000" })).toBe(
      "http://localhost:3000",
    );
    expect(resolveOrigin({ siteUrl: "not a url", host: "localhost:3000" })).toBe(
      "http://localhost:3000",
    );
    expect(resolveOrigin({ siteUrl: "  ", host: "localhost:3000" })).toBe("http://localhost:3000");
  });

  it("uses forwarded host and proto, taking the first comma-separated value", () => {
    expect(
      resolveOrigin({
        forwardedHost: "a.example.com, b.example.com",
        forwardedProto: "https, http",
        host: "internal",
      }),
    ).toBe("https://a.example.com");
  });

  it("defaults to http when no proto is given", () => {
    expect(resolveOrigin({ host: "localhost:3000" })).toBe("http://localhost:3000");
  });

  it("rejects protocols other than http and https", () => {
    expect(resolveOrigin({ host: "a.com", forwardedProto: "ftp" })).toBeNull();
  });

  it("returns null when there is no usable host", () => {
    expect(resolveOrigin({})).toBeNull();
    expect(resolveOrigin({ host: "bad host/with slash" })).toBeNull();
  });
});
