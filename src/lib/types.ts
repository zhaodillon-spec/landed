export type ExtraTariff = {
  name: string;
  rate: number | null;
  hts_heading?: string;
  effective?: string;
  source_url?: string;
  note?: string;
  waived_if_preference_claimed?: boolean;
  exemption?: string;
};

export type RateRecord = {
  domestic?: boolean;
  hs_code?: string;
  mfn_rate: number | null;
  preferential_rate: number | null;
  preference_scheme?: string | null;
  extra_tariffs: ExtraTariff[] | null;
  source_url?: string;
  source_url_taric?: string;
  as_of?: string;
  notes?: string[];
  effective_rate_mfn_path: number | null;
  effective_rate_preferential_path: number | null;
};

export type TariffCategory = {
  id: string;
  label: string;
  hs6: string;
  codes: Record<string, string>;
};

export type TariffOrigin = {
  iso2: string;
  name: string;
  eu_member: boolean;
};

export type DestinationRecord = {
  name: string;
  tariff_source: string;
  source_url: string;
  import_taxes: {
    GST?: number;
    HST?: Record<string, number>;
    pst_note?: string;
    tax_base?: string;
    note?: string;
    source_url?: string;
    nova_scotia_note?: string;
    federal_vat?: number | null;
    fees?: {
      MPF?: { rate_pct: number; note: string; source_url?: string };
      HMF?: { rate_pct: number; note: string; source_url?: string };
    };
    VAT?: number;
    VAT_default?: number;
    VAT_by_country?: Record<string, number>;
  };
  de_minimis: {
    note: string;
    source_url?: string;
  };
  tariff_regime_status?: {
    ieepa?: string;
    section_122?: string;
    section_301_2026?: string;
    section_301_china?: string;
    sources?: string[];
  };
};

export type TariffFile = {
  meta: {
    title: string;
    as_of: string;
    timezone_note: string;
    valuation_basis: Record<string, string>;
    never_fabricated: string;
    model: string;
  };
  destinations: Record<string, DestinationRecord>;
  categories: TariffCategory[];
  origins: TariffOrigin[];
  rates: Record<string, Record<string, Record<string, RateRecord>>>;
};

export type Reliability = {
  placeholder: true;
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
  euMember: boolean;
  demoReliability: Reliability;
};

export type Destination = {
  code: string;
  name: string;
  aliases: string[];
};

export type Category = TariffCategory & {
  exampleName: string;
};

export type DutyKind = "preferential" | "mfn" | "domestic" | "unavailable";
export type DutyBasis = "fob" | "cif";

export type FeeLine = {
  name: string;
  amount: number;
  note: string;
};

export type LineResult = {
  category: Category;
  origin: Origin;
  destination: Destination;
  quantity: number;
  unitCost: number;
  product: number;
  freightPerUnit: number;
  freight: number;
  insuranceRate: number;
  insurance: number;
  freightAndInsurance: number;
  transitDays: [number, number];
  freightRegion: string;
  claimPreference: boolean;
  dutyAvailable: boolean;
  duty: number | null;
  dutyRate: number | null;
  mfnPathRate: number | null;
  dutyKind: DutyKind;
  dutyProgram: string | null;
  dutyNotes: string[];
  extraTariffs: ExtraTariff[];
  hsCode: string | null;
  sourceUrl: string | null;
  dutyBasis: DutyBasis;
  taxAvailable: boolean;
  tax: number | null;
  taxName: string;
  taxRate: number | null;
  taxNote: string;
  fees: number;
  feeLines: FeeLine[];
  deMinimisNote: string;
  total: number | null;
  perUnit: number | null;
};
