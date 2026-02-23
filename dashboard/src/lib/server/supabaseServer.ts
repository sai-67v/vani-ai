import { createClient } from "@supabase/supabase-js";

const serviceUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Server-side Supabase client using the service role key.
 * Returns null when env vars are missing so callers can gracefully noop.
 */
export function getSupabaseServer() {
    if (!serviceUrl || !serviceKey) return null;
    return createClient(serviceUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}
