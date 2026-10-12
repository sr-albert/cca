import { NavLink } from "react-router";
import type { CertId } from "../data/schema";
import { navItems } from "../lib/certs";
import { TourButton } from "../tour/TourLauncher";

export function NavLinks({ cert, vertical }: { cert: CertId; vertical?: boolean }) {
  return (
    <nav aria-label="Pages" className={vertical ? "flex flex-col gap-0.5" : "flex gap-1 overflow-x-auto"}>
      {navItems(cert).map((n) => (
        <NavLink
          key={n.label}
          to={`/${cert}${n.to ? `/${n.to}` : ""}`}
          end={n.end}
          className={({ isActive }) =>
            `whitespace-nowrap px-3 py-1.5 text-sm ${vertical ? "border-l-2" : "border-b-2"} ${
              isActive ? "border-accent font-semibold text-accent" : "border-transparent text-ink hover:text-accent"
            }`
          }
        >
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({ cert }: { cert: CertId }) {
  return (
    <aside data-tour="nav" className="hidden w-48 shrink-0 border-r border-line px-3 py-5 md:block">
      <div className="mb-5 px-3 font-mono text-xs uppercase tracking-widest">Study Hub</div>
      <NavLinks cert={cert} vertical />
      <div className="mt-6 px-3"><TourButton /></div>
    </aside>
  );
}
