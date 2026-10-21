import type { Device } from "./payload";

type Parsed = { browser: string; browserVersion: string; os: string; deviceType: Device["deviceType"] };

const BROWSERS: [string, RegExp][] = [
  ["Edge", /\b(?:Edg|EdgA|EdgiOS|Edge)\/([\d.]+)/],
  ["Samsung Internet", /\bSamsungBrowser\/([\d.]+)/],
  ["Firefox", /\b(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /\b(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /\bVersion\/([\d.]+).*\bSafari\//],
];

export function parseUserAgent(ua: string): Parsed {
  let browser = "Unknown";
  let browserVersion = "";
  for (const [name, re] of BROWSERS) {
    const m = re.exec(ua);
    if (m) {
      browser = name;
      browserVersion = m[1];
      break;
    }
  }

  let os = "Unknown";
  if (/\biPad\b/.test(ua)) os = "iPadOS";
  else if (/\b(?:iPhone|iPod)\b/.test(ua)) os = "iOS";
  else if (/\bAndroid\b/.test(ua)) os = "Android";
  else if (/\bCrOS\b/.test(ua)) os = "ChromeOS";
  else if (/\bWindows\b/.test(ua)) os = "Windows";
  else if (/\bMacintosh\b|\bMac OS X\b/.test(ua)) os = "macOS";
  else if (/\bLinux\b|\bX11\b/.test(ua)) os = "Linux";

  let deviceType: Device["deviceType"] = "desktop";
  if (os === "iPadOS") deviceType = "tablet";
  else if (os === "iOS") deviceType = "mobile";
  else if (os === "Android") deviceType = /\bMobile\b/.test(ua) ? "mobile" : "tablet";

  return { browser, browserVersion, os, deviceType };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Local time as ISO 8601 with the UTC offset, e.g. 2026-10-21T11:30:00+02:00. */
function localIso(d: Date): string {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

function media(win: Window, query: string): boolean {
  try {
    return win.matchMedia?.(query).matches ?? false;
  } catch {
    return false;
  }
}

type NavigatorExtras = Navigator & { connection?: { effectiveType?: string } };

export function collectDevice(win: Window): Device {
  const nav = (win.navigator ?? {}) as NavigatorExtras;
  const userAgent = String(nav.userAgent ?? "");
  const parsed = parseUserAgent(userAgent);
  const touchPoints = Number(nav.maxTouchPoints ?? 0);
  // iPadOS Safari sends a Mac user agent; touch points give it away.
  if (parsed.os === "macOS" && touchPoints > 1) {
    parsed.os = "iPadOS";
    parsed.deviceType = "tablet";
  }

  let timeZone = "";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    /* Intl unavailable */
  }

  const pointer = media(win, "(pointer: coarse)") ? "coarse" : media(win, "(pointer: fine)") ? "fine" : "none";
  const scale = win.visualViewport?.scale;

  return {
    userAgent,
    ...parsed,
    screen: { w: win.screen?.width ?? 0, h: win.screen?.height ?? 0 },
    viewport: { w: win.innerWidth ?? 0, h: win.innerHeight ?? 0 },
    pixelRatio: win.devicePixelRatio ?? 1,
    zoom: typeof scale === "number" ? scale : null,
    languages: Array.from(nav.languages ?? (nav.language ? [nav.language] : [])).slice(0, 5),
    timeZone,
    localTime: localIso(new Date()),
    colorScheme: media(win, "(prefers-color-scheme: dark)") ? "dark" : "light",
    reducedMotion: media(win, "(prefers-reduced-motion: reduce)"),
    pointer,
    touch: touchPoints > 0 || "ontouchstart" in win,
    connection: nav.connection?.effectiveType ?? null,
  };
}
