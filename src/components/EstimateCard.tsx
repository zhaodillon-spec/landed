import { money, percent, RATE_UNAVAILABLE } from "../lib/format";
import type { LineResult } from "../lib/types";

type Segment = {
  key: string;
  label: string;
  amount: number | null;
  swatch: string;
  unavailable?: boolean;
};

function segmentsFor(result: LineResult): Segment[] {
  const segments: Segment[] = [
    { key: "product", label: "Product cost", amount: result.product, swatch: "bg-ink" },
    { key: "freight", label: "Freight & insurance", amount: result.freightAndInsurance, swatch: "bg-freight" },
    {
      key: "duty",
      label: "Duties & tariffs",
      amount: result.duty,
      swatch: "bg-primary",
      unavailable: !result.dutyAvailable,
    },
    {
      key: "tax",
      label: result.taxName,
      amount: result.tax,
      swatch: "bg-tax",
      unavailable: !result.taxAvailable,
    },
  ];
  if (result.fees > 0) {
    segments.push({ key: "fees", label: "Import fees", amount: result.fees, swatch: "bg-ink/40" });
  }
  return segments;
}

export function EstimateCard({ result, title }: { result: LineResult; title: string }) {
  const segments = segmentsFor(result);
  const barTotal = result.total && result.total > 0 ? result.total : 0;
  return (
    <div className="rounded-[28px] border border-line bg-white p-7 shadow-card">
      <p className="mono-label">Landed cost estimate</p>
      <p className="mt-2 font-heading text-[28px] leading-tight">{title}</p>
      {barTotal > 0 && (
        <div className="mt-6 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {segments.map((segment) =>
            segment.amount != null && segment.amount > 0 ? (
              <span key={segment.key} className={segment.swatch} style={{ width: `${(segment.amount / barTotal) * 100}%` }} />
            ) : null,
          )}
        </div>
      )}
      <dl className="mt-5 divide-y divide-line text-[15px]">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-2.5 text-muted">
              <span className={`h-2 w-2 rounded-full ${segment.swatch}`} />
              {segment.label}
            </dt>
            <dd className="font-mono text-sm tabular-nums">
              {segment.unavailable ? RATE_UNAVAILABLE : money(segment.amount ?? 0)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-end justify-between gap-4 rounded-[20px] bg-mist px-5 py-5">
        <div>
          <p className="mono-label text-primary">Landed cost</p>
          <p className="mt-1.5 font-heading text-4xl leading-none text-primary sm:text-5xl">
            {result.total == null ? "Incomplete" : money(result.total)}
          </p>
        </div>
        <p className="max-w-[9rem] pb-1 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          {pathLabel(result)}
        </p>
      </div>
      <p className="mt-4 text-sm text-muted">{dutyCaption(result)}</p>
    </div>
  );
}

function pathLabel(result: LineResult): string {
  if (result.dutyKind === "unavailable") return "Rate unavailable";
  if (result.dutyKind === "domestic") return "Domestic";
  if (result.dutyKind === "preferential") return "Preferential, if origin qualifies";
  return "MFN path";
}

function dutyCaption(result: LineResult): string {
  if (result.dutyKind === "unavailable") return result.dutyNotes[0] ?? RATE_UNAVAILABLE;
  if (result.dutyKind === "domestic") return result.dutyNotes[0] ?? "Domestic movement, no import duty.";
  if (result.dutyKind === "preferential" && result.dutyRate != null) {
    const mfn = result.mfnPathRate == null ? "" : ` MFN path ${percent(result.mfnPathRate)}.`;
    return `${result.dutyProgram} ${percent(result.dutyRate)}. Rules of origin required.${mfn}`;
  }
  if (result.dutyRate == null) return RATE_UNAVAILABLE;
  return `MFN path ${percent(result.dutyRate)}. ${result.taxName}${result.taxRate != null ? ` ${percent(result.taxRate)}` : ""}`;
}

export function EstimateDetail({ result }: { result: LineResult }) {
  const rows: Array<[string, string, string]> = [
    ["Product", money(result.product), `${money(result.unitCost)} × ${result.quantity.toLocaleString("en-US")}`],
    [
      "Freight estimate",
      money(result.freight),
      `${money(result.freightPerUnit)} × ${result.quantity.toLocaleString("en-US")} · your estimate, ${result.freightRegion}`,
    ],
    ["Insurance estimate", money(result.insurance), `${percent(result.insuranceRate)} of product · your estimate`],
    [
      "Duties & tariffs",
      result.duty == null ? RATE_UNAVAILABLE : money(result.duty),
      dutyHow(result),
    ],
    [
      result.taxName,
      result.tax == null ? RATE_UNAVAILABLE : money(result.tax),
      result.taxRate == null ? result.taxNote : `${percent(result.taxRate)} · ${result.taxNote}`,
    ],
  ];
  for (const fee of result.feeLines) {
    rows.push([fee.name, money(fee.amount), fee.note]);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Line</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">How this estimate got there</th>
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
              <td className="px-5 py-4 font-mono tabular-nums text-primary">{result.total == null ? "Incomplete" : money(result.total)}</td>
              <td className="hidden px-5 py-4 text-muted sm:table-cell">
                {result.perUnit == null ? "Duty rate unavailable, so the total is incomplete." : `${money(result.perUnit)} per unit`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {result.deMinimisNote && (
        <p className="rounded-2xl border border-line px-4 py-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-ink">De minimis. </span>
          {result.deMinimisNote}
        </p>
      )}
    </div>
  );
}

function dutyHow(result: LineResult): string {
  if (!result.dutyAvailable || result.dutyRate == null) return result.dutyNotes[0] ?? RATE_UNAVAILABLE;
  const basis = result.dutyBasis === "cif" ? "CIF stand-in" : "product cost";
  const program = result.dutyProgram ? ` · ${result.dutyProgram}` : "";
  const extras = result.extraTariffs
    .filter((item) => item.rate)
    .map((item) => item.name)
    .join("; ");
  return `${percent(result.dutyRate)} of ${basis}${program}${result.hsCode ? ` · ${result.hsCode}` : ""}${extras ? ` · ${extras}` : ""}`;
}
