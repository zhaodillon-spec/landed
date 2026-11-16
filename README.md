# Landed

Landed helps independent fashion brands source smarter by showing them what importing really costs before they commit.

This repo is a working product demo: a landing page, a landed-cost calculator, a supplier comparison, fictional reliability signals, and Tango, a rule-based explainer. The main call to action is the early-access waitlist.

The visual starting point was the concept site at [landedweb.base44.app](https://landedweb.base44.app). Duty and tax now come from [`src/data/tariffs.json`](src/data/tariffs.json) (official schedules as of 15 Nov 2026). Freight is an editable estimate because the dataset does not include it.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm test          # calculator, tariff-file, and waitlist checks
npm run build     # typecheck + production bundle
npm run preview   # serve the production bundle
```

## What’s from the schedules

Duty, import tax, de minimis notes, and source links come from [`src/data/tariffs.json`](src/data/tariffs.json), as of **15 Nov 2026**. Coverage is 62 origin countries, four destinations (Canada, the United States, the United Kingdom, the European Union), and nine apparel categories. The in-app sources page credits CBSA, USITC, the UK Trade Tariff, and the EU tariff as published for Northern Ireland, and lists the dataset’s caveats.

Lookup is `rates[category][origin][destination]`:

- Default path: `effective_rate_preferential_path`, and only while “Assume the rules of origin are met” is checked.
- If that value is null, or the box is unchecked, the calculator uses `effective_rate_mfn_path`.
- `domestic: true` (same customs territory, including intra-EU) is zero import duty and no import tax.
- If the effective rate in use is null, the duty line says **rate unavailable**. It is not treated as 0%, and the landed total stays incomplete.
- Rates in the file are percent points (`17` means 17%).

Canada GST defaults to 5% on product cost plus duty. The form can switch to the HST rates in the file. EU VAT defaults to 21%, with the listed member-state rates as options. The UK rate is 20% on the CIF stand-in plus duty. The United States has no federal import VAT; the estimate adds the dataset’s MPF and an ocean HMF, both labelled as fees.

De minimis text is shown beside the result. It is not applied automatically, because the thresholds depend on channel, origin, and whether the shipment is a consumer parcel or a production order.

## What’s still an estimate

- **Freight and insurance.** The tariff file leaves freight null. The form starts with a labelled starter from [`src/lib/freightEstimate.ts`](src/lib/freightEstimate.ts). Type over it. Transit ranges in the comparison are the same kind of starter, not sailings.
- **Reliability dots.** Fictional, so the panel has signals to weigh. Not an audit of factories in that country.
- **Tango.** Rules over the current breakdown. No language-model API.
- **hello@example.com.** A stand-in address.

These estimates are not customs advice. A different fibre, gender, value band, or weight can change the tariff line.

### How a number is built

1. Product = unit cost × quantity.
2. Freight = the per-unit figure in the form × quantity. Insurance = the insurance percent × product.
3. Duty base is product cost for Canada and the United States, and product + freight + insurance for the UK and the EU.
4. Duty = that base × the selected effective rate. An unavailable rate stops the total.
5. Import tax follows the destination note in the file (Canada: product + duty; UK and EU: CIF stand-in + duty).
6. Landed cost = product + freight + insurance + duty + tax + US fees, when every required rate is present.

Worked example, rules of origin on, starter freight $2.70 and insurance 0.5%: 200 linen shirts, $21, Portugal → Canada. The schedule’s CETA preferential path is 0% (MFN path 18%).

| Line | Amount | Why |
| --- | --- | --- |
| Product | $4,200 | 21 × 200 |
| Freight | $540 | $2.70 × 200, your estimate |
| Insurance | $21 | 0.5% of product, your estimate |
| Duty | $0 | Preferential path 0% |
| GST | $210 | 5% of product + duty |
| Landed | $4,971 | $24.86 / unit |

Turn the rules-of-origin box off and the same lane uses the 18% MFN path: duty $756, GST $247.80, landed $5,764.80. United States → Canada is null in the file for these lines, so the duty reads “rate unavailable” rather than $0.

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
