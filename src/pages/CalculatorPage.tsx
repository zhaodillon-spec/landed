import { useMemo, useState } from "react";
import { DemoControls } from "../components/DemoControls";
import { EstimateCard, EstimateDetail } from "../components/EstimateCard";
import { PageIntro } from "../components/PageIntro";
import { DataNote } from "../components/PlaceholderBanner";
import { Tango } from "../components/Tango";
import { TangoPanel } from "../components/TangoPanel";
import { WaitlistSection } from "../components/WaitlistForm";
import { defaultDemo, orderTitle, quoteDemo, type DemoInput } from "../lib/calculate";
import { transitLabel } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";

export function CalculatorPage() {
  usePageTitle("Import cost calculator — Landed");
  const [demo, setDemo] = useState<DemoInput>(defaultDemo);
  const quote = useMemo(() => quoteDemo(demo), [demo]);

  return (
    <>
    <main className="mx-auto max-w-page px-6 py-14 md:px-10 md:py-20">
      <PageIntro
        eyebrow="Demo · Tariff & import calculator"
        title="See the cost before the order."
        lede="Unit cost, quantity, origin, and destination. Duty and import tax come from the 15 Nov 2026 schedules. Freight and insurance stay editable because they were not researched."
      />
      <div className="mt-8">
        <DataNote />
      </div>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-12">
        <div className="rounded-[28px] border border-line bg-white p-6 lg:col-span-5">
          <DemoControls demo={demo} onChange={setDemo} />
          {quote.ok && (
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Transit estimate: {transitLabel(quote.a.transitDays)}. Not a sailing schedule.
              {quote.a.hsCode ? ` Tariff line ${quote.a.hsCode}.` : ""} A different fibre, gender, or value band can change the line.
            </p>
          )}
        </div>
        <div className="space-y-5 lg:col-span-7">
          {quote.ok ? (
            <>
              <EstimateCard result={quote.a} title={orderTitle(quote.a)} />
              <EstimateDetail result={quote.a} />
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
              <Tango className="mx-auto h-24 w-24" />
              <p className="mt-4 text-muted">{quote.error}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-12">
        <TangoPanel
          context={quote.ok ? { primary: quote.a, secondary: null, primaryLabel: "This order", secondaryLabel: "" } : null}
        />
      </div>
    </main>
    <div className="mt-16">
      <WaitlistSection />
    </div>
    </>
  );
}
