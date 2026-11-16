import { optionChips } from "../lib/calculate";
import { money } from "../lib/format";
import type { LineResult } from "../lib/types";

export function OptionCards({ a, b }: { a: LineResult; b: LineResult }) {
  const max = Math.max(a.perUnit, b.perUnit, 0.01);
  const low = Math.min(a.perUnit, b.perUnit);
  const tied = Math.abs(a.perUnit - b.perUnit) < 0.005;
  const cards = [
    { result: a, peer: b, label: "Option A" },
    { result: b, peer: a, label: "Option B" },
  ];

  return (
    <div className="space-y-3">
      {cards.map(({ result, peer, label }) => {
        const cheaper = !tied && result.perUnit <= low;
        return (
          <article key={label} className="rounded-[24px] bg-canvas p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mono-label text-[10px]">{label}</p>
                <p className="mt-1 font-heading text-2xl leading-none">{result.origin.name}</p>
              </div>
              <p className="font-mono text-sm tabular-nums">
                {money(result.perUnit)} <span className="text-muted">/ unit</span>
              </p>
            </div>
            <div className="mt-4 h-2.5 rounded-full bg-white">
              <div
                className={`h-full rounded-full ${cheaper ? "bg-primary" : "bg-ink"}`}
                style={{ width: `${(result.perUnit / max) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {optionChips(result, peer).map((chip) => (
                <span key={chip} className="rounded-full bg-white px-3 py-1 text-xs text-muted">
                  {chip}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
