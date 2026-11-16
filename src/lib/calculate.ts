import { suggestFreight } from "./freightEstimate";
import { dutyValuation, getCategory, getDestination, getOrigin, getRateRecord, tariffs } from "./rates";
import type { DestinationRecord, DutyKind, ExtraTariff, FeeLine, LineResult } from "./types";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type TaxChoice = { id: string; label: string; rate: number; name: string };

const EU_NAMES: Record<string, string> = {
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  IE: "Ireland",
  PT: "Portugal",
  AT: "Austria",
  PL: "Poland",
  SE: "Sweden",
  DK: "Denmark",
};

const CA_HST: Record<string, string> = {
  ON: "Ontario",
  NS: "Nova Scotia",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  PE: "Prince Edward Island",
};

export function taxChoices(destinationCode: string): TaxChoice[] {
  const record = tariffs.destinations[destinationCode];
  if (!record) return [];
  if (destinationCode === "CA" && record.import_taxes.GST != null) {
    const choices: TaxChoice[] = [
      { id: "GST", label: `GST ${record.import_taxes.GST}% — federal`, rate: record.import_taxes.GST / 100, name: "GST" },
    ];
    for (const [code, rate] of Object.entries(record.import_taxes.HST ?? {})) {
      choices.push({
        id: code,
        label: `HST ${rate}% — ${CA_HST[code] ?? code}`,
        rate: rate / 100,
        name: "HST",
      });
    }
    return choices;
  }
  if (destinationCode === "EU" && record.import_taxes.VAT_default != null) {
    const choices: TaxChoice[] = [
      {
        id: "default",
        label: `Typical default ${record.import_taxes.VAT_default}%`,
        rate: record.import_taxes.VAT_default / 100,
        name: "VAT",
      },
    ];
    for (const [code, rate] of Object.entries(record.import_taxes.VAT_by_country ?? {})) {
      choices.push({ id: code, label: `${EU_NAMES[code] ?? code} ${rate}%`, rate: rate / 100, name: "VAT" });
    }
    return choices;
  }
  if (destinationCode === "UK" && record.import_taxes.VAT != null) {
    return [{ id: "VAT", label: `Import VAT ${record.import_taxes.VAT}%`, rate: record.import_taxes.VAT / 100, name: "VAT" }];
  }
  return [{ id: "none", label: "No federal import VAT", rate: 0, name: "No federal import VAT" }];
}

export function defaultTaxChoice(destinationCode: string): string {
  return taxChoices(destinationCode)[0]?.id ?? "none";
}

export type DutyResolution = {
  available: boolean;
  kind: DutyKind;
  rate: number | null;
  mfnPathRate: number | null;
  program: string | null;
  notes: string[];
  extraTariffs: ExtraTariff[];
  hsCode: string | null;
  sourceUrl: string | null;
};

export function resolveDuty(categoryId: string, originCode: string, destinationCode: string, claimPreference: boolean): DutyResolution {
  const record = getRateRecord(categoryId, originCode, destinationCode);
  if (!record) {
    return {
      available: false,
      kind: "unavailable",
      rate: null,
      mfnPathRate: null,
      program: null,
      notes: ["No schedule row for this category, origin, and destination."],
      extraTariffs: [],
      hsCode: null,
      sourceUrl: null,
    };
  }
  const notes = [...(record.notes ?? [])];
  const extraTariffs = record.extra_tariffs ?? [];
  const mfnPathRate = typeof record.effective_rate_mfn_path === "number" ? record.effective_rate_mfn_path / 100 : null;
  const base = {
    mfnPathRate,
    extraTariffs,
    hsCode: record.hs_code ?? null,
    sourceUrl: record.source_url ?? record.source_url_taric ?? null,
  };

  if (record.domestic) {
    return {
      ...base,
      available: true,
      kind: "domestic",
      rate: 0,
      program: null,
      notes: notes.length ? notes : ["Same customs territory. No import duty."],
    };
  }

  const preferential = typeof record.effective_rate_preferential_path === "number" ? record.effective_rate_preferential_path / 100 : null;

  if (claimPreference && preferential != null) {
    return {
      ...base,
      available: true,
      kind: "preferential",
      rate: preferential,
      program: record.preference_scheme ?? "Preferential rate",
      notes,
    };
  }

  if (mfnPathRate != null) {
    if (claimPreference && preferential == null) {
      notes.unshift("No preferential rate is published for this lane, so this estimate uses the MFN path.");
    }
    if (!claimPreference) {
      notes.unshift("Rules-of-origin claim is off, so this estimate uses the MFN path.");
    }
    return {
      ...base,
      available: true,
      kind: "mfn",
      rate: mfnPathRate,
      program: null,
      notes,
    };
  }

  notes.unshift("Rate unavailable. The schedule does not publish a usable effective rate for this lane, and Landed does not treat a missing rate as zero.");
  return {
    ...base,
    available: false,
    kind: "unavailable",
    rate: null,
    program: record.preference_scheme ?? null,
    notes,
  };
}

