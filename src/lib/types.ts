export type TaxBasis = "cif_plus_duty" | "cif" | "product";
export type DutyBasis = "fob_product" | "cif";

export type ImportTax = {
  name: string;
  rate: number;
  basis: TaxBasis;
  note: string;
};

export type FreightLane = {
  perUnitUsd: number;
  transitDays: [number, number];
};

export type PreferentialOverride = {
  origin: string;
  destination: string;
  rate: number;
  program: string;
  note: string;
};

export type Reliability = {
  placeholder: boolean;
  note: string;
  onTime: number;
  communication: number;
  qualityConsistency: number;
  complianceDocs: number;
  sampling: number;
};

export type Origin = {
  code: string;
  name: string;
  region: string;
  aliases: string[];
  demoReliability: Reliability;
};

export type Destination = {
  code: string;
  name: string;
  aliases: string[];
};

export type Category = {
  id: string;
  hsCode: string;
  hsNote: string;
  name: string;
  exampleName: string;
  summary: string;
  dutyBasis: DutyBasis;
  mfnByDestination: Record<string, number>;
  preferentialOverrides: PreferentialOverride[];
  importTaxByDestination: Record<string, ImportTax>;
  freightEstimates: {
    insuranceRateOfProduct: number;
    note: string;
    byOriginRegion: Record<string, Record<string, FreightLane>>;
    originOverrides: Record<string, Record<string, FreightLane>>;
  };
};

export type RatesMeta = {
  schemaVersion: number;
  dataStatus: string;
  currency: string;
  disclaimer: string;
  dutyBasis: string;
  taxBasis: string;
  freightBasis: string;
  howToReplace: string;
  asOf: string | null;
  generatedBy: string;
};

export type RatesFile = {
  meta: RatesMeta;
  destinations: Destination[];
  origins: Origin[];
  categories: Category[];
};

export type DutyKind = "preferential" | "mfn" | "domestic";

export type DutyQuote = {
  rate: number;
  mfnRate: number;
  kind: DutyKind;
  program: string | null;
  note: string | null;
};

export type FreightQuote = FreightLane & {
  region: string;
  matchedBy: "region" | "origin";
};

export type LineResult = {
  category: Category;
  origin: Origin;
  destination: Destination;
  quantity: number;
  unitCost: number;
  product: number;
  freight: number;
  insurance: number;
  freightAndInsurance: number;
  duty: number;
  dutyRate: number;
  mfnRate: number;
  dutyKind: DutyKind;
  dutyProgram: string | null;
  dutyNote: string | null;
  dutyBasis: DutyBasis;
  tax: number;
  taxName: string;
  taxRate: number;
  taxBasis: TaxBasis;
  taxNote: string;
  total: number;
  perUnit: number;
  freightQuote: FreightQuote;
};
