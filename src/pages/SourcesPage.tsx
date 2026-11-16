import { Link } from "react-router-dom";
import { DataNote } from "../components/PlaceholderBanner";
import { PageIntro } from "../components/PageIntro";
import { WaitlistSection } from "../components/WaitlistForm";
import { AS_OF, DISCLAIMER, tariffs } from "../lib/rates";
import { formatAsOf } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";

const CAVEATS = [
  "A different fibre, gender, value band, or weight can move the goods onto another tariff line. The codes in this file are the lines that were checked, not a classification opinion.",
  "Preferential rates apply only when the goods meet the rules of origin and you hold proof of origin. Otherwise use the MFN path. The calculator’s checkbox switches between those two published paths.",
  "Where an effective rate could not be verified, the cell is null. Landed shows “rate unavailable” and does not substitute zero.",
  "The interaction between some FTA claims and US Section 301 top-up headings was not verified in the source dataset.",
  "US merchandise-processing fee minimums and maximums for FY2026, and individual EU VAT rates beyond the listed defaults, were not re-verified.",
  "Anti-dumping duty, countervailing duty, quotas, product-safety rules, and freight are out of scope. Freight in the calculator is an editable estimate.",
  "Rates change, especially into the United States. Open the cited source before quoting a customer.",
];

export function SourcesPage() {
  usePageTitle("Sources — Landed");
  const regime = tariffs.destinations.US.tariff_regime_status;

  return (
    <>
      <main className="mx-auto max-w-page px-6 py-14 md:px-10 md:py-20">
        <PageIntro
          eyebrow={`Methodology · ${formatAsOf(AS_OF)}`}
          title="Where the numbers come from."
          lede={DISCLAIMER}
        />
        <div className="mt-8">
          <DataNote />
        </div>

        <section className="mt-12 max-w-3xl space-y-4 text-base leading-relaxed">
          <h2 className="font-heading text-3xl">How a duty is chosen</h2>
          <p>{tariffs.meta.model}</p>
          <p>{tariffs.meta.never_fabricated}</p>
          <p>Valuation follows the dataset. Product cost stands in for customs value. For CIF destinations, your freight and insurance estimates are added before duty.</p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
            {Object.entries(tariffs.meta.valuation_basis).map(([code, text]) => (
              <li key={code}>
                <span className="font-medium text-ink">{code}.</span> {text}
              </li>
            ))}
          </ul>
          <p>
            Same-territory lanes are marked domestic in the file, including intra-EU movement. Those show no import duty and no import tax.
            Import VAT inside the EU still depends on the member state; the calculator offers the dataset’s default and the listed national rates.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-3xl">Schedules</h2>
          <div className="mt-4 grid gap-3">
            {Object.entries(tariffs.destinations).map(([code, destination]) => (
              <article key={code} className="rounded-[24px] border border-line p-5">
                <h3 className="font-heading text-2xl">{destination.name}</h3>
                <p className="mt-2 text-sm text-muted">{destination.tariff_source}</p>
                <a className="mt-2 inline-flex text-sm text-primary" href={destination.source_url}>
                  {destination.source_url}
                </a>
                {destination.import_taxes.source_url && (
                  <p className="mt-2 text-sm">
                    <a className="text-primary" href={destination.import_taxes.source_url}>
                      Import tax source
                    </a>
                  </p>
                )}
                {destination.de_minimis.source_url && (
                  <p className="mt-1 text-sm">
                    <a className="text-primary" href={destination.de_minimis.source_url}>
                      De minimis source
                    </a>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {regime && (
          <section className="mt-12 max-w-3xl">
            <h2 className="font-heading text-3xl">United States regime notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <li>{regime.ieepa}</li>
              <li>{regime.section_122}</li>
              <li>{regime.section_301_2026}</li>
              <li>{regime.section_301_china}</li>
            </ul>
            <ul className="mt-4 space-y-1 text-sm">
              {regime.sources?.map((url) => (
                <li key={url}>
                  <a className="text-primary" href={url}>
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 max-w-3xl">
          <h2 className="font-heading text-3xl">Caveats</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted">
            {CAVEATS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Dataset as of {AS_OF}. The rate table is on the <Link className="text-primary" to="/rates">rates page</Link>.
          </p>
        </section>
      </main>
      <div className="mt-16">
        <WaitlistSection />
      </div>
    </>
  );
}
