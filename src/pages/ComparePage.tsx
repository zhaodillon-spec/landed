import { useMemo, useState } from "react";
import { DemoControls } from "../components/DemoControls";
import { OptionCards } from "../components/OptionCards";
import { PageIntro } from "../components/PageIntro";
import { DataNote } from "../components/PlaceholderBanner";
import { ReliabilityCard } from "../components/ReliabilityCard";
import { TangoPanel } from "../components/TangoPanel";
import { WaitlistSection } from "../components/WaitlistForm";
import { defaultDemo, quoteDemo, reliabilityMean, type DemoInput } from "../lib/calculate";
import { money, RATE_UNAVAILABLE } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";

export function ComparePage() {
  usePageTitle("Supplier comparison — Landed");
  const [demo, setDemo] = useState<DemoInput>(defaultDemo);
  const quote = useMemo(() => quoteDemo(demo), [demo]);
  const aTotal = quote.ok ? quote.a.total : null;
  const bTotal = quote.ok ? quote.b.total : null;
  const aPer = quote.ok ? quote.a.perUnit : null;
  const bPer = quote.ok ? quote.b.perUnit : null;
  const priced = aTotal != null && bTotal != null && aPer != null && bPer != null;
  const delta = priced ? Math.abs(aTotal - bTotal) : 0;
  const cheaperIsA = priced && aTotal <= bTotal;

  return (
    <>
    <main className="mx-auto max-w-page px-6 py-14 md:px-10 md:py-20">
      <PageIntro
        eyebrow="Demo · Supplier comparison"
        title="Two quotes. One landed cost."
        lede="Put two sourcing options next to each other. Duty follows the schedule for each origin. Preferential rates count only when you say the rules of origin are met. Freight is your estimate on each option."
      />
      <div className="mt-8">
        <DataNote />
      </div>
      <div className="mt-10 rounded-[32px] border border-line bg-white p-6 sm:p-8">
        <DemoControls demo={demo} onChange={setDemo} showBoth />
      </div>
      {quote.ok ? (
        <>
          <p className="mt-8 rounded-[24px] bg-mist px-6 py-5 text-lg">
            {priced ? (
              delta === 0 ? (
                <>
                  Both options land at <span className="font-heading text-3xl text-primary">{money(aTotal)}</span>.
                </>
              ) : (
                <>
                  <span className="font-heading text-3xl text-primary">{cheaperIsA ? quote.a.origin.name : quote.b.origin.name}</span>{" "}
                  costs {money(delta)} less to land on this order, at {money(cheaperIsA ? aPer : bPer)} a unit.
                </>
              )
            ) : (
              <>
                One of these lanes is <span className="font-medium">{RATE_UNAVAILABLE.toLowerCase()}</span>, so the landed costs
                can’t be ranked. A missing duty is not treated as zero.
              </>
            )}
          </p>
          <div className="mt-6">
            <OptionCards a={quote.a} b={quote.b} />
          </div>
          <div className="mt-10">
            <p className="mono-label">Reliability, not just price</p>
            <h2 className="mt-3 font-heading text-4xl tracking-[-0.02em]">What the quote doesn’t say.</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Each country in the demo carries a fictional reliability profile so you can weigh signals beside the landed cost.
              It is not a rating of real suppliers.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <ReliabilityCard result={quote.a} label="Option A" emphasize={reliabilityMean(quote.a) >= reliabilityMean(quote.b)} />
              <ReliabilityCard result={quote.b} label="Option B" emphasize={reliabilityMean(quote.b) > reliabilityMean(quote.a)} />
            </div>
          </div>
        </>
      ) : (
        <p className="mt-8 text-muted">{quote.ok ? "" : quote.error}</p>
      )}
      <div className="mt-12">
        <TangoPanel
          context={quote.ok ? { primary: quote.a, secondary: quote.b, primaryLabel: "Option A", secondaryLabel: "Option B" } : null}
        />
      </div>
    </main>
    <div className="mt-16">
      <WaitlistSection />
    </div>
    </>
  );
}
