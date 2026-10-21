import { describe, expect, it } from "vitest";
import { collectDevice, parseUserAgent } from "./device";
import { Device } from "./payload";

const UA = {
  safariMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  ipadSafari:
    "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  edgeWindows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.68",
  firefoxLinux: "Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
  samsung:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  chromeOs:
    "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  androidTablet:
    "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
};

describe("parseUserAgent", () => {
  it.each([
    [UA.safariMac, { browser: "Safari", browserVersion: "19.0", os: "macOS", deviceType: "desktop" }],
    [UA.chromeAndroid, { browser: "Chrome", browserVersion: "130.0.0.0", os: "Android", deviceType: "mobile" }],
    [UA.ipadSafari, { browser: "Safari", browserVersion: "18.0", os: "iPadOS", deviceType: "tablet" }],
    [UA.edgeWindows, { browser: "Edge", browserVersion: "130.0.2849.68", os: "Windows", deviceType: "desktop" }],
    [UA.firefoxLinux, { browser: "Firefox", browserVersion: "132.0", os: "Linux", deviceType: "desktop" }],
    [UA.samsung, { browser: "Samsung Internet", browserVersion: "26.0", os: "Android", deviceType: "mobile" }],
    [UA.iphone, { browser: "Safari", browserVersion: "18.0", os: "iOS", deviceType: "mobile" }],
    [UA.chromeOs, { browser: "Chrome", browserVersion: "130.0.0.0", os: "ChromeOS", deviceType: "desktop" }],
    [UA.androidTablet, { browser: "Chrome", browserVersion: "130.0.0.0", os: "Android", deviceType: "tablet" }],
    ["", { browser: "Unknown", browserVersion: "", os: "Unknown", deviceType: "desktop" }],
  ])("parses %s", (ua, expected) => {
    expect(parseUserAgent(ua)).toEqual(expected);
  });
});

describe("collectDevice", () => {
  it("returns defaults for a window without the optional browser APIs", () => {
    const win = { navigator: { userAgent: UA.firefoxLinux } } as unknown as Window;
    const d = collectDevice(win);
    expect(d.colorScheme).toBe("light");
    expect(d.connection).toBeNull();
    expect(d.zoom).toBeNull();
    expect(d.pointer).toBe("none");
    expect(d.browser).toBe("Firefox");
    expect(Device.safeParse(d).success).toBe(true);
  });

  it("does not throw on an empty window", () => {
    expect(() => collectDevice({} as Window)).not.toThrow();
  });

  it("reads the optional APIs when present", () => {
    const win = {
      navigator: { userAgent: UA.safariMac, languages: ["en-US"], maxTouchPoints: 0, connection: { effectiveType: "4g" } },
      matchMedia: (q: string) => ({ matches: q.includes("dark") || q.includes("fine") }),
      visualViewport: { scale: 1.5 },
      innerWidth: 800,
      innerHeight: 600,
      devicePixelRatio: 2,
      screen: { width: 1920, height: 1080 },
    } as unknown as Window;
    const d = collectDevice(win);
    expect(d).toMatchObject({
      colorScheme: "dark",
      pointer: "fine",
      zoom: 1.5,
      connection: "4g",
      viewport: { w: 800, h: 600 },
      screen: { w: 1920, h: 1080 },
      pixelRatio: 2,
      languages: ["en-US"],
    });
  });

  it("recognises an iPad that sends a Mac user agent", () => {
    const win = { navigator: { userAgent: UA.safariMac, maxTouchPoints: 5 } } as unknown as Window;
    expect(collectDevice(win)).toMatchObject({ os: "iPadOS", deviceType: "tablet", touch: true });
  });
});
