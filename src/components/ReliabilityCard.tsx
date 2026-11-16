import { reliabilityMean } from "../lib/calculate";
import type { LineResult } from "../lib/types";

const signals = [
  ["onTime", "On-time history"],
  ["communication", "Communication"],
  ["qualityConsistency", "Quality consistency"],
  ["complianceDocs", "Compliance paperwork"],
  ["sampling", "Sampling"],
] as const;

export function ReliabilityCard({ result, label, emphasize }: { result: LineResult; label: string; emphasize?: boolean }) {
  const profile = result.origin.demoReliability;
  const mean = reliabilityMean(result);
  return (
    <article className="rounded-[24px] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mono-label text-[10px]">{label}</p>
          <h3 className="mt-1 font-heading text-2xl leading-none">{result.origin.name}</h3>
        </div>
        <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {emphasize ? "Stronger demo profile" : "Demo profile"}
        </span>
      </div>
      <p className="mt-4 font-mono text-sm text-primary">{mean.toFixed(1)} / 5</p>
      <div className="mt-4 space-y-2.5">
        {signals.map(([key, name]) => (
          <div key={key} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">{name}</span>
            <span className="flex gap-1" aria-label={`${name}: ${profile[key]} of 5`}>
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 w-4 rounded-full ${index < profile[key] ? (emphasize ? "bg-primary" : "bg-ink") : "bg-canvas"}`}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{profile.note}</p>
    </article>
  );
}
