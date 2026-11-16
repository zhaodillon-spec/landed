export type WaitlistPayload = {
  email: string;
  brandName: string;
  role: string;
  monthlyOrderVolume: string;
  sourcingFrom: string;
  companyWebsite?: string;
};

export type WaitlistOutcome = {
  ok: boolean;
  stored?: string;
  error?: string;
};

const STORAGE_KEY = "landed.waitlist.v1";

function saveLocal(payload: WaitlistPayload) {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as unknown[];
    const list = Array.isArray(current) ? current : [];
    list.push({
      email: payload.email,
      brandName: payload.brandName,
      role: payload.role || null,
      monthlyOrderVolume: payload.monthlyOrderVolume || null,
      sourcingFrom: payload.sourcingFrom || null,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Private mode can block storage. The caller still shows a success state.
  }
}

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistOutcome> {
  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as WaitlistOutcome | null;
    if (!response.ok || !data?.ok) {
      return { ok: false, error: data?.error || "Something went wrong. Try again in a moment." };
    }
    if (data.stored === "dev-file" || data.stored === "unconfigured" || data.stored === "local") {
      saveLocal(payload);
    }
    return { ok: true, stored: data.stored };
  } catch {
    saveLocal(payload);
    return { ok: true, stored: "local" };
  }
}
