export type LegacyAction = {
  go: string; label: string; track?: string;
  f?: { mode?: string; dom?: string; ts?: string[]; clear?: boolean };
};
export type LegacyStep = { n: number; short: string; title: string; dur?: string; ts: string[]; tasks: string[]; gate?: string };
export type LegacyTrack = {
  id: string; name: string; tag: string; unit: string; runway: string; who: string;
  notes: { w?: number; b: string; t: string }[]; steps: LegacyStep[];
};
export type LegacyQuestion = { id: string; d: number; ts: string; sc: number; pick: number; stem: string; o: [string, number, string][] };
export type LegacySite = {
  TRACKS: Record<string, LegacyTrack>;
  TRACK_ORDER: string[];
  HEUR: { id: string; t: string; b: string; ev: string }[];
  DOMAINS: { n: number; name: string; w: number; items: number; ts: string }[];
  SCEN: { n: number; t: string; d: string; dom: number[] }[];
  INSCOPE: string[];
  OUTSCOPE: string[];
  Q: LegacyQuestion[];
  LAB: string;
  actionsFor: (txt: string, step: LegacyStep) => LegacyAction[];
};

function between(src: string, start: string, end: string): string {
  const a = src.indexOf(start);
  if (a < 0) throw new Error(`marker not found: ${start}`);
  const b = src.indexOf(end, a + start.length);
  if (b < 0) throw new Error(`marker not found: ${end}`);
  return src.slice(a + start.length, b);
}

export function loadSite(html: string): LegacySite {
  const data = between(html, "/* ============================ DATA ============================ */", "/* ============================ RENDER");
  const actions = "function actionsFor(" + between(html, "function actionsFor(", "function applyFilters(");
  return new Function(
    `${data}\n${actions}\nreturn { TRACKS, TRACK_ORDER, HEUR, DOMAINS, SCEN, INSCOPE, OUTSCOPE, Q, LAB, actionsFor };`,
  )() as LegacySite;
}

export function loadStatics(html: string) {
  return {
    place: `<div class="place">${between(html, '<div class="place">', '<div class="tsel"')}`.trim(),
    heurLede: between(html, '<section id="p-heur" hidden>', '<div class="hgrid"').trim(),
    heurExtras: between(html, '<div class="hgrid" id="hgrid"></div>', "</section>").trim(),
    blueIntro: between(html, '<section id="p-blue" hidden>', '<div id="weights"></div>').trim(),
    blueNote: between(html, '<div id="weights"></div>', '<div class="scope">').trim(),
    scenLede: between(html, '<section id="p-scen" hidden>', '<div class="sgrid"').trim(),
    drillLede: between(html, '<section id="p-drill" hidden>', '<div class="drillbar">').trim(),
    labLede: between(html, '<section id="p-lab" hidden>', '<div id="labbody">').trim(),
    footer: between(html, "<footer>", "</footer>").trim(),
  };
}
