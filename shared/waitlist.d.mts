export type WaitlistEnv = {
  webhookUrl?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
};

export type WaitlistResult = {
  status: number;
  body: {
    ok: boolean;
    stored?: string;
    error?: string;
  };
};

export function handleWaitlist(body: unknown, env?: WaitlistEnv): Promise<WaitlistResult>;

export function normalizeWaitlist(
  body: unknown,
): { ok: true; entry: Record<string, string | null> } | { ok: false; error: string };