function taxNoteFor(record: DestinationRecord, choice: TaxChoice): string {
  if (record.import_taxes.tax_base) return record.import_taxes.tax_base;
  if (record.import_taxes.note) return record.import_taxes.note;
  return choice.label;
}

function usFees(product: number, record: DestinationRecord): FeeLine[] {
  const lines: FeeLine[] = [];
  const mpf = record.import_taxes.fees?.MPF;
  const hmf = record.import_taxes.fees?.HMF;
  if (mpf) {
    lines.push({
      name: "Merchandise Processing Fee",
      amount: roundMoney(product * (mpf.rate_pct / 100)),
      note: mpf.note,
    });
  }
  if (hmf) {
    lines.push({
      name: "Harbor Maintenance Fee",
      amount: roundMoney(product * (hmf.rate_pct / 100)),
      note: `${hmf.note} Included here as an ocean-shipment estimate.`,
    });
  }
  return lines;
}

export type CalculateInput = {
  categoryId: string;
  originCode: string;
  destinationCode: string;
  unitCost: number;
  quantity: number;
  freightPerUnit: number;
  insuranceRate: number;
  claimPreference: boolean;
  vatChoice: string;
};

export function calculate(input: CalculateInput): LineResult {
  const category = getCategory(input.categoryId);
  const origin = getOrigin(input.originCode);
  const destination = getDestination(input.destinationCode);
  const freightSuggestion = suggestFreight(input.categoryId, input.originCode, input.destinationCode);
  const dutyQuote = resolveDuty(input.categoryId, input.originCode, input.destinationCode, input.claimPreference);
  const valuation = dutyValuation(input.destinationCode);
  const destRecord = tariffs.destinations[input.destinationCode];
  const choices = taxChoices(input.destinationCode);
  const choice = choices.find((item) => item.id === input.vatChoice) ?? choices[0];

  const product = roundMoney(input.unitCost * input.quantity);
  const freight = roundMoney(input.freightPerUnit * input.quantity);
  const insurance = roundMoney(product * input.insuranceRate);
  const freightAndInsurance = roundMoney(freight + insurance);
  const cif = roundMoney(product + freight + insurance);
  const dutyBase = valuation === "cif" ? cif : product;

  const duty = dutyQuote.available && dutyQuote.rate != null ? roundMoney(dutyBase * dutyQuote.rate) : null;

  let tax: number | null = null;
  let taxAvailable = false;
  let taxName = choice?.name ?? "Import tax";
  let taxRate: number | null = choice?.rate ?? null;
  let taxNote = destRecord ? taxNoteFor(destRecord, choice ?? { id: "", label: "", rate: 0, name: taxName }) : "";
  let feeLines: FeeLine[] = [];

  if (dutyQuote.kind === "domestic") {
    taxAvailable = true;
    tax = 0;
    taxRate = 0;
    taxName = "No import tax";
    taxNote = dutyQuote.notes[0] ?? "Not an import, so import VAT or GST is not charged.";
    feeLines = [];
  } else if (duty == null || !choice) {
    taxAvailable = false;
    tax = null;
    taxNote = "Import tax is not calculated while the duty rate is unavailable.";
  } else {
    taxAvailable = true;
    const taxBase = input.destinationCode === "CA" ? roundMoney(product + duty) : roundMoney(cif + duty);
    if (input.destinationCode === "US") {
      tax = 0;
      taxRate = 0;
      taxName = "No federal import VAT";
      taxNote = destRecord.import_taxes.note ?? taxNote;
      feeLines = usFees(product, destRecord);
    } else {
      tax = roundMoney(taxBase * choice.rate);
      if (input.destinationCode === "CA" && destRecord.import_taxes.pst_note) {
        taxNote = `${destRecord.import_taxes.tax_base ?? ""} ${destRecord.import_taxes.pst_note}`.trim();
      }
    }
  }

  const fees = roundMoney(feeLines.reduce((sum, line) => sum + line.amount, 0));
  const total =
    duty != null && tax != null ? roundMoney(product + freight + insurance + duty + tax + fees) : null;

  return {
    category,
    origin,
    destination,
    quantity: input.quantity,
    unitCost: input.unitCost,
    product,
    freightPerUnit: input.freightPerUnit,
    freight,
    insuranceRate: input.insuranceRate,
    insurance,
    freightAndInsurance,
    transitDays: freightSuggestion.transitDays,
    freightRegion: freightSuggestion.region,
    claimPreference: input.claimPreference,
    dutyAvailable: dutyQuote.available,
    duty,
    dutyRate: dutyQuote.rate,
    mfnPathRate: dutyQuote.mfnPathRate,
    dutyKind: dutyQuote.kind,
    dutyProgram: dutyQuote.program,
    dutyNotes: dutyQuote.notes,
    extraTariffs: dutyQuote.extraTariffs,
    hsCode: dutyQuote.hsCode ?? category.codes[input.destinationCode] ?? null,
    sourceUrl: dutyQuote.sourceUrl,
    dutyBasis: valuation,
    taxAvailable,
    tax,
    taxName,
    taxRate,
    taxNote,
    fees,
    feeLines,
    deMinimisNote: destRecord?.de_minimis.note ?? "",
    total,
    perUnit: total != null && input.quantity > 0 ? total / input.quantity : null,
  };
}

