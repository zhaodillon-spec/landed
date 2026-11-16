import { getCategory, getDestination, getOrigin } from "./rates";
import type { Category, Destination, DutyQuote, FreightQuote, LineResult, Origin } from "./types";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function resolveDuty(category: Category, originCode: string, destinationCode: string): DutyQuote {
  const mfnRate = category.mfnByDestination[destinationCode];
  if (typeof mfnRate !== "number") {
    throw new Error(`No MFN rate for ${category.id} → ${destinationCode}`);
  }
  if (originCode === destinationCode) {
    return {
      rate: 0,
      mfnRate,
      kind: "domestic",
      program: "Domestic shipment (placeholder)",
      note: "Origin and destination match, so this demo does not apply an import duty.",
    };
  }
  const preference = category.preferentialOverrides.find(
    (row) => row.origin === originCode && row.destination === destinationCode,
  );
  if (preference) {
    return {
      rate: preference.rate,
      mfnRate,
      kind: "preferential",
      program: preference.program,
      note: preference.note,
    };
  }
  return {
    rate: mfnRate,
    mfnRate,
    kind: "mfn",
    program: null,
    note: "No preferential override is on file for this origin and destination, so the MFN placeholder applies.",
  };
}

export function resolveFreight(category: Category, origin: Origin, destinationCode: string): FreightQuote {
  const override = category.freightEstimates.originOverrides[origin.code]?.[destinationCode];
  if (override) {
    return { ...override, region: origin.region, matchedBy: "origin" };
  }
  const lane = category.freightEstimates.byOriginRegion[origin.region]?.[destinationCode];
  if (!lane) {
    throw new Error(`No freight lane for ${origin.region} → ${destinationCode}`);
  }
  return { ...lane, region: origin.region, matchedBy: "region" };
}

export type CalculateInput = {
  categoryId: string;
  originCode: string;
  destinationCode: string;
  unitCost: number;
  quantity: number;
};

export function calculate(input: CalculateInput): LineResult {
  const category = getCategory(input.categoryId);
  const origin = getOrigin(input.originCode);
  const destination = getDestination(input.destinationCode);
  return calculateResolved(category, origin, destination, input.unitCost, input.quantity);
}

function calculateResolved(
  category: Category,
  origin: Origin,
  destination: Destination,
  unitCost: number,
  quantity: number,
): LineResult {
  const freightQuote = resolveFreight(category, origin, destination.code);
  const dutyQuote = resolveDuty(category, origin.code, destination.code);
  const taxInfo = category.importTaxByDestination[destination.code];

  const product = roundMoney(unitCost * quantity);
  const freight = roundMoney(freightQuote.perUnitUsd * quantity);
  const insurance = roundMoney(product * category.freightEstimates.insuranceRateOfProduct);
  const freightAndInsurance = roundMoney(freight + insurance);

  const dutyBase = category.dutyBasis === "cif" ? roundMoney(product + freight + insurance) : product;
  const duty = roundMoney(dutyBase * dutyQuote.rate);

  let taxBase = product;
  if (taxInfo.basis === "cif_plus_duty") taxBase = roundMoney(product + freight + insurance + duty);
  if (taxInfo.basis === "cif") taxBase = roundMoney(product + freight + insurance);
  const tax = roundMoney(taxBase * taxInfo.rate);

  const total = roundMoney(product + freight + insurance + duty + tax);
  const perUnit = quantity > 0 ? total / quantity : 0;

  return {
    category,
    origin,
    destination,
    quantity,
    unitCost,
    product,
    freight,
    insurance,
    freightAndInsurance,
    duty,
    dutyRate: dutyQuote.rate,
    mfnRate: dutyQuote.mfnRate,
    dutyKind: dutyQuote.kind,
    dutyProgram: dutyQuote.program,
    dutyNote: dutyQuote.note,
    dutyBasis: category.dutyBasis,
    tax,
    taxName: taxInfo.name,
    taxRate: taxInfo.rate,
    taxBasis: taxInfo.basis,
    taxNote: taxInfo.note,
    total,
    perUnit,
    freightQuote,
  };
}

export type OptionInput = {
  label: string;
  origin: string;
  unitCost: string;
};

export type DemoInput = {
  categoryId: string;
  quantity: string;
  destination: string;
  options: [OptionInput, OptionInput];
};

export const defaultDemo: DemoInput = {
  categoryId: "woven-shirts",
  quantity: "200",
  destination: "CA",
  options: [
    { label: "Option A", origin: "PT", unitCost: "21" },
    { label: "Option B", origin: "VN", unitCost: "18.50" },
  ],
};

export type QuoteDemo = { ok: true; a: LineResult; b: LineResult } | { ok: false; error: string };

export function quoteDemo(demo: DemoInput): QuoteDemo {
  const quantity = Number(demo.quantity);
  if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
    return { ok: false, error: "Enter a whole number of units, at least 1." };
  }
  if (quantity > 1_000_000) {
    return { ok: false, error: "Try a quantity under 1,000,000 for this demo." };
  }

  const results: LineResult[] = [];
  for (const option of demo.options) {
    const unitCost = Number(option.unitCost);
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      return { ok: false, error: `Enter a unit cost for ${option.label}.` };
    }
    if (unitCost > 100_000) {
      return { ok: false, error: "Unit cost looks too high for this demo." };
    }
    results.push(
      calculate({
        categoryId: demo.categoryId,
        originCode: option.origin,
        destinationCode: demo.destination,
        unitCost,
        quantity,
      }),
    );
  }

  return { ok: true, a: results[0], b: results[1] };
}

export function orderTitle(result: LineResult): string {
  const name = result.quantity === 1 ? result.category.exampleName.replace(/s$/, "") : result.category.exampleName;
  return `${result.quantity.toLocaleString("en-US")} ${name}`;
}

export function reliabilityMean(result: LineResult): number {
  const signal = result.origin.demoReliability;
  return (signal.onTime + signal.communication + signal.qualityConsistency + signal.complianceDocs + signal.sampling) / 5;
}

export function optionChips(result: LineResult, peer: LineResult): string[] {
  const chips: string[] = [];
  const midpoint = (days: readonly [number, number]) => (days[0] + days[1]) / 2;
  const lead = midpoint(result.freightQuote.transitDays);
  const peerLead = midpoint(peer.freightQuote.transitDays);
  if (lead + 1 < peerLead) chips.push("Shorter lead time");
  else if (lead > peerLead + 1) chips.push("Longer transit");
  else chips.push("Similar transit");

  if (result.unitCost > peer.unitCost + 0.009) chips.push("Higher unit price");
  else if (result.unitCost < peer.unitCost - 0.009) chips.push("Lower unit price");
  else chips.push("Same unit price");

  if (result.dutyKind === "preferential") chips.push("Preferential duty on file");
  else if (result.dutyKind === "domestic") chips.push("Treated as domestic");
  else chips.push("MFN duty");

  const score = reliabilityMean(result);
  const peerScore = reliabilityMean(peer);
  if (score > peerScore + 0.15) chips.push("Stronger demo reliability");
  else if (score + 0.15 < peerScore) chips.push("Fewer demo reliability signals");

  return chips;
}
