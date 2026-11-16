import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { countryMatches } from "../lib/countries";
import { cn } from "../lib/cn";
import { compactFieldClass, flagEmoji, textFieldClass } from "../lib/format";
import { Tango } from "./Tango";

export type CountryOption = {
  code: string;
  name: string;
  region?: string;
  aliases?: string[];
};

type CountrySelectProps = {
  label: string;
  countries: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  compact?: boolean;
};

export function CountrySelect({ label, countries, value, onChange, compact = false }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = countries.find((country) => country.code === value) ?? countries[0];

  const filtered = useMemo(
    () => countries.filter((country) => countryMatches(country, query)),
    [countries, query],
  );

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  function choose(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const next = filtered[active];
      if (next) choose(next.code);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="mono-label" id={`${listId}-label`}>
        {label}
      </span>
      <button
        type="button"
        className={cn(compact ? compactFieldClass : textFieldClass, "flex items-center justify-between gap-3 text-left")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">
          <span className="mr-2" aria-hidden>
            {selected ? flagEmoji(selected.code) : ""}
          </span>
          {selected?.name ?? "Choose a country"}
        </span>
        <span className="text-muted" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[240px] overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="border-b border-line p-2">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search by country or code"
              className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-primary"
              role="combobox"
              aria-controls={listId}
              aria-expanded={open}
              aria-autocomplete="list"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="flex items-center gap-3 px-3 py-4 text-sm text-muted">
                <Tango ambient={false} className="h-10 w-10 shrink-0" />
                No country matches that.
              </li>
            )}
            {filtered.map((country, index) => (
              <li key={country.code} role="option" aria-selected={country.code === value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-mist",
                    index === active && "bg-mist",
                    country.code === value && "text-primary",
                  )}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(country.code)}
                >
                  <span className="truncate">
                    <span className="mr-2" aria-hidden>
                      {flagEmoji(country.code)}
                    </span>
                    {country.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                    {country.region ?? country.code}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
