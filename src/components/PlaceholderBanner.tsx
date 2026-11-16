import { AS_OF, DISCLAIMER } from "../lib/rates";
import { formatAsOf } from "../lib/format";

export function DataNote() {
  return (
    <p className="rounded-2xl border border-primary/15 bg-mist px-4 py-3 text-sm leading-relaxed text-ink/80">
      <span className="mono-label mr-2 text-primary">As of {formatAsOf(AS_OF)}</span>
      {DISCLAIMER} Freight and insurance are your estimates, not part of the schedule.
    </p>
  );
}
