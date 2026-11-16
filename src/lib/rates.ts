import raw from "../data/tariffs.json";
import { regionOf } from "./freightEstimate";
import { reliabilityFor } from "./reliability";
import type { Category, Destination, Origin, RateRecord, TariffFile } from "./types";

const data = raw as unknown as TariffFile;

const EXAMPLE_NAMES: Record<string, string> = {
  shirt_woven_cotton: "cotton shirts",
  shirt_woven_linen: "linen shirts",
  tshirt_knit_cotton: "cotton tees",
  trousers_denim_cotton: "jeans",
  dress_woven_synthetic: "synthetic dresses",
  dress_woven_cotton: "cotton dresses",
  outerwear_womens_mmf: "jackets",
  footwear_leather_womens: "leather shoes",
  handbag_leather: "leather handbags",
};

const ALIASES: Record<string, string[]> = {
  TR: ["Turkey", "Turkiye"],
  GB: ["UK", "Britain", "United Kingdom"],
  US: ["USA", "America", "United States of America"],
  KR: ["Korea", "South Korea", "Republic of Korea"],
  VN: ["Viet Nam"],
  NL: ["Holland"],
  MM: ["Burma"],
  CZ: ["Czech Republic"],
};

const DESTINATION_ALIASES: Record<string, string[]> = {
  CA: ["CAN"],
  US: ["USA", "America"],
  UK: ["Britain", "Great Britain", "England", "GB"],
  EU: ["Europe", "EU27"],
};

function fail(message: string): never {
  throw new Error(`tariffs.json: ${message}`);
}

function assertTariffs(file: TariffFile) {
  if (!file.meta?.as_of) fail("meta.as_of is required");
  if (file.origins.length < 50) fail(`expected at least 50 origins, found ${file.origins.length}`);
  const destinationCodes = Object.keys(file.destinations);
  for (const code of ["CA", "US", "UK", "EU"]) {
    if (!destinationCodes.includes(code)) fail(`missing destination ${code}`);
  }
  const originCodes = new Set<string>();
  for (const origin of file.origins) {
    if (originCodes.has(origin.iso2)) fail(`duplicate origin ${origin.iso2}`);
    originCodes.add(origin.iso2);
    regionOf(origin.iso2);
  }
  if (file.categories.length < 1) fail("no categories");
  for (const category of file.categories) {
    const table = file.rates[category.id];
    if (!table) fail(`no rate table for ${category.id}`);
    for (const origin of file.origins) {
      const row = table[origin.iso2];
      if (!row) fail(`${category.id} is missing origin ${origin.iso2}`);
      for (const destination of destinationCodes) {
        if (!row[destination]) fail(`${category.id} ${origin.iso2} is missing ${destination}`);
      }
    }
  }
}

assertTariffs(data);

export const tariffs = data;
export const AS_OF = data.meta.as_of;
export const DISCLAIMER =
  "Estimates use official tariff schedules as of 15 Nov 2026. They are not customs advice, a classification opinion, or a ruling. Check the cited source before you rely on a number.";

export const categories: Category[] = data.categories.map((category) => ({
  ...category,
  exampleName: EXAMPLE_NAMES[category.id] ?? category.label.toLowerCase(),
}));

export const origins: Origin[] = data.origins
  .map((origin) => ({
    code: origin.iso2,
    name: origin.name,
    region: regionOf(origin.iso2),
    aliases: ALIASES[origin.iso2] ?? [],
    euMember: origin.eu_member,
    demoReliability: reliabilityFor(origin.iso2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const destinations: Destination[] = ["CA", "US", "UK", "EU"].map((code) => ({
  code,
  name: data.destinations[code].name,
  aliases: DESTINATION_ALIASES[code] ?? [],
}));

export function getOrigin(code: string): Origin {
  const origin = origins.find((item) => item.code === code);
  if (!origin) fail(`unknown origin ${code}`);
  return origin;
}

export function getDestination(code: string): Destination {
  const destination = destinations.find((item) => item.code === code);
  if (!destination) fail(`unknown destination ${code}`);
  return destination;
}

export function getCategory(id: string): Category {
  const category = categories.find((item) => item.id === id);
  if (!category) fail(`unknown category ${id}`);
  return category;
}

export function getRateRecord(categoryId: string, originCode: string, destinationCode: string): RateRecord | null {
  return data.rates[categoryId]?.[originCode]?.[destinationCode] ?? null;
}

export function dutyValuation(destinationCode: string): "fob" | "cif" {
  const basis = data.meta.valuation_basis[destinationCode] ?? "";
  return basis.startsWith("CIF") ? "cif" : "fob";
}
