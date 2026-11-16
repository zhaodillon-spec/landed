const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

export function normalizeWaitlist(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Missing signup." };
  }
  const email = clean(body.email, 200).toLowerCase();
  const brandName = clean(body.brandName, 120);
  if (!EMAIL.test(email)) return { ok: false, error: "Enter a valid email." };
  if (brandName.length < 1) return { ok: false, error: "Enter your brand name." };

  const role = clean(body.role, 80);
  const monthlyOrderVolume = clean(body.monthlyOrderVolume, 80);
  const sourcingFrom = clean(body.sourcingFrom, 200);

  return {
    ok: true,
    entry: {
      email,
      brandName,
      role: role || null,
      monthlyOrderVolume: monthlyOrderVolume || null,
      sourcingFrom: sourcingFrom || null,
      createdAt: new Date().toISOString(),
    },
  };
}

async function postJson(url, payload, headers) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  return response;
}

export async function handleWaitlist(body, env = {}) {
  if (body && typeof body === "object" && clean(body.companyWebsite, 200)) {
    return { status: 200, body: { ok: true, stored: "ignored" } };
  }

  const normalized = normalizeWaitlist(body);
  if (!normalized.ok) {
    return { status: 400, body: { ok: false, error: normalized.error } };
  }

  const entry = { ...normalized.entry, source: "landed-waitlist" };

  if (env.webhookUrl) {
    try {
      const response = await postJson(env.webhookUrl, entry);
      if (!response.ok) {
        return { status: 502, body: { ok: false, error: "The waitlist service didn't accept the signup." } };
      }
      return { status: 200, body: { ok: true, stored: "webhook" } };
    } catch {
      return { status: 502, body: { ok: false, error: "The waitlist service could not be reached." } };
    }
  }

  if (env.supabaseUrl && env.supabaseKey) {
    const row = {
      email: entry.email,
      brand_name: entry.brandName,
      role: entry.role,
      monthly_order_volume: entry.monthlyOrderVolume,
      sourcing_from: entry.sourcingFrom,
      created_at: entry.createdAt,
    };
    try {
      const response = await postJson(`${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/waitlist`, row, {
        apikey: env.supabaseKey,
        authorization: `Bearer ${env.supabaseKey}`,
        prefer: "return=minimal",
      });
      if (!response.ok) {
        return { status: 502, body: { ok: false, error: "Could not store the signup." } };
      }
      return { status: 200, body: { ok: true, stored: "supabase" } };
    } catch {
      return { status: 502, body: { ok: false, error: "Could not reach the database." } };
    }
  }

  return { status: 200, body: { ok: true, stored: "unconfigured" } };
}
