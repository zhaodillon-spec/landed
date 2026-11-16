import { useState, type FormEvent } from "react";
import { submitWaitlist } from "../lib/waitlistClient";
import { textFieldClass } from "../lib/format";
import { Tango } from "./Tango";

const roles = ["Founder", "Designer", "Sourcing / production", "Finance", "Other"];
const volumes = ["Just sampling", "Under 200 units", "200–1,000", "1,000–5,000", "5,000+"];

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "done"; brand: string; email: string; stored?: string }
  | { kind: "error"; message: string };

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [role, setRole] = useState("");
  const [monthlyOrderVolume, setMonthlyOrderVolume] = useState("");
  const [sourcingFrom, setSourcingFrom] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ kind: "error", message: "Enter a valid email." });
      return;
    }
    if (!brandName.trim()) {
      setStatus({ kind: "error", message: "Enter your brand name." });
      return;
    }
    setStatus({ kind: "saving" });
    const result = await submitWaitlist({
      email: email.trim(),
      brandName: brandName.trim(),
      role,
      monthlyOrderVolume,
      sourcingFrom: sourcingFrom.trim(),
      companyWebsite,
    });
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error || "Something went wrong." });
      return;
    }
    setStatus({ kind: "done", brand: brandName.trim(), email: email.trim(), stored: result.stored });
  }

  if (status.kind === "done") {
    return (
      <div className="text-center" role="status">
        <Tango dance className="mx-auto h-28 w-28" title="Tango" />
        <h3 className="mt-4 font-heading text-4xl tracking-[-0.02em]">You’re on the list.</h3>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Tango saved a seat for {status.brand}. We’ll write to {status.email} when early access opens.
        </p>
        <StorageNote stored={status.stored} />
        <button
          type="button"
          className="mt-6 text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setStatus({ kind: "idle" });
            setEmail("");
            setBrandName("");
            setRole("");
            setMonthlyOrderVolume("");
            setSourcingFrom("");
          }}
        >
          Add another brand
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <label className="block">
        <span className="mono-label">Email</span>
        <input
          type="email"
          required
          maxLength={200}
          placeholder="you@yourbrand.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={textFieldClass}
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="mono-label">Brand name</span>
        <input
          type="text"
          required
          maxLength={120}
          placeholder="Your label"
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
          className={textFieldClass}
          autoComplete="organization"
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mono-label">Role (optional)</span>
          <select className={textFieldClass} value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">Choose one</option>
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mono-label">Monthly volume (optional)</span>
          <select
            className={textFieldClass}
            value={monthlyOrderVolume}
            onChange={(event) => setMonthlyOrderVolume(event.target.value)}
          >
            <option value="">Choose one</option>
            {volumes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mono-label">Where you source from (optional)</span>
        <input
          type="text"
          maxLength={200}
          placeholder="Portugal, India, a factory name…"
          value={sourcingFrom}
          onChange={(event) => setSourcingFrom(event.target.value)}
          className={textFieldClass}
        />
      </label>
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        Company website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
        />
      </label>
      {status.kind === "error" && <p className="text-sm text-red-700">{status.message}</p>}
      <button type="submit" className="btn-primary w-full" disabled={status.kind === "saving"}>
        {status.kind === "saving" ? "Sending…" : "Get early access"}
      </button>
    </form>
  );
}

function StorageNote({ stored }: { stored?: string }) {
  if (stored === "webhook" || stored === "supabase" || stored === "ignored") return null;
  const message =
    stored === "dev-file"
      ? "Saved on this machine in data/waitlist.dev.json. Connect a webhook before you deploy."
      : "The waitlist service isn’t connected yet, so Tango kept this signup on this device only.";
  return <p className="mt-4 text-sm text-muted">{message}</p>;
}

export function WaitlistSection() {
  return (
    <section id="waitlist" className="scroll-mt-24 px-3 pb-6 md:px-6">
      <div className="relative overflow-hidden rounded-[40px] bg-mist md:rounded-[56px]">
        <div aria-hidden className="absolute -left-28 -top-28 h-80 w-80 rounded-full border border-primary/15" />
        <div aria-hidden className="absolute -left-16 -top-16 h-56 w-56 rounded-full border border-primary/15" />
        <div className="relative mx-auto grid max-w-page items-center gap-12 px-5 py-16 md:px-10 md:py-28 lg:grid-cols-2 lg:gap-20">
          <div>
            <Tango dance className="h-24 w-24" />
            <h2 className="mt-6 font-heading text-4xl leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              Be among the first to <em className="text-primary">source smarter.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              We’re building this for independent fashion brands. Join the early-access list and help shape what comes next.
            </p>
          </div>
          <div className="rounded-[32px] bg-white p-6 shadow-[0_32px_70px_-40px_rgba(0,71,171,0.55)] sm:p-10">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
