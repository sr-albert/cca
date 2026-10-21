import type { ContentVersion } from "./payload";

declare global {
  /** Injected by vite.config.ts `define`. */
  const __CONTENT_VERSION__: ContentVersion;
}
