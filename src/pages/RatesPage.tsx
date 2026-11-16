import { useMemo, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { PlaceholderBanner } from "../components/PlaceholderBanner";
import { WaitlistSection } from "../components/WaitlistForm";
import { countryMatches } from "../lib/countries";
import { resolveDuty, resolveFreight } from "../lib/calculate";
import { money, percent } from "../lib/format";
import { categories, destinations, getCategory, origins } from "../lib/rates";
import { usePageTitle } from "../lib/usePageTitle";

export function RatesPage() {
  usePageTitle("Placeholder rate table — Landed");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "woven-shirts");
  const [query, setQuery] = useState("");
  const category = getCategory(categoryId);
  const filtered = useMemo(() => origins.filter((origin) => countryMatches(origin, query)), [query]);

  return (
    <>
    <main className="mx-auto max-w-page px-6 py-14 md:px-10 md:py-20">
      <PageIntro
        eyebrow="Sample data · not a tariff"
        title="The rate file, in the open."
        lede="Duty, tax, and freight below are placeholder estimates so the calculator has something to run. Replace src/data/rates.json when researched numbers are ready. The app does not keep a second table in code."
      />
      <div className="mt-8">
        <PlaceholderBanner />
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mono-label">HS category</span>
          <select
            className="mt-2 h-14 w-full rounded-2xl border border-line bg-white px-4"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.hsCode}
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
        {category.summary} {category.hsNote} Duty basis for this category: {category.dutyBasis === "cif" ? "CIF" : "product cost (FOB stand-in)"}. Insurance is{" "}
        {percent(category.freightEstimates.insuranceRateOfProduct)} of product cost. Showing {filtered.length} of {origins.length} origins.
      </p>

      <h2 className="mt-12 font-heading text-3xl">MFN and import tax by destination</h2>
      <div className="mt-4 overflow-x-auto rounded-[28px] border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-canvas text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">MFN duty</th>
              <th className="px-4 py-3 font-medium">Import tax</th>
              <th className="px-4 py-3 font-medium">Tax base</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((destination) => {
              const tax = category.importTaxByDestination[destination.code];
              return (
                <tr key={destination.code} className="border-t border-line">
                  <td className="px-4 py-3">{destination.name}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{percent(category.mfnByDestination[destination.code] ?? 0)}</td>
                  <td className="px-4 py-3">
                    {tax.name} · <span className="font-mono">{percent(tax.rate)}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{tax.basis.replaceAll("_", " ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 font-heading text-3xl">What the calculator resolves</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Preferential overrides replace MFN when a row exists for that origin and destination. Freight is the placeholder per-piece figure for this category.
      </p>
      <div className="mt-4 overflow-x-auto rounded-[28px] border border-line">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-canvas text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Origin</th>
              <th className="px-4 py-3 font-medium">Region</th>
              {destinations.map((destination) => (
                <th key={destination.code} className="px-4 py-3 font-medium">
                  {destination.code} duty / freight
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
                <td className="px-4 py-3 text-muted">{origin.region}</td>
                {destinations.map((destination) => {
                  const duty = resolveDuty(category, origin.code, destination.code);
                  const freight = resolveFreight(category, origin, destination.code);
                  return (
                    <td key={destination.code} className="px-4 py-3">
                      <span className={duty.kind === "mfn" ? "font-mono" : "font-mono text-primary"}>
                        {percent(duty.rate)}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {duty.kind === "preferential" ? duty.program : duty.kind === "domestic" ? "Domestic" : "MFN"}
                      </span>
                      <span className="mt-1 block font-mono text-xs">{money(freight.perUnitUsd)}/pc</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p className="mt-4 text-sm text-muted">No origin matches that search.</p>}

      </main>
    <div className="mt-16">
      <WaitlistSection />
    </div>
    </>
  );
}
