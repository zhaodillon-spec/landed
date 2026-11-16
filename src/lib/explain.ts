import { money, percent, transitLabel } from "./format";
import { AS_OF, DISCLAIMER } from "./rates";
import { reliabilityMean } from "./calculate";
import type { LineResult } from "./types";

export type ExplainContext = {
  primary: LineResult;
  secondary: LineResult | null;
  primaryLabel: string;
  secondaryLabel: string;
};

function share(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

function rateText(rate: number | null): string {
  return rate == null ? "rate unavailable" : percent(rate);
}

function dutySentence(result: LineResult): string {
  if (result.dutyKind === "unavailable" || result.dutyRate == null) {
    return `${result.origin.name} → ${result.destination.name} has no usable effective rate in the ${AS_OF} schedule. Landed leaves that duty blank instead of assuming zero. ${result.dutyNotes[0] ?? ""}`.trim();
  }
  if (result.dutyKind === "domestic") {
    return `${result.origin.name} → ${result.destination.name} is the same customs territory, so import duty is ${percent(result.dutyRate)}. ${result.dutyNotes[0] ?? ""}`.trim();
  }
  if (result.dutyKind === "preferential") {
    const mfn = result.mfnPathRate == null ? "" : ` The MFN path would be ${percent(result.mfnPathRate)}.`;
    return `${result.origin.name} → ${result.destination.name} uses ${result.dutyProgram} at ${percent(result.dutyRate)}, and only if the goods meet the rules of origin and you can prove it.${mfn}`;
  }
  return `${result.origin.name} → ${result.destination.name} is on the MFN path at ${percent(result.dutyRate)}. ${result.dutyNotes[0] ?? ""}`.trim();
}

function basisSentence(result: LineResult): string {
  if (result.dutyBasis === "cif") {
    return "Duty is calculated on a CIF stand-in: product plus your freight and insurance estimates.";
  }
  return "Duty is calculated on product cost, the FOB / transaction-value stand-in for this destination.";
}

export function greeting(ctx: ExplainContext): string {
  const result = ctx.primary;
  if (result.duty == null || result.total == null) {
    return `The duty rate for ${result.origin.name} → ${result.destination.name} is unavailable, so I can’t finish this landed cost. I won’t treat a missing rate as zero.`;
  }
  return `Duties and tariffs are ${money(result.duty)} of your ${money(result.total)} estimate, about ${share(result.duty, result.total)}%. Schedules as of ${AS_OF}. Ask me where that comes from.`;
}

export function answerQuestion(question: string, ctx: ExplainContext): string {
  const q = question.toLowerCase();
  if (/reliab|signal|trust|factory|supplier quality/.test(q)) return reliabilityAnswer(ctx);
  if (/which|cheaper|less to land|compare|option|versus|\bvs\b/.test(q)) return compareAnswer(ctx);
  if (/tax|vat|\bgst\b|de minimis|hst/.test(q)) return taxAnswer(ctx);
  if (/freight|ship|transit|lead time|insurance/.test(q)) return freightAnswer(ctx);
  if (/dut|tariff|mfn|preferen|origin/.test(q)) return dutyAnswer(ctx);
  return summaryAnswer(ctx);
}

function dutyAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  const amount =
    result.duty == null || result.total == null
      ? "I can’t quote a duty amount for this lane."
      : `Duties and tariffs are ${money(result.duty)} of your ${money(result.total)} estimate, about ${share(result.duty, result.total)}%.`;
  const extras = result.extraTariffs
    .filter((item) => item.rate)
    .map((item) => item.name)
    .slice(0, 2);
  const extraSentence = extras.length ? `Extra duties folded into the effective rate include ${extras.join("; ")}.` : "";
  const code = result.hsCode ? `Tariff line ${result.hsCode} (${result.category.label}).` : result.category.label;
  return [amount, dutySentence(result), basisSentence(result), extraSentence, code, DISCLAIMER].filter(Boolean).join(" ");
}

function taxAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  if (!result.taxAvailable || result.tax == null || result.taxRate == null) {
    return `Import tax isn’t calculated for this lane. ${result.taxNote} ${DISCLAIMER}`;
  }
  const fees = result.feeLines.length
    ? `Separate from tax, this estimate adds ${result.feeLines.map((line) => `${line.name} ${money(line.amount)}`).join(" and ")}.`
    : "";
  return [
    result.tax === 0
      ? `${result.taxName}. Nothing is added for import VAT or GST.`
      : `Import tax is ${result.taxName} at ${percent(result.taxRate)}, which comes to ${money(result.tax)}.`,
    result.taxNote,
    result.deMinimisNote ? `De minimis: ${result.deMinimisNote}` : "",
    fees,
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join(" ");
}

function freightAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  return [
    `Freight is your estimate of ${money(result.freightPerUnit)} per piece, ${money(result.freight)} on this order. Insurance is ${percent(result.insuranceRate)} of product cost, ${money(result.insurance)}.`,
    `The starter transit range for ${result.freightRegion} → ${result.destination.name} is ${transitLabel(result.transitDays)}, also an estimate, not a sailing schedule.`,
    "Neither figure comes from the tariff file. There is no researched freight source in this dataset.",
    result.dutyBasis === "cif" ? "For this destination, duty is charged on a CIF stand-in, so editing freight or insurance changes the duty as well as the shipping line." : "For this destination, duty is charged on product cost, so freight changes the landed total but not the duty.",
    DISCLAIMER,
  ].join(" ");
}

function compareAnswer(ctx: ExplainContext): string {
  if (!ctx.secondary) {
    return `This view is one order, from ${ctx.primary.origin.name}. Open the supplier comparison to put another origin next to it. ${DISCLAIMER}`;
  }
  const a = ctx.primary;
  const b = ctx.secondary;
  const aTotal = a.total;
  const bTotal = b.total;
  const aPer = a.perUnit;
  const bPer = b.perUnit;
  if (aTotal == null || bTotal == null || aPer == null || bPer == null) {
    const missing = [a, b].filter((item) => item.total == null).map((item) => item.origin.name);
    return `I can’t say which option costs less to land. The duty rate is unavailable for ${missing.join(" and ")}, and a missing rate is not zero. ${DISCLAIMER}`;
  }
  const aCheaper = aPer <= bPer;
  const cheaper = aCheaper ? a : b;
  const cheaperPer = aCheaper ? aPer : bPer;
  const otherPer = aCheaper ? bPer : aPer;
  const other = aCheaper ? b : a;
  const delta = Math.abs(aTotal - bTotal);
  return [
    `${cheaper.origin.name} lands at ${money(cheaperPer)} a unit, versus ${money(otherPer)} from ${other.origin.name}.`,
    `On the full order that’s ${money(delta)} less for ${cheaper.origin.name}, using the rates currently selected.`,
    `${cheaper.origin.name} duty is ${rateText(cheaper.dutyRate)}${cheaper.dutyProgram ? ` (${cheaper.dutyProgram}, if origin qualifies)` : ""}. ${other.origin.name} duty is ${rateText(other.dutyRate)}${other.dutyProgram ? ` (${other.dutyProgram}, if origin qualifies)` : ""}.`,
    `Transit estimates are ${transitLabel(cheaper.transitDays)} versus ${transitLabel(other.transitDays)}. Those are not from the tariff file.`,
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
    lines.push(`${ctx.secondary.origin.name} is ${reliabilityMean(ctx.secondary).toFixed(1)} / 5 on the same fictional scale.`);
  }
  lines.push(signal.note, "Price is the quote. Reliability is the rest of the decision.", DISCLAIMER);
  return lines.join(" ");
}

function summaryAnswer(ctx: ExplainContext): string {
  const result = ctx.primary;
  if (result.total == null || result.perUnit == null || result.duty == null || result.tax == null) {
    return `${result.quantity.toLocaleString("en-US")} ${result.category.exampleName} from ${result.origin.name} to ${result.destination.name} can’t be totalled because the duty rate is unavailable. ${DISCLAIMER}`;
  }
  return [
    `${result.quantity.toLocaleString("en-US")} ${result.category.exampleName} from ${result.origin.name} to ${result.destination.name} lands at ${money(result.total)}, or ${money(result.perUnit)} a unit.`,
    `That’s product ${money(result.product)}, freight and insurance ${money(result.freightAndInsurance)}, duties ${money(result.duty)}, and ${result.taxName} ${money(result.tax)}.`,
    DISCLAIMER,
  ].join(" ");
}

export const SUGGESTIONS = [
  "Why are my duties this high?",
  "Which option costs less to land?",
  "What's included in import taxes?",
  "How is freight estimated?",
];
