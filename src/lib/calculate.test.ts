import { describe, expect, it } from "vitest";
import { handleWaitlist } from "../../shared/waitlist.mjs";
import { calculate, defaultDemo, quoteDemo, resolveDuty } from "./calculate";
import { answerQuestion } from "./explain";
import { origins, tariffs } from "./rates";

const linen = {
  categoryId: "shirt_woven_linen",
  unitCost: 21,
  quantity: 200,
  freightPerUnit: 2.7,
  insuranceRate: 0.005,
  vatChoice: "GST",
} as const;

describe("tariff file", () => {
  it("covers at least 50 origins, four destinations, and an as-of date", () => {
    expect(origins.length).toBeGreaterThanOrEqual(50);
    expect(Object.keys(tariffs.destinations)).toEqual(["CA", "US", "UK", "EU"]);
    expect(tariffs.meta.as_of).toBe("2026-11-15");
    expect(tariffs.categories).toHaveLength(9);
  });
});

describe("calculate", () => {
  it("uses the preferential path for linen shirts from Portugal to Canada", () => {
    const result = calculate({ ...linen, originCode: "PT", destinationCode: "CA", claimPreference: true });
    expect(result.dutyKind).toBe("preferential");
    expect(result.dutyRate).toBe(0);
    expect(result.dutyProgram).toMatch(/CETA/);
    expect(result.duty).toBe(0);
    expect(result.product).toBe(4200);
    expect(result.freight).toBe(540);
    expect(result.insurance).toBe(21);
    expect(result.taxName).toBe("GST");
    expect(result.tax).toBe(210);
    expect(result.total).toBe(4971);
  });

  it("falls back to the MFN path when rules of origin are not claimed", () => {
    const result = calculate({ ...linen, originCode: "PT", destinationCode: "CA", claimPreference: false });
    expect(result.dutyKind).toBe("mfn");
    expect(result.dutyRate).toBeCloseTo(0.18);
    expect(result.duty).toBe(756);
    expect(result.tax).toBe(247.8);
    expect(result.total).toBe(5764.8);
  });

  it("does not treat a null effective rate as zero", () => {
    const result = calculate({ ...linen, originCode: "US", destinationCode: "CA", claimPreference: true });
    expect(result.dutyKind).toBe("unavailable");
    expect(result.duty).toBeNull();
    expect(result.dutyAvailable).toBe(false);
    expect(result.total).toBeNull();
    expect(resolveDuty("shirt_woven_linen", "US", "CA", true).rate).toBeNull();
  });

  it("treats an EU origin into the EU as domestic, not as a zeroed import", () => {
    const result = calculate({
      ...linen,
      originCode: "PT",
      destinationCode: "EU",
      claimPreference: true,
      vatChoice: "default",
    });
    expect(result.dutyKind).toBe("domestic");
    expect(result.duty).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.taxName).toBe("No import tax");
  });

  it("charges UK duty on a CIF stand-in for a non-zero MFN lane", () => {
    const result = calculate({
      ...linen,
      originCode: "CN",
      destinationCode: "UK",
      claimPreference: true,
      vatChoice: "VAT",
    });
    expect(result.dutyBasis).toBe("cif");
    expect(result.dutyKind).toBe("mfn");
    expect(result.dutyRate).toBeCloseTo(0.12);
    expect(result.duty).toBe(571.32);
    expect(result.taxRate).toBeCloseTo(0.2);
    expect(result.tax).toBe(1066.46);
    expect(result.total).toBe(6398.78);
  });

  it("adds US merchandise and harbor fees and keeps China linen on the published effective rate", () => {
    const result = calculate({
      ...linen,
      originCode: "CN",
      destinationCode: "US",
      claimPreference: true,
      vatChoice: "none",
    });
    expect(result.dutyRate).toBeCloseTo(0.228);
    expect(result.duty).toBe(957.6);
    expect(result.tax).toBe(0);
    expect(result.feeLines.map((line) => line.name)).toEqual([
      "Merchandise Processing Fee",
      "Harbor Maintenance Fee",
    ]);
    expect(result.fees).toBe(19.8);
    expect(result.total).toBe(5738.4);
  });

  it("quotes the default linen demo with a real preference and a lower Vietnam landed cost", () => {
    const quote = quoteDemo(defaultDemo);
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.a.dutyKind).toBe("preferential");
    expect(quote.b.dutyKind).toBe("preferential");
    expect(quote.b.perUnit).not.toBeNull();
    expect(quote.a.perUnit).not.toBeNull();
    expect(quote.b.perUnit!).toBeLessThan(quote.a.perUnit!);
  });
});

describe("Tango", () => {
  it("explains the preferential duty and that it is not customs advice", () => {
    const quote = quoteDemo(defaultDemo);
    if (!quote.ok) throw new Error(quote.error);
    const answer = answerQuestion("Why are my duties this high?", {
      primary: quote.a,
      secondary: quote.b,
      primaryLabel: "Option A",
      secondaryLabel: "Option B",
    });
    expect(answer).toContain("CETA");
    expect(answer.toLowerCase()).toContain("rules of origin");
    expect(answer.toLowerCase()).toContain("not customs advice");
  });

  it("refuses to call a missing rate zero", () => {
    const result = calculate({ ...linen, originCode: "US", destinationCode: "CA", claimPreference: true });
    const answer = answerQuestion("Why are my duties this high?", {
      primary: result,
      secondary: null,
      primaryLabel: "This order",
      secondaryLabel: "",
    });
    expect(answer.toLowerCase()).toContain("unavailable");
    expect(answer.toLowerCase()).toContain("not");
    expect(answer.toLowerCase()).toContain("zero");
  });
});

describe("waitlist api", () => {
  it("rejects a bad email", async () => {
    const result = await handleWaitlist({ email: "nope", brandName: "Studio" }, {});
    expect(result.status).toBe(400);
  });
});
