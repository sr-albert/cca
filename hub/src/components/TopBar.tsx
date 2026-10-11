import { Link, useLocation } from "react-router";
import { catalog, getCert } from "../data";
import type { CertId } from "../data/schema";
import { certSwitchPath } from "../lib/certs";
import { Html } from "./Html";
import { NavLinks } from "./Sidebar";

export function TopBar({ cert }: { cert: CertId }) {
  const { pathname } = useLocation();
  return (
    <header className="border-b border-line px-4 py-3 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Html as="h1" className="font-serif text-lg" html={getCert(cert)!.name} />
        <nav aria-label="Certification" className="flex gap-1">
          {catalog.certs.map((c) => (
            <Link
              key={c.id}
              to={certSwitchPath(c.id, pathname)}
              aria-current={c.id === cert ? "page" : undefined}
              className={`border-b-2 px-2 py-1 font-mono text-xs ${c.id === cert ? "border-accent font-semibold" : "border-transparent hover:border-line"}`}
            >
              {c.code}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-2 md:hidden">
        <NavLinks cert={cert} />
      </div>
    </header>
  );
}
