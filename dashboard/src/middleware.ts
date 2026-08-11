import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Next.js middleware — runs on every matched request.
 * 1. Skips auth for the public landing page (/).
 * 2. Gracefully degrades when Supabase creds are absent (local dev).
 * 3. Refreshes the Supabase session (required by @supabase/ssr).
 * 4. Protects /dashboard — redirects to /login if not authenticated.
 * 5. Redirects /login → /dashboard if already authenticated.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Public routes — no auth needed ────────────────────────────────────
    // The root landing page (/) is intentionally unauthenticated.
    if (pathname === "/") {
        return NextResponse.next({ request });
    }

    // ── Guard: if Supabase creds are missing, let the request through ──────
    // Prevents a hard crash in local dev when env vars are not set.
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // IMPORTANT: do not run any logic between createServerClient and
    // supabase.auth.getUser() — it would invalidate the session.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Unauthenticated user trying to access /dashboard
    if (!user && pathname.startsWith("/dashboard")) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated user landing on /login — send to dashboard
    if (user && pathname === "/login") {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - auth/callback (the OAuth redirect handler itself)
         */
        "/((?!_next/static|_next/image|favicon.ico|auth/callback).*)",
    ],
};
