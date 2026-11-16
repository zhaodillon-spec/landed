export function money(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function percent(rate: number): string {
  return `${Number((rate * 100).toFixed(2))}%`;
}

export function transitLabel(days: readonly [number, number]): string {
  return `${days[0]}–${days[1]} days`;
}

export function flagEmoji(code: string): string {
  if (code === "EU") return "🇪🇺";
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  return [...code].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");
}

const field =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary";

export const textFieldClass = `${field} h-14`;
export const compactFieldClass = `${field} h-12`;
