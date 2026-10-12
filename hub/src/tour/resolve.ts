export const tourSelector = (marker: string) => `[data-tour="${marker}"]`;

/** The first marker the caller reports as visible, or null to centre the popover. */
export function pickTarget(targets: readonly string[], isVisible: (marker: string) => boolean): string | null {
  return targets.find(isVisible) ?? null;
}

export function needsNavigation(step: { path: string }, at: { pathname: string; search: string }): boolean {
  return at.pathname + at.search !== step.path;
}
