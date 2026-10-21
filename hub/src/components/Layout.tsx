import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { catalog } from "../data";
import { resolveCert } from "../lib/certs";
import { useProgress } from "../state/progress";
import { PlanPane } from "./plan/PlanPane";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FeedbackProvider } from "../feedback/FeedbackProvider";
import { TourLauncher } from "../tour/TourLauncher";

export function Layout() {
  const cert = resolveCert(useParams().cert, catalog.certs.map((c) => c.id));
  const { pathname, search } = useLocation();
  const setLastVisit = useProgress((s) => s.setLastVisit);

  useEffect(() => {
    if (cert && pathname !== `/${cert}`) setLastVisit({ cert, path: pathname + search });
  }, [cert, pathname, search, setLastVisit]);

  if (!cert) return <Navigate to="/ccarf" replace />;
  return (
    <TourLauncher cert={cert}>
    <FeedbackProvider cert={cert}>
    <div className="flex min-h-screen">
      <Sidebar cert={cert} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar cert={cert} />
        <div className="flex min-w-0 flex-1">
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
          {cert === "ccarf" && <PlanPane />}
        </div>
      </div>
    </div>
    </FeedbackProvider>
    </TourLauncher>
  );
}
