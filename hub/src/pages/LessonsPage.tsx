import { Link } from "react-router";
import { Html } from "../components/Html";
import { getCert, lessonsByCert } from "../data";
import { useCert } from "../hooks/useCert";
import { compareTasks } from "../lib/practice";

export default function LessonsPage() {
  const cert = useCert();
  const lessons = lessonsByCert[cert];

  return (
    <section className="max-w-3xl">
      <h2 className="font-serif text-3xl">Lessons</h2>
      {getCert(cert)!.domains.map((d) => {
        const inDomain = lessons.filter((l) => l.domain === d.n).sort((a, b) => compareTasks(a.task, b.task));
        if (!inDomain.length) return null;
        return (
          <div key={d.n} className="mt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
              Domain {d.n} · <Html as="span" html={d.name} />
            </h3>
            <ul className="mt-2 divide-y divide-line rounded border border-line bg-surface">
              {inDomain.map((l) => (
                <li key={l.slug}>
                  <Link to={`/${cert}/lessons/${l.slug}`} className="block px-3 py-2 hover:bg-accent-soft">
                    <span className="font-mono text-xs text-muted">{l.task}</span>{" "}
                    <Html as="span" className="font-serif" html={l.title} />
                    <Html as="span" className="block text-sm text-muted" html={l.lead} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
