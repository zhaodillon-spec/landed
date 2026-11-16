import raw from "../data/rates.json";
import type { Category, Destination, Origin, RatesFile } from "./types";

const data = raw as unknown as RatesFile;

function fail(message: string): never {
  throw new Error(`rates.json: ${message}`);
}

function assertRates(file: RatesFile) {
  if (file.meta.schemaVersion !== 1) fail("schemaVersion must be 1");
  if (!file.meta.disclaimer) fail("meta.disclaimer is required");
  if (file.origins.length < 50) fail(`expected at least 50 origins, found ${file.origins.length}`);

  const originCodes = new Set<string>();
  const regions = new Set<string>();
  for (const origin of file.origins) {
    if (originCodes.has(origin.code)) fail(`duplicate origin ${origin.code}`);
    originCodes.add(origin.code);
    regions.add(origin.region);
    const signals = [
      origin.demoReliability.onTime,
      origin.demoReliability.communication,
      origin.demoReliability.qualityConsistency,
      origin.demoReliability.complianceDocs,
      origin.demoReliability.sampling,
    ];
    if (signals.some((value) => value < 1 || value > 5)) {
      fail(`reliability signals for ${origin.code} must be from 1 to 5`);
    }
  }

  const destinationCodes = file.destinations.map((destination) => destination.code);
  if (new Set(destinationCodes).size !== destinationCodes.length) fail("duplicate destination code");

  for (const category of file.categories) {
    for (const code of destinationCodes) {
      if (typeof category.mfnByDestination[code] !== "number") {
        fail(`${category.id} is missing an MFN rate for ${code}`);
      }
      const tax = category.importTaxByDestination[code];
      if (!tax) fail(`${category.id} is missing import tax for ${code}`);
      if (!["cif_plus_duty", "cif", "product"].includes(tax.basis)) {
        fail(`${category.id} has an unknown tax basis for ${code}`);
      }
    }
    if (category.dutyBasis !== "fob_product" && category.dutyBasis !== "cif") {
      fail(`${category.id} has an unknown duty basis`);
    }

    const seen = new Set<string>();
    for (const row of category.preferentialOverrides) {
      if (!originCodes.has(row.origin)) fail(`${category.id} preference cites unknown origin ${row.origin}`);
      if (!destinationCodes.includes(row.destination)) {
        fail(`${category.id} preference cites unknown destination ${row.destination}`);
      }
      const key = `${row.origin}->${row.destination}`;
      if (seen.has(key)) fail(`${category.id} has two preferences for ${key}`);
      seen.add(key);
    }

    for (const region of regions) {
      const lanes = category.freightEstimates.byOriginRegion[region];
      if (!lanes) fail(`${category.id} has no freight for region ${region}`);
      for (const code of destinationCodes) {
        const lane = lanes[code];
        if (!lane || typeof lane.perUnitUsd !== "number" || lane.transitDays?.length !== 2) {
          fail(`${category.id} freight lane ${region} → ${code} is incomplete`);
        }
      }
    }
  }
}

assertRates(data);

export const rates = data;

export const origins: Origin[] = [...data.origins].sort((a, b) => a.name.localeCompare(b.name));
export const destinations: Destination[] = data.destinations;
export const categories: Category[] = data.categories;

export function getOrigin(code: string): Origin {
  const origin = data.origins.find((item) => item.code === code);
  if (!origin) fail(`unknown origin ${code}`);
  return origin;
}

export function getDestination(code: string): Destination {
  const destination = data.destinations.find((item) => item.code === code);
  if (!destination) fail(`unknown destination ${code}`);
  return destination;
}

export function getCategory(id: string): Category {
  const category = data.categories.find((item) => item.id === id);
  if (!category) fail(`unknown category ${id}`);
  return category;
}
