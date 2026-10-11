import { useParams } from "react-router";
import type { CertId } from "../data/schema";

/** The current cert. Layout has already redirected away from invalid values. */
export function useCert(): CertId {
  return useParams().cert as CertId;
}
