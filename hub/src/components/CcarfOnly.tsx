import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useCert } from "../hooks/useCert";

export function CcarfOnly({ children }: { children: ReactNode }) {
  const cert = useCert();
  return cert === "ccarf" ? <>{children}</> : <Navigate to={`/${cert}`} replace />;
}
