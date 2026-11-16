import { money, percent, transitLabel } from "./format";
import { reliabilityMean } from "./calculate";
import type { LineResult } from "./types";

export type ExplainContext = {
  primary: LineResult;
  secondary: LineResult | null;
  primaryLabel: string;
  secondaryLabel: string;
};

const DISCLAIMER = "These figures are placeholder estimates, not a customs ruling.";

function share(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

function dutySentence(result: LineResult): string {
  const rate = percent(result.dutyRate);
  if (result.dutyKind === "preferential") {
    return `${result.origin.name} → ${result.destination.name} uses a preferential override on file: ${result.dutyProgram} at ${rate}, instead of the MFN placeholder of ${percent(result.mfnRate)}.`;
  }
  if (result.dutyKind === "domestic") {
    return `Origin and destination are the same, so this demo treats it as a domestic shipment and sets duty to ${rate}.`;
  }
  return `No preferential override is on file for ${result.origin.name} → ${result.destination.name}, so the MFN placeholder of ${rate} applies.`;
}

function basisSentence(result: LineResult): string {
  if (result.dutyBasis === "cif") {
    return "Duty is calculated on the CIF value (product + freight + insurance).";
  }
  return "Duty is calculated on product cost only. That is this file's placeholder stand-in for customs value.";
}

function taxBaseSentence(result: LineResult): string {
  if (result.taxBasis === "cif") return "The tax base in this file is CIF: product + freight + insurance.";
  if (result.taxBasis === "product") return "The tax base in this file is product cost only.";
  return "The tax base in this file is CIF plus duty: product + freight + insurance + duty.";
}

export function answerQuestion(question: string, ctx: ExplainContext): string {
  const q = question.toLowerCase();
  if (/reliab|signal|trust|factory|supplier quality/.test(q)) return reliabilityAnswer(ctx);
  if (/which|cheaper|less to land|compare|option|versus|\bvs\b/.test(q)) return compareAnswer(ctx);
  if (/tax|vat|\bgst\b/.test(q)) return taxAnswer(ctx);
  if (/freight|ship|transit|lead time|insurance/.test(q)) return freightAnswer(ctx);
  if (/dut|tariff|mfn|preferen/.test(q)) return dutyAnswer(ctx);
  return summaryAnswer(ctx);
}

function dutyAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  return [
    `Duties and tariffs are ${money(result.duty)} of your ${money(result.total)} estimate, about ${share(result.duty, result.total)}%.`,
    dutySentence(result),
    basisSentence(result),
    `The row is grouped under illustrative heading ${result.category.hsCode} (${result.category.name}). ${result.category.hsNote}`,
    DISCLAIMER,
  ].join(" ");
}

function taxAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  return [
    `Import tax on this estimate is ${result.taxName} at ${percent(result.taxRate)}, which comes to ${money(result.tax)}.`,
    taxBaseSentence(result),
    result.taxNote,
    "Brokerage, merchandise processing fees, and provincial or state sales taxes are not in the rate file.",
    DISCLAIMER,
  ].join(" ");
}

function freightAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  const lane = result.freightQuote;
  const match =
    lane.matchedBy === "origin"
      ? `an origin-specific override for ${result.origin.name}`
      : `the ${lane.region} region lane`;
  return [
    `Freight is ${money(result.freight)} (${money(lane.perUnitUsd)} per piece × ${result.quantity.toLocaleString("en-US")}), from ${match} into ${result.destination.name}.`,
    `Insurance is ${percent(result.category.freightEstimates.insuranceRateOfProduct)} of product cost, ${money(result.insurance)}. Together that's ${money(result.freightAndInsurance)}.`,
    `The placeholder transit range is ${transitLabel(lane.transitDays)}.`,
    result.category.freightEstimates.note,
    DISCLAIMER,
  ].join(" ");
}

