export function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function percent(rate: number): string {
  return `${Number((rate * 100).toFixed(2))}%`;
}

export function transitLabel(days: readonly [number, number]): string {
  return `${days[0]}–${days[1]} days`;
}

export const RATE_UNAVAILABLE = "Rate unavailable";

export function moneyOrUnavailable(value: number | null): string {
  return value == null ? RATE_UNAVAILABLE : money(value);
}

export function unitPriceLabel(value: number | null): string {
  return value == null ? RATE_UNAVAILABLE : `${money(value)} / unit`;
}

export function formatAsOf(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function flagEmoji(code: string): string {
  const iso = code === "UK" ? "GB" : code;
  if (iso === "EU") return "🇪🇺";
  if (!/^[A-Z]{2}$/.test(iso)) return "🏳️";
  return [...iso].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");
}

const field =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary";

export const textFieldClass = `${field} h-14`;
export const compactFieldClass = `${field} h-12`;
