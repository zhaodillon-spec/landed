import { money, percent } from "../lib/format";
import type { LineResult } from "../lib/types";

const segments = [
  { key: "product", label: "Product cost", swatch: "bg-ink", pick: (result: LineResult) => result.product },
  { key: "freight", label: "Freight & insurance", swatch: "bg-freight", pick: (result: LineResult) => result.freightAndInsurance },
  { key: "duty", label: "Duties & tariffs", swatch: "bg-primary", pick: (result: LineResult) => result.duty },
  { key: "tax", label: "Import taxes", swatch: "bg-tax", pick: (result: LineResult) => result.tax },
] as const;

export function EstimateCard({ result, title }: { result: LineResult; title: string }) {
  const total = result.total || 1;
  return (
    <div className="rounded-[28px] border border-line bg-white p-7 shadow-card">
      <p className="mono-label">Landed cost estimate</p>
      <p className="mt-2 font-heading text-[28px] leading-tight">{title}</p>
      <div className="mt-6 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={segment.swatch}
            style={{ width: `${(segment.pick(result) / total) * 100}%` }}
          />
        ))}
      </div>
      <dl className="mt-5 divide-y divide-line text-[15px]">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-2.5 text-muted">
              <span className={`h-2 w-2 rounded-full ${segment.swatch}`} />
              {segment.label}
            </dt>
            <dd className="font-mono text-sm tabular-nums">{money(segment.pick(result))}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-end justify-between gap-4 rounded-[20px] bg-mist px-5 py-5">
        <div>
          <p className="mono-label text-primary">Landed cost</p>
          <p className="mt-1.5 font-heading text-5xl leading-none text-primary">{money(result.total)}</p>
        </div>
        <p className="pb-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          {ratesLabel(result)}
        </p>
      </div>
      <p className="mt-4 text-sm text-muted">
        {dutyCaption(result)} · {result.taxName} {percent(result.taxRate)}
      </p>
    </div>
  );
}

function ratesLabel(result: LineResult): string {
  return result.dutyKind === "mfn" ? "MFN placeholder" : "Placeholder";
}

function dutyCaption(result: LineResult): string {
  if (result.dutyKind === "preferential") return `${result.dutyProgram} ${percent(result.dutyRate)}`;
  if (result.dutyKind === "domestic") return "Domestic, duty 0%";
  return `MFN ${percent(result.dutyRate)}`;
}

export function EstimateDetail({ result }: { result: LineResult }) {
  const rows = [
    ["Product", money(result.product), `${money(result.unitCost)} × ${result.quantity.toLocaleString("en-US")}`],
    [
      "Freight",
      money(result.freight),
      `${money(result.freightQuote.perUnitUsd)} × ${result.quantity.toLocaleString("en-US")} · ${result.freightQuote.region}`,
    ],
    [
      "Insurance",
      money(result.insurance),
      `${percent(result.category.freightEstimates.insuranceRateOfProduct)} of product`,
    ],
    [
      "Duties & tariffs",
      money(result.duty),
      `${percent(result.dutyRate)} of ${result.dutyBasis === "cif" ? "CIF" : "product cost"}${result.dutyProgram ? ` · ${result.dutyProgram}` : ""}`,
    ],
    [result.taxName, money(result.tax), `${percent(result.taxRate)} · ${taxBasisLabel(result.taxBasis)}`],
  ] as const;

  return (
    <div className="overflow-hidden rounded-[28px] border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-canvas text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Line</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="hidden px-5 py-3 font-medium sm:table-cell">How this demo got there</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, amount, how]) => (
            <tr key={label} className="border-t border-line">
              <td className="px-5 py-3">{label}</td>
              <td className="px-5 py-3 font-mono tabular-nums">{amount}</td>
              <td className="hidden px-5 py-3 text-muted sm:table-cell">{how}</td>
            </tr>
          ))}
          <tr className="border-t border-line bg-mist">
            <td className="px-5 py-4 font-medium text-primary">Landed cost</td>
            <td className="px-5 py-4 font-mono tabular-nums text-primary">{money(result.total)}</td>
            <td className="hidden px-5 py-4 text-muted sm:table-cell">{money(result.perUnit)} per unit</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function taxBasisLabel(basis: LineResult["taxBasis"]): string {
  if (basis === "cif") return "on CIF";
  if (basis === "product") return "on product cost";
  return "on CIF + duty";
}
