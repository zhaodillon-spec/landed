import type { DemoInput, OptionInput } from "../lib/calculate";
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

  function patch(next: Partial<DemoInput>) {
    onChange({ ...demo, ...next });
  }

  function patchOption(index: 0 | 1, next: Partial<OptionInput>) {
    const options = [...demo.options] as DemoInput["options"];
    options[index] = { ...options[index], ...next };
    onChange({ ...demo, options });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {!optionsOnly && (
        <>
          <label className="block sm:col-span-2">
            <span className="mono-label">Product</span>
            <select
              className={field}
              value={demo.categoryId}
              onChange={(event) => patch({ categoryId: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} · HS {category.hsCode}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mono-label">Quantity</span>
            <input
              className={field}
              inputMode="numeric"
              value={demo.quantity}
              onChange={(event) => patch({ quantity: event.target.value })}
            />
          </label>
          <CountrySelect
            label="Destination"
            countries={destinations}
            value={demo.destination}
            compact={compact}
            onChange={(destination) => patch({ destination })}
          />
        </>
      )}
      {visible.map((option, index) => (
        <div key={option.label} className="contents">
          <CountrySelect
            label={showBoth ? `${option.label} origin` : "Origin"}
            countries={origins}
            value={option.origin}
            compact={compact}
            onChange={(origin) => patchOption(index as 0 | 1, { origin })}
          />
          <label className="block">
            <span className="mono-label">{showBoth ? `${option.label} unit cost` : "Unit cost"}</span>
            <input
              className={field}
              inputMode="decimal"
              value={option.unitCost}
              onChange={(event) => patchOption(index as 0 | 1, { unitCost: event.target.value })}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
