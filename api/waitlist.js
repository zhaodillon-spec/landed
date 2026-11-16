import { handleWaitlist } from "../shared/waitlist.mjs";

function envFrom(processEnv) {
  return {
    webhookUrl: processEnv.WAITLIST_WEBHOOK_URL,
    supabaseUrl: processEnv.SUPABASE_URL,
    supabaseKey: processEnv.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const result = await handleWaitlist(body, envFrom(process.env));
  res.status(result.status).json(result.body);
}
