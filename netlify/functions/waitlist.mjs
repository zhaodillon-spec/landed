import { handleWaitlist } from "../../shared/waitlist.mjs";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json", Allow: "POST" },
    });
  }

  let body = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const result = await handleWaitlist(body, {
    webhookUrl: process.env.WAITLIST_WEBHOOK_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "content-type": "application/json" },
  });
}