function compareAnswer(ctx: ExplainContext): string {
  if (!ctx.secondary) {
    return `This view is one order, from ${ctx.primary.origin.name}. Open the supplier comparison to put another origin next to it. ${DISCLAIMER}`;
  }
  const a = ctx.primary;
  const b = ctx.secondary;
  const aCheaper = a.perUnit <= b.perUnit;
  const cheaper = aCheaper ? a : b;
  const other = aCheaper ? b : a;
  const cheaperLabel = aCheaper ? ctx.primaryLabel : ctx.secondaryLabel;
  const otherLabel = aCheaper ? ctx.secondaryLabel : ctx.primaryLabel;
  const delta = Math.abs(a.total - b.total);
  const cheaperLead = cheaper.freightQuote.transitDays;
  const otherLead = other.freightQuote.transitDays;
  const cheaperScore = reliabilityMean(cheaper).toFixed(1);
  const otherScore = reliabilityMean(other).toFixed(1);

  return [
    `${cheaper.origin.name} (${cheaperLabel}) lands at ${money(cheaper.perUnit)} a unit, versus ${money(other.perUnit)} from ${other.origin.name} (${otherLabel}).`,
    `On the full order that's ${money(delta)} less for ${cheaper.origin.name}.`,
    `${cheaper.origin.name} duty is ${percent(cheaper.dutyRate)}${cheaper.dutyProgram ? ` (${cheaper.dutyProgram})` : " (MFN placeholder)"}; ${other.origin.name} duty is ${percent(other.dutyRate)}${other.dutyProgram ? ` (${other.dutyProgram})` : " (MFN placeholder)"}.`,
    `Transit on file is ${transitLabel(cheaperLead)} versus ${transitLabel(otherLead)}.`,
    `Demo reliability profiles — fictional, not factory audits — score ${cheaperScore} / 5 for ${cheaper.origin.name} and ${otherScore} / 5 for ${other.origin.name}.`,
    "A lower landed cost is one input. Lead time and whether you trust the supplier still sit beside it.",
    DISCLAIMER,
  ].join(" ");
}

function reliabilityAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  const signal = result.origin.demoReliability;
  const lines = [
    `${result.origin.name}'s demo profile is ${reliabilityMean(result).toFixed(1)} / 5 across on-time history (${signal.onTime}), communication (${signal.communication}), quality consistency (${signal.qualityConsistency}), compliance paperwork (${signal.complianceDocs}), and sampling (${signal.sampling}).`,
  ];
  if (ctx.secondary) {
    const other = ctx.secondary;
    lines.push(
      `${other.origin.name} (${ctx.secondaryLabel}) is ${reliabilityMean(other).toFixed(1)} / 5 on the same fictional scale.`,
    );
  }
  lines.push(signal.note, "Price is the quote. Reliability is the rest of the decision.", DISCLAIMER);
  return lines.join(" ");
}

function summaryAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  return [
    `${orderLabel(result)} from ${result.origin.name} to ${result.destination.name} lands at ${money(result.total)}, or ${money(result.perUnit)} a unit.`,
    `That's product ${money(result.product)}, freight and insurance ${money(result.freightAndInsurance)}, duties ${money(result.duty)}, and ${result.taxName} ${money(result.tax)}.`,
    "Ask me why the duty looks high, what the tax includes, or which option costs less to land.",
    DISCLAIMER,
  ].join(" ");
}

function orderLabel(result: LineResult): string {
  return `${result.quantity.toLocaleString("en-US")} ${result.category.exampleName}`;
}

export function greeting(ctx: ExplainContext): string {
  const result = ctx.primary;
  const dutyShare = share(result.duty, result.total);
  return `Duties and tariffs are ${money(result.duty)} of your ${money(result.total)} estimate, about ${dutyShare}%. Ask me where that comes from.`;
}

export const SUGGESTIONS = [
  "Why are my duties this high?",
  "Which option costs less to land?",
  "What's included in import taxes?",
  "How is freight estimated?",
];
