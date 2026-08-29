import { createClient } from "@supabase/supabase-js";

/** Read-only database client used by the public API routes. */
export function getPublicClient() {
  const url = process.env["VITE_SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
  const key =
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  return createClient(url as string, key as string, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { apikey: key as string } },
  });
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
