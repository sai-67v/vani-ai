import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth callback handler.
 * After Google OAuth, Supabase redirects to this route with a `code` param.
 * We exchange it for a session, set cookies, and redirect to /dashboard.
 */
export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error("[auth/callback] exchangeCodeForSession error:", error.message);
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
        }
    }

    return NextResponse.redirect(`${origin}/dashboard`);
}
