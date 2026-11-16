import { describe, expect, it } from "vitest";
import { handleWaitlist } from "../../shared/waitlist.mjs";
import { calculate, defaultDemo, quoteDemo } from "./calculate";
import { answerQuestion } from "./explain";
import { origins, rates } from "./rates";

const contextFromDefault = () => {
  const quote = quoteDemo(defaultDemo);
  if (!quote.ok) throw new Error(quote.error);
  return {
    primary: quote.a,
    secondary: quote.b,
    primaryLabel: "Option A",
    secondaryLabel: "Option B",
  };
};

describe("rates file", () => {
  it("ships at least 50 origins and labels the file as placeholder", () => {
    expect(origins.length).toBeGreaterThanOrEqual(50);
    expect(rates.meta.dataStatus).toBe("placeholder");
    expect(rates.meta.disclaimer.toLowerCase()).toContain("placeholder");
    expect(rates.destinations.map((destination) => destination.code)).toEqual(["CA", "US", "GB", "EU"]);
  });
});

describe("calculate", () => {
  it("prices 200 shirts from Portugal to Canada off the placeholder table", () => {
    const result = calculate({
      categoryId: "woven-shirts",
      originCode: "PT",
      destinationCode: "CA",
      unitCost: 21,
      quantity: 200,
    });
    expect(result.product).toBe(4200);
    expect(result.freight).toBe(540);
    expect(result.insurance).toBe(21);
    expect(result.dutyKind).toBe("mfn");
    expect(result.dutyRate).toBe(0.17);
    expect(result.duty).toBe(714);
    expect(result.taxName).toBe("GST");
    expect(result.tax).toBe(273.75);
    expect(result.total).toBe(5748.75);
    expect(result.perUnit).toBeCloseTo(28.74375);
  });

  it("uses Vietnam's preferential override into Canada and lands lower", () => {
    const vietnam = calculate({
      categoryId: "woven-shirts",
      originCode: "VN",
      destinationCode: "CA",
      unitCost: 18.5,
      quantity: 200,
    });
    const portugal = calculate({
      categoryId: "woven-shirts",
      originCode: "PT",
      destinationCode: "CA",
      unitCost: 21,
      quantity: 200,
    });
    expect(vietnam.dutyKind).toBe("preferential");
    expect(vietnam.dutyRate).toBe(0.09);
    expect(vietnam.dutyProgram).toMatch(/CPTPP/);
    expect(vietnam.freight).toBe(710);
    expect(vietnam.perUnit).toBeLessThan(portugal.perUnit);
  });

  it("applies the intra-EU placeholder as zero duty", () => {
    const result = calculate({
      categoryId: "woven-shirts",
      originCode: "PT",
      destinationCode: "EU",
      unitCost: 21,
      quantity: 200,
    });
    expect(result.duty).toBe(0);
    expect(result.dutyKind).toBe("preferential");
  });

  it("treats the same country as domestic", () => {
    const result = calculate({
      categoryId: "knit-tees",
      originCode: "US",
      destinationCode: "US",
      unitCost: 8,
      quantity: 100,
    });
    expect(result.dutyKind).toBe("domestic");
    expect(result.duty).toBe(0);
    expect(result.tax).toBe(0);
  });

  it("scales outerwear freight above shirts on the same lane", () => {
    const shirts = calculate({
      categoryId: "woven-shirts",
      originCode: "PT",
      destinationCode: "CA",
      unitCost: 21,
      quantity: 1,
    });
    const coats = calculate({
      categoryId: "outerwear",
      originCode: "PT",
      destinationCode: "CA",
      unitCost: 21,
      quantity: 1,
    });
    expect(coats.freight).toBeGreaterThan(shirts.freight);
  });
});

describe("Tango", () => {
  it("explains the duty line with the placeholder rate", () => {
    const answer = answerQuestion("Why are my duties this high?", contextFromDefault());
    expect(answer).toContain("$714.00");
    expect(answer).toContain("17%");
    expect(answer.toLowerCase()).toContain("placeholder");
  });

  it("picks the lower landed option", () => {
    const answer = answerQuestion("Which option costs less to land?", contextFromDefault());
    expect(answer).toContain("Vietnam");
    expect(answer).toContain("Portugal");
  });
});

describe("waitlist api", () => {
  it("rejects a bad email", async () => {
    const result = await handleWaitlist({ email: "nope", brandName: "Studio" }, {});
    expect(result.status).toBe(400);
  });

  it("accepts a signup when no backend is configured", async () => {
    const result = await handleWaitlist(
      { email: "ada@example.com", brandName: "Studio Ada", role: "Founder" },
      {},
    );
    expect(result.status).toBe(200);
    expect(result.body.stored).toBe("unconfigured");
  });

  it("drops honeypot submissions", async () => {
    const result = await handleWaitlist(
      { email: "ada@example.com", brandName: "Studio Ada", companyWebsite: "https://spam.test" },
      {},
    );
    expect(result.body.stored).toBe("ignored");
  });
});
