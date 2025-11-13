import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const TIMEOUT_MS = 15000;

const timedFetch: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: timedFetch },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
