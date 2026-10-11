import type { CertId } from "../data/schema";

export const CCARF_ONLY_PAGES = ["plan", "reference"];

export function resolveCert(param: string | undefined, available: CertId[]): CertId | null {
  return available.find((id) => id === param) ?? null;
}

export function certSwitchPath(target: CertId, pathname: string): string {
  const page = pathname.split("/")[2] ?? "";
  if (!page || (CCARF_ONLY_PAGES.includes(page) && target !== "ccarf")) return `/${target}`;
  return `/${target}/${page}`;
}

const NAV = [
  { to: "", label: "Home", end: true },
  { to: "plan", label: "Plan" },
  { to: "lessons", label: "Lessons" },
  { to: "practice", label: "Practice" },
  { to: "cards", label: "Flashcards" },
  { to: "reference", label: "Reference" },
];

export function navItems(cert: CertId) {
  return NAV.filter((n) => cert === "ccarf" || !CCARF_ONLY_PAGES.includes(n.to));
}
