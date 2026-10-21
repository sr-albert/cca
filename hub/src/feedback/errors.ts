import type { ErrorEntry } from "./payload";

const MAX_ENTRIES = 10;
const MAX_MESSAGE = 300;
const MAX_SOURCE = 200;

let buffer: ErrorEntry[] = [];
let uninstall: (() => void) | null = null;

function record(message: string, source: string, line: number | null) {
  buffer.push({ message: message.slice(0, MAX_MESSAGE), source: source.slice(0, MAX_SOURCE), line });
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

function reasonMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;
  try {
    return JSON.stringify(reason) ?? String(reason);
  } catch {
    return String(reason);
  }
}

/** Starts recording window errors and unhandled rejections. Calling it again is a no-op. */
export function installErrorBuffer(win: Window): void {
  if (uninstall) return;
  const onError = (e: Event) => {
    const ev = e as ErrorEvent;
    record(ev.message || reasonMessage(ev.error), ev.filename ?? "", ev.lineno || null);
  };
  const onRejection = (e: Event) => record(reasonMessage((e as PromiseRejectionEvent).reason), "", null);
  win.addEventListener("error", onError);
  win.addEventListener("unhandledrejection", onRejection);
  uninstall = () => {
    win.removeEventListener("error", onError);
    win.removeEventListener("unhandledrejection", onRejection);
  };
}

export function recentErrors(): ErrorEntry[] {
  return buffer.map((e) => ({ ...e }));
}

/** Stops recording and clears the buffer. For tests. */
export function resetErrorBuffer(): void {
  uninstall?.();
  uninstall = null;
  buffer = [];
}
