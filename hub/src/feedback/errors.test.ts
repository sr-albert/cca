import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installErrorBuffer, recentErrors, resetErrorBuffer } from "./errors";

const fire = (message: string, filename = "app.js", lineno = 1) =>
  window.dispatchEvent(new ErrorEvent("error", { message, filename, lineno }));

describe("error buffer", () => {
  beforeEach(() => installErrorBuffer(window));
  afterEach(() => resetErrorBuffer());

  it("keeps the last 10 errors", () => {
    for (let i = 1; i <= 12; i++) fire(`e${i}`);
    const errors = recentErrors();
    expect(errors).toHaveLength(10);
    expect(errors[0].message).toBe("e3");
    expect(errors[9].message).toBe("e12");
  });

  it("records source and line", () => {
    fire("bad", "main.js", 42);
    expect(recentErrors()).toEqual([{ message: "bad", source: "main.js", line: 42 }]);
  });

  it("records an unhandled rejection's message", () => {
    const ev = new Event("unhandledrejection");
    Object.assign(ev, { reason: new Error("boom") });
    window.dispatchEvent(ev);
    expect(recentErrors()).toEqual([{ message: "boom", source: "", line: null }]);
  });

  it("cuts long messages and sources", () => {
    fire("x".repeat(5000), "s".repeat(500));
    const [e] = recentErrors();
    expect(e.message).toHaveLength(300);
    expect(e.source).toHaveLength(200);
  });

  it("does not double-record when installed twice", () => {
    installErrorBuffer(window);
    fire("once");
    expect(recentErrors()).toHaveLength(1);
  });

  it("stops recording and clears after a reset", () => {
    fire("a");
    resetErrorBuffer();
    fire("b");
    expect(recentErrors()).toEqual([]);
  });
});
