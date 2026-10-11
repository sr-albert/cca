import { useEffect } from "react";
import { useLocation } from "react-router";
import { Html } from "../components/Html";
import { catalog } from "../data";

const SECTIONS = [
  { id: "heuristics", label: "Heuristics" },
  { id: "blueprint", label: "Blueprint" },
  { id: "scenarios", label: "Scenarios" },
];

export default function ReferencePage() {
  const { hash } = useLocation();
  const { heuristics, blueprint, scenarios, statics } = catalog.ccarf;
  const maxWeight = Math.max(...blueprint.domains.map((d) => d.w));

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.();
  }, [hash]);

  return (
    <div className="max-w-4xl">
      <h2 className="font-serif text-3xl">Reference</h2>
      <nav aria-label="Sections" className="sticky top-0 z-10 -mx-1 mt-2 flex gap-3 bg-paper px-1 py-2 font-mono text-xs">
        {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`} className="text-accent">{s.label}</a>)}
      </nav>

      <section id="heuristics" className="mt-6 scroll-mt-12">
        <h3 className="font-serif text-2xl">Heuristics</h3>
        <Html className="content mt-2" html={statics.heurLede} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {heuristics.map((h) => (
            <div key={h.id} data-testid="heuristic" className="rounded border border-line bg-surface p-4">
              <span className="font-mono text-xs text-accent">{h.id}</span>
              <Html as="h4" className="mt-1 font-serif text-lg" html={h.t} />
              <Html as="p" className="content mt-1 text-sm" html={h.b} />
              <span className="mt-2 block font-mono text-[11px] text-muted">{h.ev}</span>
            </div>
          ))}
        </div>
        <Html className="content" html={statics.heurExtras} />
      </section>

      <section id="blueprint" className="mt-10 scroll-mt-12">
        <h3 className="font-serif text-2xl">Blueprint</h3>
        <Html className="content mt-2" html={statics.blueIntro} />
        <div className="space-y-2">
          {blueprint.domains.map((d) => (
            <div key={d.n} data-testid="domain-weight" className="grid grid-cols-[1fr_8rem_4rem] items-center gap-3 text-sm">
              <span>
                Domain {d.n} — <Html as="span" html={d.name} />
                <Html as="small" className="block font-mono text-[11px] text-muted" html={d.ts} />
              </span>
              <span className="h-1.5 overflow-hidden rounded bg-line">
                <i className={`block h-full ${d.w === maxWeight ? "bg-accent" : "bg-ink"}`} style={{ width: `${(d.w / maxWeight) * 100}%` }} />
              </span>
              <span className="font-mono">
                {d.w}%<small className="block text-[11px] text-muted">~{d.items} items</small>
              </span>
            </div>
          ))}
        </div>
        <Html className="content" html={statics.blueNote} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 id="in-scope" className="font-serif text-lg">In scope</h4>
            <ul aria-labelledby="in-scope" className="content mt-2 list-disc space-y-1 pl-5 text-sm">
              {blueprint.inScope.map((t, i) => <Html key={i} as="li" html={t} />)}
            </ul>
          </div>
          <div>
            <h4 id="out-scope" className="font-serif text-lg">Explicitly out of scope</h4>
            <ul aria-label="Out of scope" className="content mt-2 list-disc space-y-1 pl-5 text-sm">
              {blueprint.outScope.map((t, i) => <Html key={i} as="li" html={t} />)}
            </ul>
          </div>
        </div>
      </section>

      <section id="scenarios" className="mt-10 scroll-mt-12">
        <h3 className="font-serif text-2xl">Scenarios</h3>
        <Html className="content mt-2" html={statics.scenLede} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.n} data-testid="scenario" className="rounded border border-line bg-surface p-4">
              <span className="font-mono text-xs text-muted">Scenario {s.n}</span>
              <Html as="h4" className="mt-1 font-serif text-lg" html={s.t} />
              <Html as="p" className="content mt-1 text-sm" html={s.d} />
              <div className="mt-2 flex flex-wrap gap-1">
                {s.dom.map((n, i) => (
                  <span key={n} className={`rounded border px-1.5 font-mono text-[11px] ${i ? "border-line text-muted" : "border-accent text-accent"}`}>
                    D{n} · {blueprint.domains[n - 1].w}%
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="content mt-12 border-t border-line pt-4 text-sm text-muted">
        <Html html={statics.footer} />
      </footer>
    </div>
  );
}
