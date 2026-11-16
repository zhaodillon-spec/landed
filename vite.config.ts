import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { handleWaitlist, normalizeWaitlist } from "./shared/waitlist.mjs";

function waitlistDevApi(env: Record<string, string>): Plugin {
  return {
    name: "landed-waitlist-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (path !== "/api/waitlist") {
          next();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          void (async () => {
            let body: unknown = null;
            try {
              body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "null");
            } catch {
              body = null;
            }
            const result = await handleWaitlist(body, {
              webhookUrl: env.WAITLIST_WEBHOOK_URL,
              supabaseUrl: env.SUPABASE_URL,
              supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
            });
            if (result.body.stored === "unconfigured") {
              const normalized = normalizeWaitlist(body);
              if (normalized.ok) {
                const dir = join(process.cwd(), "data");
                const file = join(dir, "waitlist.dev.json");
                mkdirSync(dir, { recursive: true });
                let current: unknown[] = [];
                try {
                  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
                  current = Array.isArray(parsed) ? parsed : [];
                } catch {
                  current = [];
                }
                current.push(normalized.entry);
                writeFileSync(file, `${JSON.stringify(current, null, 2)}\n`);
                result.body.stored = "dev-file";
              }
            }
            res.statusCode = result.status;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify(result.body));
          })();
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), waitlistDevApi(env)],
  };
});
