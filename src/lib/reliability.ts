import type { Reliability } from "./types";

const NOTE =
  "Fictional demo profile so the reliability panel has signals to weigh. Not an assessment of real factories or of this country.";

const TUNED: Record<string, Omit<Reliability, "placeholder" | "note">> = {
  PT: { onTime: 5, communication: 5, qualityConsistency: 4, complianceDocs: 4, sampling: 5 },
  IT: { onTime: 4, communication: 4, qualityConsistency: 5, complianceDocs: 4, sampling: 4 },
  VN: { onTime: 4, communication: 3, qualityConsistency: 4, complianceDocs: 3, sampling: 4 },
  CN: { onTime: 4, communication: 4, qualityConsistency: 4, complianceDocs: 3, sampling: 4 },
  BD: { onTime: 3, communication: 3, qualityConsistency: 3, complianceDocs: 3, sampling: 4 },
  TR: { onTime: 4, communication: 4, qualityConsistency: 4, complianceDocs: 4, sampling: 4 },
  IN: { onTime: 3, communication: 4, qualityConsistency: 3, complianceDocs: 3, sampling: 4 },
  MX: { onTime: 4, communication: 4, qualityConsistency: 3, complianceDocs: 4, sampling: 3 },
};

function hash(value: string): number {
  let h = 2166136261;
  for (const char of value) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function score(code: string, salt: string): number {
  return 3 + (hash(`${code}:${salt}`) % 3);
}

export function reliabilityFor(code: string): Reliability {
  const tuned = TUNED[code];
  return {
    placeholder: true,
    note: NOTE,
    onTime: tuned?.onTime ?? score(code, "onTime"),
    communication: tuned?.communication ?? score(code, "communication"),
    qualityConsistency: tuned?.qualityConsistency ?? score(code, "quality"),
    complianceDocs: tuned?.complianceDocs ?? score(code, "docs"),
    sampling: tuned?.sampling ?? score(code, "sampling"),
  };
}
