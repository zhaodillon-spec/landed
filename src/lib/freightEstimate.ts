const REGIONS: Record<string, string> = {
  PT: "Southern Europe",
  IT: "Southern Europe",
  ES: "Southern Europe",
  GR: "Southern Europe",
  FR: "Western Europe",
  DE: "Western Europe",
  NL: "Western Europe",
  BE: "Western Europe",
  CH: "Western Europe",
  RO: "Eastern Europe",
  BG: "Eastern Europe",
  PL: "Eastern Europe",
  UA: "Eastern Europe",
  GB: "Northern Europe",
  VN: "Southeast Asia",
  KH: "Southeast Asia",
  ID: "Southeast Asia",
  TH: "Southeast Asia",
  MY: "Southeast Asia",
  PH: "Southeast Asia",
  MM: "Southeast Asia",
  LA: "Southeast Asia",
  SG: "Southeast Asia",
  CN: "East Asia",
  HK: "East Asia",
  TW: "East Asia",
  JP: "East Asia",
  KR: "East Asia",
  IN: "South Asia",
  BD: "South Asia",
  PK: "South Asia",
  LK: "South Asia",
  NP: "South Asia",
  TR: "West Asia",
  JO: "West Asia",
  IL: "West Asia",
  MX: "Central America",
  HN: "Central America",
  GT: "Central America",
  SV: "Central America",
  NI: "Central America",
  CR: "Central America",
  DO: "Caribbean",
  HT: "Caribbean",
  MA: "North Africa",
  TN: "North Africa",
  EG: "North Africa",
  PE: "South America",
  CO: "South America",
  BR: "South America",
  AR: "South America",
  CL: "South America",
  ET: "Sub-Saharan Africa",
  KE: "Sub-Saharan Africa",
  MG: "Sub-Saharan Africa",
  LS: "Sub-Saharan Africa",
  MU: "Sub-Saharan Africa",
  ZA: "Sub-Saharan Africa",
  US: "North America",
  CA: "North America",
  AU: "Oceania",
  NZ: "Oceania",
};

const SCALE: Record<string, number> = {
  shirt_woven_cotton: 1,
  shirt_woven_linen: 1,
  tshirt_knit_cotton: 0.82,
  trousers_denim_cotton: 1.22,
  dress_woven_synthetic: 1.05,
  dress_woven_cotton: 1.05,
  outerwear_womens_mmf: 1.85,
  footwear_leather_womens: 1.15,
  handbag_leather: 1.1,
};

type Lane = [number, [number, number]];

const BASE: Record<string, Record<string, Lane>> = {
  "East Asia": { CA: [3.4, [30, 42]], US: [3.1, [28, 40]], UK: [3.6, [32, 46]], EU: [3.5, [30, 44]] },
  "Southeast Asia": { CA: [3.55, [32, 48]], US: [3.25, [30, 45]], UK: [3.7, [34, 48]], EU: [3.55, [32, 46]] },
  "South Asia": { CA: [3.7, [30, 44]], US: [3.4, [28, 42]], UK: [3.5, [26, 38]], EU: [3.4, [24, 36]] },
  "Southern Europe": { CA: [2.7, [16, 28]], US: [2.9, [18, 30]], UK: [1.8, [8, 16]], EU: [1.4, [4, 10]] },
  "Western Europe": { CA: [2.8, [16, 28]], US: [3.0, [18, 30]], UK: [1.6, [6, 14]], EU: [1.2, [3, 8]] },
  "Northern Europe": { CA: [3.0, [18, 30]], US: [3.1, [18, 32]], UK: [1.7, [6, 12]], EU: [1.5, [4, 10]] },
  "Eastern Europe": { CA: [3.0, [20, 32]], US: [3.1, [20, 34]], UK: [1.9, [10, 18]], EU: [1.3, [5, 12]] },
  "West Asia": { CA: [3.5, [24, 36]], US: [3.4, [22, 36]], UK: [2.6, [14, 24]], EU: [2.4, [12, 22]] },
  "North Africa": { CA: [3.2, [22, 34]], US: [3.3, [20, 34]], UK: [2.2, [10, 18]], EU: [1.9, [8, 16]] },
  "Sub-Saharan Africa": { CA: [4.2, [28, 42]], US: [4.0, [26, 40]], UK: [3.4, [18, 30]], EU: [3.2, [16, 28]] },
  "North America": { CA: [1.4, [4, 10]], US: [1.1, [3, 8]], UK: [2.8, [14, 24]], EU: [2.9, [14, 24]] },
  "Central America": { CA: [2.4, [12, 22]], US: [1.6, [6, 14]], UK: [3.3, [18, 30]], EU: [3.4, [18, 32]] },
  Caribbean: { CA: [2.6, [14, 24]], US: [1.9, [8, 16]], UK: [3.2, [16, 28]], EU: [3.3, [18, 30]] },
  "South America": { CA: [3.1, [20, 32]], US: [2.7, [16, 28]], UK: [3.8, [22, 36]], EU: [3.7, [22, 36]] },
  Oceania: { CA: [3.8, [24, 38]], US: [3.9, [22, 36]], UK: [4.4, [28, 42]], EU: [4.5, [28, 44]] },
};

export const FREIGHT_NOTE =
  "Starter number so the field isn't empty. It is not a carrier quote and it is not in the tariff file. Change it to your own estimate.";

export function regionOf(originCode: string): string {
  const region = REGIONS[originCode];
  if (!region) throw new Error(`No region for origin ${originCode}`);
  return region;
}

export function suggestFreight(categoryId: string, originCode: string, destinationCode: string): {
  perUnit: number;
  transitDays: [number, number];
  region: string;
} {
  const region = regionOf(originCode);
  const lane = BASE[region]?.[destinationCode];
  if (!lane) throw new Error(`No freight starter for ${region} → ${destinationCode}`);
  const scale = SCALE[categoryId] ?? 1;
  return {
    perUnit: Math.round(lane[0] * scale * 100) / 100,
    transitDays: lane[1],
    region,
  };
}
