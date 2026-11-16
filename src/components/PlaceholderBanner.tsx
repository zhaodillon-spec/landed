import { rates } from "../lib/rates";

export function PlaceholderBanner() {
  const placeholder = rates.meta.dataStatus === "placeholder";
  return (
    <p className="rounded-2xl border border-primary/15 bg-mist px-4 py-3 text-sm leading-relaxed text-ink/80">
      <span className="mono-label mr-2 text-primary">{placeholder ? "Placeholder" : "Rate file"}</span>
      {rates.meta.disclaimer}
    </p>
  );
}
