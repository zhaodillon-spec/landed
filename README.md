# Landed

Landed helps independent fashion brands source smarter by showing them what importing really costs before they commit.

This repo is a working product demo: a landing page, a landed-cost calculator, a supplier comparison, fictional reliability signals, and Tango, a rule-based explainer. The main call to action is the early-access waitlist.

The visual starting point was the concept site at [landedweb.base44.app](https://landedweb.base44.app). The calculator and comparison here actually compute. The concept site’s sample card used hand-rounded illustrations; this app’s numbers come from [`src/data/rates.json`](src/data/rates.json), so they will not match that card exactly.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm test          # calculator, rate-file, and waitlist checks
npm run build     # typecheck + production bundle
npm run preview   # serve the production bundle
```

## What’s real

- The page, the waitlist form, and the navigation.
- The calculator and comparison math in [`src/lib/calculate.ts`](src/lib/calculate.ts). Change unit cost, quantity, origin, destination, or product category and the breakdown updates.
- Country names and ISO-style codes for 74 apparel-exporting origins, plus four destinations: Canada, the United States, the United Kingdom, and the European Union as a bloc. Origin and destination pickers are searchable.
- Tango’s replies. They are rules over the current breakdown (duty share, which option lands lower, what the tax line includes, how freight was looked up). There is no language-model API.
- Waitlist submission. See below for where a signup is stored.

## What’s placeholder

Everything inside [`src/data/rates.json`](src/data/rates.json) is labelled placeholder data:

- MFN duty rates by HS-style product category and destination.
- Preferential overrides (named things like “CPTPP-style (placeholder)”). These are not official agreement rates and do not decide rules of origin.
- Import tax / VAT by destination, including a flat “EU VAT blend”.
- Ocean freight per piece and transit-day ranges.
- HS codes. They are file labels, not classification opinions.
- `demoReliability` on each origin. Fictional signals so the reliability panel has something to weigh. Not an audit, and not a judgment of manufacturers in that country.

`meta.dataStatus` is `"placeholder"` and `meta.disclaimer` is shown in the UI. `hello@example.com` in the footer is a stand-in address.

Do not ship these rates as tariff advice. A customs broker, the official schedule, and a freight quote are the real inputs.

### How a number is built

For an order:

1. Product = unit cost × quantity.
2. Freight = the category’s per-piece lane (origin region, or an `originOverrides` entry) × quantity.
3. Insurance = `insuranceRateOfProduct` × product.
4. Duty = rate × product cost, unless that category sets `dutyBasis` to `cif` (then the base is product + freight + insurance). The rate is the preferential override for that origin and destination if one exists, otherwise the MFN rate. The same country on both sides is treated as domestic, duty 0.
5. Import tax = destination rate × the tax base (`cif_plus_duty`, `cif`, or `product`).
6. Landed cost = product + freight + insurance + duty + tax. Per unit = landed cost ÷ quantity.

Worked example from the placeholder file: 200 woven shirts, $21, Portugal → Canada.

| Line | Amount | Why |
| --- | --- | --- |
| Product | $4,200 | 21 × 200 |
| Freight | $540 | $2.70 × 200, Southern Europe → Canada |
| Insurance | $21 | 0.5% of product |
| Duty | $714 | MFN 17% of product. No Portugal → Canada override is on file. |
| GST | $273.75 | 5% of product + freight + insurance + duty |
| Landed | $5,748.75 | $28.74 / unit |

Vietnam → Canada on the same order shape uses the CPTPP-style placeholder (9% instead of 17%) plus a longer, more expensive lane. The comparison page shows that tradeoff next to the fictional reliability profile.

## Replacing the rate file

[`src/data/rates.json`](src/data/rates.json) is the only rate table. Drop researched values in without renaming keys. The shape:

- `meta` — set `dataStatus` (for example `"researched"`), rewrite `disclaimer`, and set `asOf`.
- `destinations` — markets the calculator can land into.
- `origins` — at least the countries you want in the picker. `region` must match a freight region. `demoReliability` can stay fictional or be removed from the UI later; the calculator does not use it for money.
- `categories[]` — one object per product group:
  - `mfnByDestination` — ad valorem duty (0.17 means 17%) for every destination.
  - `preferentialOverrides` — only the origin/destination pairs that should not use MFN. Omit a pair to keep MFN.
  - `importTaxByDestination` — name, rate, `basis` (`cif_plus_duty`, `cif`, or `product`), and a note.
  - `freightEstimates.byOriginRegion` — per-piece USD and a `[minDays, maxDays]` range for every origin region and destination.
  - `freightEstimates.originOverrides` — optional per-country lanes that replace the region lane.
  - `dutyBasis` — `fob_product` or `cif`.

`src/lib/rates.ts` checks the file on startup (50+ origins, every destination has MFN and tax, every origin region has a freight lane, preferences point at known countries). A bad file fails the build’s tests and the running app.

[`scripts/generate-placeholder-rates.mjs`](scripts/generate-placeholder-rates.mjs) rewrote the placeholder file. Do not run it once real rates are in the JSON. It overwrites the file.

## Waitlist storage

The form posts JSON to `POST /api/waitlist`:

```json
{
  "email": "ada@atelier.example",
  "brandName": "Atelier Ada",
  "role": "Founder",
  "monthlyOrderVolume": "200–1,000",
  "sourcingFrom": "Portugal and India",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

`role`, `monthlyOrderVolume`, and `sourcingFrom` are optional. A hidden honeypot field named `companyWebsite` is discarded.

Where it goes:

1. **Webhook (preferred).** Set `WAITLIST_WEBHOOK_URL` to any HTTPS endpoint that accepts that JSON POST (Zapier, Make, a Slack workflow, your own API). The serverless function forwards the body and returns `stored: "webhook"`.
2. **Supabase.** Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server only — never a `VITE_` variable). The function inserts into `waitlist`:

   ```sql
   create table public.waitlist (
     id bigint generated always as identity primary key,
     email text not null,
     brand_name text not null,
     role text,
     monthly_order_volume text,
     sourcing_from text,
     created_at timestamptz not null default now()
   );

   alter table public.waitlist enable row level security;
   ```

   The service role key bypasses RLS. Don’t expose it to the browser. Returns `stored: "supabase"`. Webhook wins if both are set.

3. **Local dev, no env vars.** `npm run dev` appends signups to `data/waitlist.dev.json` (gitignored) and the browser also keeps a copy in `localStorage` under `landed.waitlist.v1`.
4. **Production with neither backend set, or the API unreachable.** The UI still shows Tango’s success state, and says the signup stayed on this device. Configure a webhook or Supabase before you treat the list as real.

Copy [`.env.example`](.env.example) to `.env` for local secrets. Vite loads it for the dev API only. On Vercel or Netlify, set the same names in the project’s environment settings.

## Deploy

The app is a static Vite build plus one small function. No database is required if you use a webhook.

### Vercel

1. Import the repo. Framework preset: Vite. Build command `npm run build`, output `dist`. [`vercel.json`](vercel.json) already says this.
2. [`api/waitlist.js`](api/waitlist.js) is the serverless function for `/api/waitlist`.
3. Add `WAITLIST_WEBHOOK_URL` or the two Supabase variables, then redeploy.

### Netlify

1. New site from the repo. [`netlify.toml`](netlify.toml) sets the build, publishes `dist`, and redirects `/api/*` to `netlify/functions`.
2. Add the same environment variables. Netlify runs [`netlify/functions/waitlist.mjs`](netlify/functions/waitlist.mjs).

`npm run build` must succeed before you deploy. The function is not part of the Vite bundle; the host runs it separately.
