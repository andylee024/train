import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-only Supabase client. Reads keys from process.env at runtime. */
let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_KEY/SUPABASE_ANON_KEY in env. " +
        "Add them to web/dashboard/.env.local."
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: "public" },
  });
  return _client;
}

export const TRAIN_USER_ID = process.env.TRAIN_USER_ID ?? null;
