import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { DemoControls } from "../components/DemoControls";
import { EstimateCard } from "../components/EstimateCard";
import { OptionCards } from "../components/OptionCards";
import { DataNote } from "../components/PlaceholderBanner";
import { ReliabilityCard } from "../components/ReliabilityCard";
import { Tango } from "../components/Tango";
import { TangoPanel } from "../components/TangoPanel";
import { WaitlistSection } from "../components/WaitlistForm";
import { defaultDemo, orderTitle, quoteDemo, reliabilityMean, type DemoInput } from "../lib/calculate";
import { flagEmoji, money, RATE_UNAVAILABLE, unitPriceLabel } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";

export function HomePage() {
  usePageTitle("Landed — Know the real cost of importing fashion");
  const [demo, setDemo] = useState<DemoInput>(defaultDemo);
  const quote = useMemo(() => quoteDemo(demo), [demo]);

  return (
    <main>
      <section id="top">
        <div className="mx-auto grid max-w-page items-center gap-16 px-6 pb-24 pt-14 md:px-10 md:pb-32 md:pt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 rounded-full bg-mist px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built for independent fashion brands.
            </p>
            <h1 className="mt-8 font-heading text-5xl leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              Know the real cost of bringing your designs{" "}
              <em className="relative inline-block whitespace-nowrap text-primary">
                to life.
                <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden className="absolute -bottom-1 left-0 h-3 w-full">
                  <path d="M3 8 C50 2 125 2 197 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              Landed helps independent fashion brands source smarter by showing them what importing really costs before
              they commit. Tariffs, shipping, duties, and supplier comparisons — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#waitlist" className="btn-primary">
                Join the waitlist
                <Arrow />
              </a>
              <a href="#features" className="btn-secondary">
                See what we’re building
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[420px] lg:col-span-5">
            <div
              aria-hidden
              className="absolute -inset-x-4 -bottom-8 -top-16 -z-10 rounded-[46%_54%_52%_48%/55%_45%_55%_45%] bg-mist sm:-inset-x-10"
            />
            <div className="mb-2 flex justify-end pr-4">
              <Tango dance className="h-24 w-24" />
            </div>
            {quote.ok ? (
              <div className="relative">
                <span className="absolute -top-4 left-6 z-10 rounded-full border border-line bg-white px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] shadow-[0_8px_20px_-12px_rgba(23,23,23,0.45)]">
                  {flagEmoji(quote.a.origin.code)} {quote.a.origin.name} → {quote.a.destination.name}
                </span>
                <EstimateCard result={quote.a} title={orderTitle(quote.a)} />
                <span className="absolute -bottom-4 right-6 rounded-full bg-primary px-4 py-2 font-mono text-xs text-white shadow-[0_12px_24px_-12px_rgba(0,71,171,0.9)]">
                  {unitPriceLabel(quote.a.perUnit)}
                </span>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-line bg-white p-8 text-center">
                <Tango className="mx-auto h-20 w-20" />
                <p className="mt-4 text-muted">{quote.error}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="problem" className="scroll-mt-24 px-3 md:px-6">
        <div className="rounded-[40px] bg-canvas md:rounded-[56px]">
          <div className="mx-auto grid max-w-page gap-14 px-5 py-16 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <p className="mono-label">The problem</p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-[3.25rem]">
                Importing shouldn’t come with <em className="text-primary">financial surprises.</em>
              </h2>
            </div>
            <div className="overflow-hidden rounded-[32px] border border-line bg-white lg:col-span-7">
              <ProblemRow
                index="01"
                title="Hidden costs"
                body="Unexpected tariffs, duties, and taxes can destroy your margins."
                aside={
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="-rotate-3 rounded-full bg-primary px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white">
                      + tariffs
                    </span>
                    <span className="rotate-2 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em]">
                      + duties
                    </span>
                    <span className="-rotate-1 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em]">
                      + taxes
                    </span>
                  </div>
                }
              />
              <ProblemRow
                index="02"
                title="Sourcing confusion"
                body="Comparing suppliers and countries is time-consuming."
                aside={
                  <div className="flex items-center">
                    {["PT", "VN", "TR", "IN"].map((code) => (
                      <span
                        key={code}
                        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white font-mono text-[11px] first:ml-0"
                      >
                        {code}
                      </span>
                    ))}
                    <span className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-mono text-[11px] text-white">
                      ?
                    </span>
                  </div>
                }
              />
              <ProblemRow
                index="03"
                title="Supplier uncertainty"
                body="The cheapest quote doesn’t always mean the best supplier."
                aside={
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em]">
                      Cheapest
                    </span>
                    <span className="font-mono text-primary">≠</span>
                    <span className="rounded-full bg-primary px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white">
                      Best
                    </span>
                  </div>
                }
                last
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24">
        <div className="mx-auto max-w-page px-6 py-20 md:px-10 md:py-32">
          <div className="max-w-3xl">
            <p className="mono-label">What we’re building</p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              Everything you need to <em className="text-primary">source smarter.</em>
            </h2>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <article className="flex h-full flex-col gap-10 rounded-[36px] bg-mist p-7 sm:p-10 md:rounded-[44px] lg:col-span-2 lg:flex-row lg:items-center lg:gap-16 lg:p-14">
              <div className="lg:w-5/12">
                <FeatureIndex n="01" />
                <h3 className="mt-6 font-heading text-3xl leading-tight sm:text-4xl">Tariff & import calculator</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
                  See duties, tariffs, taxes, and shipping before you place the order. Duty and tax come from official schedules. Freight is your estimate.
                </p>
                <Link to="/calculator" className="mt-6 inline-flex text-sm font-medium text-primary">
                  Open the full calculator →
                </Link>
              </div>
              <div className="lg:flex-1">
                <div className="rounded-[28px] bg-white p-6 shadow-[0_28px_60px_-40px_rgba(0,71,171,0.7)] sm:p-8">
                  <DemoControls demo={demo} onChange={setDemo} compact />
                  <div className="mt-7 flex items-end justify-between gap-4 border-t border-line pt-6">
                    <p className="mono-label">Est. landed cost</p>
                    <p className="font-heading text-5xl leading-none text-primary">
                      {quote.ok && quote.a.perUnit != null ? (
                        <>
                          {money(quote.a.perUnit)}
                          <span className="font-mono text-xs text-muted"> / unit</span>
                        </>
                      ) : quote.ok ? (
                        <span className="text-3xl">{RATE_UNAVAILABLE}</span>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
                <p className="mono-label mt-5 text-[10px]">The card above follows this demo · freight is your estimate</p>
              </div>
            </article>

            <article className="flex h-full flex-col gap-8 rounded-[36px] border border-line bg-white p-7 sm:p-10 md:rounded-[44px]">
              <div>
                <FeatureIndex n="02" />
                <h3 className="mt-6 font-heading text-3xl leading-tight sm:text-4xl">Supplier comparison</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted">
                  Compare manufacturers by what the order actually costs to land, not just the quote on the proforma.
                </p>
              </div>
              <DemoControls demo={demo} onChange={setDemo} showBoth optionsOnly compact />
              {quote.ok ? <OptionCards a={quote.a} b={quote.b} /> : <p className="text-sm text-muted">{quote.error}</p>}
              <Link to="/compare" className="text-sm font-medium text-primary">
                Open the full comparison →
              </Link>
            </article>

            <article className="flex h-full flex-col gap-8 rounded-[36px] bg-canvas p-7 sm:p-10 md:rounded-[44px]">
              <div>
                <FeatureIndex n="03" />
                <h3 className="mt-6 font-heading text-3xl leading-tight sm:text-4xl">Supplier reliability</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted">
                  Weigh reliability signals beside the price. These profiles are fictional demo data, not audits of real factories.
                </p>
              </div>
              {quote.ok ? (
                <div className="space-y-3">
                  <ReliabilityCard
                    result={quote.a}
                    label="Option A"
                    emphasize={reliabilityMean(quote.a) >= reliabilityMean(quote.b)}
                  />
                  <ReliabilityCard
                    result={quote.b}
                    label="Option B"
                    emphasize={reliabilityMean(quote.b) > reliabilityMean(quote.a)}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted">{quote.error}</p>
              )}
            </article>
          </div>

          <div className="mt-10">
            <DataNote />
          </div>
          <div className="mt-8 flex justify-center">
            <a href="#waitlist" className="btn-primary">
              Join the waitlist
            </a>
          </div>
        </div>
      </section>

      <section id="tango" className="scroll-mt-24">
        <div className="mx-auto grid max-w-page items-center gap-14 px-6 pb-20 md:px-10 md:pb-32 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Tango dance className="h-28 w-28" />
            <p className="mono-label mt-8">Meet Tango</p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-[3.25rem]">
              Still have questions? <em className="text-primary">Ask Tango.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Tango explains the estimate in front of you. He’s rule-based for now — a guide through the breakdown, not a
              customs broker.
            </p>
          </div>
          <div className="lg:col-span-7">
            <TangoPanel
              context={
                quote.ok
                  ? { primary: quote.a, secondary: quote.b, primaryLabel: "Option A", secondaryLabel: "Option B" }
                  : null
              }
            />
          </div>
        </div>
      </section>

      <WaitlistSection />
    </main>
  );
}

function FeatureIndex({ n }: { n: string }) {
  return (
    <span className="inline-flex rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
      Feature {n}
    </span>
  );
}

function ProblemRow({
  index,
  title,
  body,
  aside,
  last = false,
}: {
  index: string;
  title: string;
  body: string;
  aside: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-6 p-7 transition-colors hover:bg-mist sm:p-9 ${last ? "" : "border-b border-line"}`}>
      <span className="self-start pt-2 font-mono text-xs text-primary">{index}</span>
      <div className="flex-1">
        <h3 className="font-heading text-3xl leading-tight">{title}</h3>
        <p className="mt-2 max-w-sm leading-relaxed text-muted">{body}</p>
      </div>
      <div className="hidden shrink-0 sm:block">{aside}</div>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m12 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