export type OptionInput = {
  label: string;
  origin: string;
  unitCost: string;
  freightPerUnit: string;
  freightEdited: boolean;
};

export type DemoInput = {
  categoryId: string;
  quantity: string;
  destination: string;
  claimPreference: boolean;
  insurancePercent: string;
  vatChoice: string;
  options: [OptionInput, OptionInput];
};

function starterOption(label: string, origin: string, unitCost: string, categoryId: string, destination: string): OptionInput {
  return {
    label,
    origin,
    unitCost,
    freightPerUnit: suggestFreight(categoryId, origin, destination).perUnit.toFixed(2),
    freightEdited: false,
  };
}

export const defaultDemo: DemoInput = {
  categoryId: "shirt_woven_linen",
  quantity: "200",
  destination: "CA",
  claimPreference: true,
  insurancePercent: "0.5",
  vatChoice: defaultTaxChoice("CA"),
  options: [
    starterOption("Option A", "PT", "21", "shirt_woven_linen", "CA"),
    starterOption("Option B", "VN", "18.50", "shirt_woven_linen", "CA"),
  ],
};

export function syncFreight(demo: DemoInput): DemoInput {
  const options = demo.options.map((option) => {
    if (option.freightEdited) return option;
    return {
      ...option,
      freightPerUnit: suggestFreight(demo.categoryId, option.origin, demo.destination).perUnit.toFixed(2),
    };
  }) as DemoInput["options"];
  const validChoice = taxChoices(demo.destination).some((choice) => choice.id === demo.vatChoice);
  return {
    ...demo,
    options,
    vatChoice: validChoice ? demo.vatChoice : defaultTaxChoice(demo.destination),
  };
}

export type QuoteDemo = { ok: true; a: LineResult; b: LineResult } | { ok: false; error: string };

export function quoteDemo(demo: DemoInput): QuoteDemo {
  const quantity = Number(demo.quantity);
  if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
    return { ok: false, error: "Enter a whole number of units, at least 1." };
  }
  if (quantity > 1_000_000) return { ok: false, error: "Try a quantity under 1,000,000 for this demo." };

  const insurancePercent = Number(demo.insurancePercent);
  if (!Number.isFinite(insurancePercent) || insurancePercent < 0 || insurancePercent > 100) {
    return { ok: false, error: "Enter an insurance estimate between 0 and 100%." };
  }

  const results: LineResult[] = [];
  for (const option of demo.options) {
    const unitCost = Number(option.unitCost);
    const freightPerUnit = Number(option.freightPerUnit);
    if (!Number.isFinite(unitCost) || unitCost < 0) return { ok: false, error: `Enter a unit cost for ${option.label}.` };
    if (unitCost > 100_000) return { ok: false, error: "Unit cost looks too high for this demo." };
    if (!Number.isFinite(freightPerUnit) || freightPerUnit < 0) {
      return { ok: false, error: `Enter a freight estimate for ${option.label}.` };
    }
    results.push(
      calculate({
        categoryId: demo.categoryId,
        originCode: option.origin,
        destinationCode: demo.destination,
        unitCost,
        quantity,
        freightPerUnit,
        insuranceRate: insurancePercent / 100,
        claimPreference: demo.claimPreference,
        vatChoice: demo.vatChoice,
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
  const lead = midpoint(result.transitDays);
  const peerLead = midpoint(peer.transitDays);
  if (lead + 1 < peerLead) chips.push("Shorter transit estimate");
  else if (lead > peerLead + 1) chips.push("Longer transit estimate");
  else chips.push("Similar transit estimate");

  if (result.unitCost > peer.unitCost + 0.009) chips.push("Higher unit price");
  else if (result.unitCost < peer.unitCost - 0.009) chips.push("Lower unit price");
  else chips.push("Same unit price");

  if (result.dutyKind === "unavailable") chips.push("Duty rate unavailable");
  else if (result.dutyKind === "domestic") chips.push("Domestic");
  else if (result.dutyKind === "preferential") chips.push("Preferential duty, if origin qualifies");
  else chips.push("MFN path");

  const score = reliabilityMean(result);
  const peerScore = reliabilityMean(peer);
  if (score > peerScore + 0.15) chips.push("Stronger demo reliability");
  else if (score + 0.15 < peerScore) chips.push("Fewer demo reliability signals");
  return chips;
}

