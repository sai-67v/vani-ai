import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client with cookie-based session management.
 * Use this in Client Components and client-side auth flows.
 */
export function createClient() {
    return createBrowserClient(url, key);
}
