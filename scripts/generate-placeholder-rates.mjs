/**
 * Generates src/data/rates.json with PLACEHOLDER duty, tax, and freight figures.
 *
 * This is the starter data set only. Once researched tariff data replaces it,
 * do not run this script — it overwrites the file.
 *
 *   node scripts/generate-placeholder-rates.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const destinations = [
  { code: "CA", name: "Canada", aliases: ["CAN"] },
  { code: "US", name: "United States", aliases: ["USA", "America", "United States of America"] },
  { code: "GB", name: "United Kingdom", aliases: ["UK", "Britain", "Great Britain", "England"] },
  { code: "EU", name: "European Union", aliases: ["Europe", "EU27"] },
];

const origins = [
  ["CN", "China", "East Asia", ["PRC", "Mainland China"]],
  ["HK", "Hong Kong", "East Asia", []],
  ["JP", "Japan", "East Asia", []],
  ["KR", "South Korea", "East Asia", ["Korea", "Republic of Korea"]],
  ["TW", "Taiwan", "East Asia", []],
  ["VN", "Vietnam", "Southeast Asia", ["Viet Nam"]],
  ["KH", "Cambodia", "Southeast Asia", ["Kampuchea"]],
  ["ID", "Indonesia", "Southeast Asia", []],
  ["TH", "Thailand", "Southeast Asia", []],
  ["MY", "Malaysia", "Southeast Asia", []],
  ["PH", "Philippines", "Southeast Asia", []],
  ["MM", "Myanmar", "Southeast Asia", ["Burma"]],
  ["LA", "Laos", "Southeast Asia", ["Lao"]],
  ["IN", "India", "South Asia", []],
  ["BD", "Bangladesh", "South Asia", []],
  ["PK", "Pakistan", "South Asia", []],
  ["LK", "Sri Lanka", "South Asia", ["Ceylon"]],
  ["NP", "Nepal", "South Asia", []],
  ["UZ", "Uzbekistan", "Central Asia", []],
  ["PT", "Portugal", "Southern Europe", []],
  ["IT", "Italy", "Southern Europe", []],
  ["ES", "Spain", "Southern Europe", []],
  ["GR", "Greece", "Southern Europe", []],
  ["FR", "France", "Western Europe", []],
  ["DE", "Germany", "Western Europe", ["Deutschland"]],
  ["NL", "Netherlands", "Western Europe", ["Holland"]],
  ["BE", "Belgium", "Western Europe", []],
  ["AT", "Austria", "Western Europe", []],
  ["CH", "Switzerland", "Western Europe", []],
  ["IE", "Ireland", "Western Europe", ["Republic of Ireland"]],
  ["LU", "Luxembourg", "Western Europe", []],
  ["GB", "United Kingdom", "Northern Europe", ["UK", "Britain"]],
  ["SE", "Sweden", "Northern Europe", []],
  ["DK", "Denmark", "Northern Europe", []],
  ["FI", "Finland", "Northern Europe", []],
  ["EE", "Estonia", "Northern Europe", []],
  ["LV", "Latvia", "Northern Europe", []],
  ["LT", "Lithuania", "Eastern Europe", []],
  ["PL", "Poland", "Eastern Europe", []],
  ["RO", "Romania", "Eastern Europe", []],
  ["BG", "Bulgaria", "Eastern Europe", []],
  ["CZ", "Czechia", "Eastern Europe", ["Czech Republic"]],
  ["HU", "Hungary", "Eastern Europe", []],
  ["SK", "Slovakia", "Eastern Europe", []],
  ["HR", "Croatia", "Eastern Europe", []],
  ["SI", "Slovenia", "Eastern Europe", []],
  ["RS", "Serbia", "Eastern Europe", []],
  ["AL", "Albania", "Eastern Europe", []],
  ["MK", "North Macedonia", "Eastern Europe", ["Macedonia"]],
  ["TR", "Turkey", "West Asia", ["Türkiye", "Turkiye"]],
  ["JO", "Jordan", "West Asia", []],
  ["AE", "United Arab Emirates", "West Asia", ["UAE", "Dubai"]],
  ["MA", "Morocco", "North Africa", []],
  ["TN", "Tunisia", "North Africa", []],
  ["EG", "Egypt", "North Africa", []],
  ["MG", "Madagascar", "Sub-Saharan Africa", []],
  ["ET", "Ethiopia", "Sub-Saharan Africa", []],
  ["KE", "Kenya", "Sub-Saharan Africa", []],
  ["MU", "Mauritius", "Sub-Saharan Africa", []],
  ["LS", "Lesotho", "Sub-Saharan Africa", []],
  ["ZA", "South Africa", "Sub-Saharan Africa", []],
  ["MX", "Mexico", "Central America", ["México"]],
  ["GT", "Guatemala", "Central America", []],
  ["HN", "Honduras", "Central America", []],
  ["SV", "El Salvador", "Central America", []],
  ["NI", "Nicaragua", "Central America", []],
  ["DO", "Dominican Republic", "Caribbean", []],
  ["HT", "Haiti", "Caribbean", []],
  ["PE", "Peru", "South America", []],
  ["CO", "Colombia", "South America", []],
  ["BR", "Brazil", "South America", ["Brasil"]],
  ["US", "United States", "North America", ["USA", "America"]],
  ["CA", "Canada", "North America", ["CAN"]],
  ["AU", "Australia", "Oceania", []],
];

const tunedReliability = {
  PT: { onTime: 5, communication: 5, qualityConsistency: 4, complianceDocs: 4, sampling: 5 },
  IT: { onTime: 4, communication: 4, qualityConsistency: 5, complianceDocs: 4, sampling: 4 },
  VN: { onTime: 4, communication: 3, qualityConsistency: 4, complianceDocs: 3, sampling: 4 },
  CN: { onTime: 4, communication: 4, qualityConsistency: 4, complianceDocs: 3, sampling: 4 },
  BD: { onTime: 3, communication: 3, qualityConsistency: 3, complianceDocs: 3, sampling: 4 },
  TR: { onTime: 4, communication: 4, qualityConsistency: 4, complianceDocs: 4, sampling: 4 },
  IN: { onTime: 3, communication: 4, qualityConsistency: 3, complianceDocs: 3, sampling: 4 },
  MX: { onTime: 4, communication: 4, qualityConsistency: 3, complianceDocs: 4, sampling: 3 },
};

function hash(value) {
  let h = 2166136261;
  for (const char of value) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function demoScore(code, salt) {
  return 3 + (hash(`${code}:${salt}`) % 3);
}

const freightBase = {
  "East Asia": { CA: [3.4, [30, 42]], US: [3.1, [28, 40]], GB: [3.6, [32, 46]], EU: [3.5, [30, 44]] },
  "Southeast Asia": { CA: [3.55, [32, 48]], US: [3.25, [30, 45]], GB: [3.7, [34, 48]], EU: [3.55, [32, 46]] },
  "South Asia": { CA: [3.7, [30, 44]], US: [3.4, [28, 42]], GB: [3.5, [26, 38]], EU: [3.4, [24, 36]] },
  "Central Asia": { CA: [4.1, [34, 50]], US: [3.9, [32, 48]], GB: [3.8, [28, 42]], EU: [3.6, [26, 40]] },
  "Southern Europe": { CA: [2.7, [16, 28]], US: [2.9, [18, 30]], GB: [1.8, [8, 16]], EU: [1.4, [4, 10]] },
  "Western Europe": { CA: [2.8, [16, 28]], US: [3.0, [18, 30]], GB: [1.6, [6, 14]], EU: [1.2, [3, 8]] },
  "Northern Europe": { CA: [3.0, [18, 30]], US: [3.1, [18, 32]], GB: [1.7, [6, 12]], EU: [1.5, [4, 10]] },
  "Eastern Europe": { CA: [3.0, [20, 32]], US: [3.1, [20, 34]], GB: [1.9, [10, 18]], EU: [1.3, [5, 12]] },
  "West Asia": { CA: [3.5, [24, 36]], US: [3.4, [22, 36]], GB: [2.6, [14, 24]], EU: [2.4, [12, 22]] },
  "North Africa": { CA: [3.2, [22, 34]], US: [3.3, [20, 34]], GB: [2.2, [10, 18]], EU: [1.9, [8, 16]] },
  "Sub-Saharan Africa": { CA: [4.2, [28, 42]], US: [4.0, [26, 40]], GB: [3.4, [18, 30]], EU: [3.2, [16, 28]] },
  "North America": { CA: [1.4, [4, 10]], US: [1.1, [3, 8]], GB: [2.8, [14, 24]], EU: [2.9, [14, 24]] },
  "Central America": { CA: [2.4, [12, 22]], US: [1.6, [6, 14]], GB: [3.3, [18, 30]], EU: [3.4, [18, 32]] },
  Caribbean: { CA: [2.6, [14, 24]], US: [1.9, [8, 16]], GB: [3.2, [16, 28]], EU: [3.3, [18, 30]] },
  "South America": { CA: [3.1, [20, 32]], US: [2.7, [16, 28]], GB: [3.8, [22, 36]], EU: [3.7, [22, 36]] },
  Oceania: { CA: [3.8, [24, 38]], US: [3.9, [22, 36]], GB: [4.4, [28, 42]], EU: [4.5, [28, 44]] },
};

const categories = [
  {
    id: "woven-shirts",
    hsCode: "6205",
    name: "Woven shirts",
    exampleName: "linen shirts",
    summary: "Button-front and linen shirts.",
    mfnByDestination: { CA: 0.17, US: 0.2, GB: 0.12, EU: 0.12 },
    freightScale: 1,
    insuranceRateOfProduct: 0.005,
  },
  {
    id: "knit-tees",
    hsCode: "6109",
    name: "Knit t-shirts",
    exampleName: "jersey tees",
    summary: "Knit tees and tanks.",
    mfnByDestination: { CA: 0.18, US: 0.16, GB: 0.12, EU: 0.12 },
    freightScale: 0.82,
    insuranceRateOfProduct: 0.005,
  },
  {
    id: "denim",
    hsCode: "6203.42",
    name: "Denim trousers",
    exampleName: "jeans",
    summary: "Denim jeans and jean jackets cut as trousers.",
    mfnByDestination: { CA: 0.18, US: 0.18, GB: 0.12, EU: 0.12 },
    freightScale: 1.22,
    insuranceRateOfProduct: 0.005,
  },
  {
    id: "knit-sweaters",
    hsCode: "6110",
    name: "Knit sweaters",
    exampleName: "sweaters",
    summary: "Sweaters, cardigans, and similar knit layers.",
    mfnByDestination: { CA: 0.18, US: 0.16, GB: 0.12, EU: 0.12 },
    freightScale: 1.28,
    insuranceRateOfProduct: 0.006,
  },
  {
    id: "dresses",
    hsCode: "6204",
    name: "Dresses",
    exampleName: "dresses",
    summary: "Woven dresses and dress-weight separates grouped for the demo.",
    mfnByDestination: { CA: 0.16, US: 0.16, GB: 0.12, EU: 0.12 },
    freightScale: 1.05,
    insuranceRateOfProduct: 0.005,
  },
  {
    id: "woven-trousers",
    hsCode: "6203",
    name: "Woven trousers",
    exampleName: "trousers",
    summary: "Tailored and casual woven trousers.",
    mfnByDestination: { CA: 0.17, US: 0.18, GB: 0.12, EU: 0.12 },
    freightScale: 1.1,
    insuranceRateOfProduct: 0.005,
  },
  {
    id: "outerwear",
    hsCode: "6201",
    name: "Coats and jackets",
    exampleName: "jackets",
    summary: "Coats, blazers, and heavier jackets.",
    mfnByDestination: { CA: 0.18, US: 0.22, GB: 0.12, EU: 0.12 },
    freightScale: 1.85,
    insuranceRateOfProduct: 0.008,
  },
  {
    id: "underwear",
    hsCode: "6108",
    name: "Underwear and sleepwear",
    exampleName: "underwear sets",
    summary: "Underwear, lingerie, and sleep sets.",
    mfnByDestination: { CA: 0.18, US: 0.14, GB: 0.12, EU: 0.12 },
    freightScale: 0.55,
    insuranceRateOfProduct: 0.004,
  },
];

const euOrigins = new Set([
  "AT", "BE", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);
const gspOrigins = ["BD", "KH", "LK", "ET", "MG", "LS"];
const cptppToCanada = ["VN", "JP", "AU"];

function halfRate(mfn) {
  return Math.round((mfn * 100) / 2) / 100;
}

function moneyPerUnit(base, scale) {
  return Math.round(base * scale * 100) / 100;
}

function buildFreight(scale) {
  const byOriginRegion = {};
  for (const [region, lanes] of Object.entries(freightBase)) {
    byOriginRegion[region] = {};
    for (const [dest, [perUnit, transitDays]] of Object.entries(lanes)) {
      byOriginRegion[region][dest] = {
        perUnitUsd: moneyPerUnit(perUnit, scale),
        transitDays,
      };
    }
  }
  return byOriginRegion;
}

function buildOverrides(mfnByDestination) {
  const rows = [];
  const push = (origin, destination, rate, program) => {
    rows.push({
      origin,
      destination,
      rate,
      program,
      note: "PLACEHOLDER preference. Not an official agreement rate or a rules-of-origin determination.",
    });
  };

  for (const origin of euOrigins) {
    push(origin, "EU", 0, "Intra-EU (placeholder)");
  }
  for (const origin of gspOrigins) {
    push(origin, "EU", 0, "GSP-style (placeholder)");
    push(origin, "GB", 0, "DCTS-style (placeholder)");
  }
  for (const origin of cptppToCanada) {
    push(origin, "CA", halfRate(mfnByDestination.CA), "CPTPP-style (placeholder)");
  }
  push("VN", "EU", halfRate(mfnByDestination.EU), "EVFTA-style (placeholder)");
  for (const origin of ["MX"]) {
    push(origin, "US", 0, "USMCA-style (placeholder)");
    push(origin, "CA", 0, "USMCA-style (placeholder)");
  }
  push("US", "CA", 0, "USMCA-style (placeholder)");
  push("CA", "US", 0, "USMCA-style (placeholder)");
  return rows;
}

const importTaxByDestination = {
  CA: {
    name: "GST",
    rate: 0.05,
    basis: "cif_plus_duty",
    note: "PLACEHOLDER. Federal GST only. Provincial sales taxes are not included.",
  },
  US: {
    name: "No federal import VAT",
    rate: 0,
    basis: "cif_plus_duty",
    note: "PLACEHOLDER. This file does not model US merchandise processing fees, harbor fees, or state sales tax.",
  },
  GB: {
    name: "VAT",
    rate: 0.2,
    basis: "cif_plus_duty",
    note: "PLACEHOLDER. A flat VAT figure for the demo, not a ruling on the import VAT base.",
  },
  EU: {
    name: "VAT (indicative blend)",
    rate: 0.21,
    basis: "cif_plus_duty",
    note: "PLACEHOLDER. EU VAT differs by member state. 21% is a round demo blend, not a country rate.",
  },
};

const file = {
  meta: {
    schemaVersion: 1,
    dataStatus: "placeholder",
    currency: "USD",
    disclaimer:
      "Every duty, tax, preference, and freight figure in this file is a placeholder estimate for product design. It is not a customs tariff, not a carrier quote, and not legal or brokerage advice.",
    dutyBasis:
      "fob_product — duty is the rate times product cost (unit cost × quantity), unless a category sets dutyBasis to cif.",
    taxBasis:
      "Each destination tax object has a basis: cif_plus_duty (product + freight + insurance + duty), cif, or product.",
    freightBasis:
      "byOriginRegion[region][destination].perUnitUsd is placeholder ocean freight per piece for that category, already scaled. originOverrides may replace a region lane. Insurance is insuranceRateOfProduct × product cost.",
    howToReplace:
      "Drop researched numbers into this file without changing the keys. Update meta.dataStatus (for example to \"researched\"), meta.disclaimer, and meta.asOf. Add preferentialOverrides rows for origin/destination pairs that should not use MFN. Leave a pair out of preferentialOverrides to keep MFN. The app reads this file only — there is no second rate table in code.",
    asOf: null,
    generatedBy: "scripts/generate-placeholder-rates.mjs",
  },
  destinations,
  origins: origins.map(([code, name, region, aliases]) => ({
    code,
    name,
    region,
    aliases,
    demoReliability: {
      placeholder: true,
      note: "Fictional demo profile so the reliability panel has signals to weigh. Not an assessment of real factories or of this country.",
      ...(tunedReliability[code] ?? {
        onTime: demoScore(code, "onTime"),
        communication: demoScore(code, "communication"),
        qualityConsistency: demoScore(code, "quality"),
        complianceDocs: demoScore(code, "docs"),
        sampling: demoScore(code, "sampling"),
      }),
    },
  })),
  categories: categories.map((category) => ({
    id: category.id,
    hsCode: category.hsCode,
    hsNote: "Illustrative heading for organizing this file. Not a classification opinion.",
    name: category.name,
    exampleName: category.exampleName,
    summary: category.summary,
    dutyBasis: "fob_product",
    mfnByDestination: category.mfnByDestination,
    preferentialOverrides: buildOverrides(category.mfnByDestination),
    importTaxByDestination,
    freightEstimates: {
      insuranceRateOfProduct: category.insuranceRateOfProduct,
      note: "PLACEHOLDER ocean-freight estimates per piece. Not a forwarder quote. Transit days are a demo range.",
      byOriginRegion: buildFreight(category.freightScale),
      originOverrides: {},
    },
  })),
};

if (file.origins.length < 50) {
  throw new Error(`Expected at least 50 origins, got ${file.origins.length}`);
}

const missingRegions = new Set(file.origins.map((origin) => origin.region));
for (const region of Object.keys(freightBase)) missingRegions.delete(region);
if (missingRegions.size) {
  throw new Error(`Origins use regions with no freight lane: ${[...missingRegions].join(", ")}`);
}

const out = join(root, "src/data/rates.json");
writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);
console.log(`Wrote ${file.origins.length} origins and ${file.categories.length} categories to ${out}`);
