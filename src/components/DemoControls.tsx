import { defaultTaxChoice, syncFreight, taxChoices, type DemoInput, type OptionInput } from "../lib/calculate";
import { categories, destinations, origins } from "../lib/rates";
import { compactFieldClass, textFieldClass } from "../lib/format";
import { CountrySelect } from "./CountrySelect";

type DemoControlsProps = {
  demo: DemoInput;
  onChange: (demo: DemoInput) => void;
  showBoth?: boolean;
  optionsOnly?: boolean;
  compact?: boolean;
};

export function DemoControls({
  demo,
  onChange,
  showBoth = false,
  optionsOnly = false,
  compact = false,
}: DemoControlsProps) {
  const field = compact ? compactFieldClass : textFieldClass;
  const visible = showBoth ? demo.options : [demo.options[0]];
  const taxes = taxChoices(demo.destination);

  function commit(next: DemoInput) {
    onChange(syncFreight(next));
  }

  function patch(next: Partial<DemoInput>) {
    commit({ ...demo, ...next });
  }

  function patchOption(index: 0 | 1, next: Partial<OptionInput>, resync: boolean) {
    const options = [...demo.options] as DemoInput["options"];
    options[index] = { ...options[index], ...next };
    const updated = { ...demo, options };
    onChange(resync ? syncFreight(updated) : updated);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {!optionsOnly && (
        <>
          <label className="block sm:col-span-2">
            <span className="mono-label">Product</span>
            <select className={field} value={demo.categoryId} onChange={(event) => patch({ categoryId: event.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label} · {category.hs6}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mono-label">Quantity</span>
            <input className={field} inputMode="numeric" value={demo.quantity} onChange={(event) => patch({ quantity: event.target.value })} />
          </label>
          <CountrySelect
            label="Destination"
            countries={destinations}
            value={demo.destination}
            compact={compact}
            onChange={(destination) => patch({ destination, vatChoice: defaultTaxChoice(destination) })}
          />
        </>
      )}
      {visible.map((option, index) => (
        <div key={option.label} className={showBoth ? "grid gap-4 sm:col-span-2 sm:grid-cols-3" : "contents"}>
          <CountrySelect
            label={showBoth ? `${option.label} origin` : "Origin"}
            countries={origins}
            value={option.origin}
            compact={compact}
            onChange={(origin) => patchOption(index as 0 | 1, { origin }, true)}
          />
          <label className="block">
            <span className="mono-label">{showBoth ? `${option.label} unit cost` : "Unit cost"}</span>
            <input
              className={field}
              inputMode="decimal"
              value={option.unitCost}
              onChange={(event) => patchOption(index as 0 | 1, { unitCost: event.target.value }, false)}
            />
          </label>
          <label className={`block ${showBoth ? "" : "sm:col-span-2"}`}>
            <span className="mono-label">{showBoth ? `${option.label} freight / unit` : "Freight estimate / unit"}</span>
            <input
              className={field}
              inputMode="decimal"
              value={option.freightPerUnit}
              onChange={(event) => patchOption(index as 0 | 1, { freightPerUnit: event.target.value, freightEdited: true }, false)}
            />
          </label>
        </div>
      ))}
      {!optionsOnly && (
        <>
          <label className="block">
            <span className="mono-label">Insurance estimate %</span>
            <input
              className={field}
              inputMode="decimal"
              value={demo.insurancePercent}
              onChange={(event) => patch({ insurancePercent: event.target.value })}
            />
          </label>
          {taxes.length > 1 ? (
            <label className="block">
              <span className="mono-label">Import tax</span>
              <select className={field} value={demo.vatChoice} onChange={(event) => patch({ vatChoice: event.target.value })}>
                {taxes.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="self-end pb-3 text-sm text-muted">{taxes[0]?.label}</p>
          )}
          <label className="flex items-start gap-3 rounded-2xl border border-line px-4 py-3 sm:col-span-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={demo.claimPreference}
              onChange={(event) => patch({ claimPreference: event.target.checked })}
            />
            <span>
              <span className="block text-sm font-medium">Assume the rules of origin are met</span>
              <span className="mt-1 block text-sm text-muted">
                Preferential rates apply only with proof of origin. Turn this off to use the MFN path. If no preferential rate is published, the MFN path is used anyway. A missing rate stays unavailable — it is not zero.
              </span>
            </span>
          </label>
        </>
      )}
    </div>
  );
}
