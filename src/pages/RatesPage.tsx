import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataNote } from "../components/PlaceholderBanner";
import { PageIntro } from "../components/PageIntro";
import { WaitlistSection } from "../components/WaitlistForm";
import { countryMatches } from "../lib/countries";
import { resolveDuty } from "../lib/calculate";
import { percent, RATE_UNAVAILABLE } from "../lib/format";
import { categories, destinations, getCategory, origins, tariffs } from "../lib/rates";
import { usePageTitle } from "../lib/usePageTitle";

export function RatesPage() {
  usePageTitle("Rate table — Landed");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "shirt_woven_linen");
  const [query, setQuery] = useState("");
  const category = getCategory(categoryId);
  const filtered = useMemo(() => origins.filter((origin) => countryMatches(origin, query)), [query]);

  return (
    <>
      <main className="mx-auto max-w-page px-6 py-14 md:px-10 md:py-20">
        <PageIntro
          eyebrow="Schedules · not a broker"
          title="The rate file, in the open."
          lede="Each cell is the effective duty from the 15 Nov 2026 dataset: the preferential path when one is published, otherwise the MFN path. Domestic lanes stay inside one customs territory. A blank schedule is marked unavailable and is never shown as 0%."
        />
        <div className="mt-8">
          <DataNote />
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mono-label">Product</span>
            <select
              className="mt-2 h-14 w-full rounded-2xl border border-line bg-white px-4"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block flex-1">
            <span className="mono-label">Search origins</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Vietnam, PT, Turkey…"
              className="mt-2 h-14 w-full rounded-2xl border border-line bg-white px-4"
            />
          </label>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          {category.label}. Lines:{" "}
          {destinations.map((destination) => `${destination.code} ${category.codes[destination.code]}`).join(" · ")}. Showing{" "}
          {filtered.length} of {origins.length} origins. Freight is not in this table.
        </p>

        <h2 className="mt-12 font-heading text-3xl">Import tax and de minimis</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {destinations.map((destination) => {
            const record = tariffs.destinations[destination.code];
            return (
              <article key={destination.code} className="rounded-[24px] border border-line p-5">
                <h3 className="font-heading text-2xl">{record.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{record.import_taxes.tax_base || record.import_taxes.note}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <span className="font-medium text-ink">De minimis. </span>
                  {record.de_minimis.note}
                </p>
              </article>
            );
          })}
        </div>

        <h2 className="mt-12 font-heading text-3xl">Duty by origin</h2>
        <div className="mt-4 overflow-x-auto rounded-[28px] border border-line">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-canvas text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Origin</th>
                {destinations.map((destination) => (
                  <th key={destination.code} className="px-4 py-3 font-medium">
                    {destination.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((origin) => (
                <tr key={origin.code} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    {origin.name}
                    <span className="ml-2 font-mono text-[11px] text-muted">{origin.code}</span>
                  </td>
                  {destinations.map((destination) => (
                    <td key={destination.code} className="px-4 py-3">
                      <RateCell categoryId={category.id} origin={origin.code} destination={destination.code} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="mt-4 text-sm text-muted">No origin matches that search.</p>}
        <p className="mt-6 text-sm text-muted">
          Sources, valuation, and caveats are on the <Link className="text-primary" to="/sources">methodology page</Link>.
        </p>
      </main>
      <div className="mt-16">
        <WaitlistSection />
      </div>
    </>
  );
}

function RateCell({ categoryId, origin, destination }: { categoryId: string; origin: string; destination: string }) {
  const preferential = resolveDuty(categoryId, origin, destination, true);
  const mfn = resolveDuty(categoryId, origin, destination, false);
  if (preferential.kind === "domestic") {
    return <span className="text-muted">Domestic</span>;
  }
  if (preferential.kind === "unavailable") {
    return <span className="text-primary">{RATE_UNAVAILABLE}</span>;
  }
  return (
    <span>
      <span className="block font-mono">{preferential.kind === "preferential" ? `${percent(preferential.rate ?? 0)} pref` : "No preference"}</span>
      <span className="mt-1 block text-xs text-muted">{mfn.rate == null ? RATE_UNAVAILABLE : `${percent(mfn.rate)} MFN`}</span>
    </span>
  );
}
