import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Browser-safe Supabase client using the ANON key.
 * Row-Level Security on the Supabase side controls what this can read.
 *
 * If env vars are missing (e.g., Agent A hasn't deployed yet),
 * queries will fail and the app will fall back to mock data.
 */
export const supabase = url && key ? createClient(url, key) : null;
