const { createClient } = require("@supabase/supabase-js");

/**
 * Supabase client using SERVICE_ROLE key — server-only, never expose to client.
 * Lazy initialization: if env vars are missing, returns a no-op stub that
 * logs warnings instead of crashing. This lets you test webhook routing
 * locally without a Supabase project.
 */
let _supabase = null;

function getSupabase() {
    if (_supabase) return _supabase;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.warn("⚠️  Supabase not configured — DB operations will be no-ops.");
        _supabase = new Proxy(
            {},
            {
                get(_target, prop) {
                    if (prop === "from") {
                        return () => createNoOpChain();
                    }
                    return () => createNoOpChain();
                },
            }
        );
        return _supabase;
    }

    _supabase = createClient(url, key, {
        auth: { persistSession: false },
    });
    return _supabase;
}

/** Returns a chainable no-op that resolves { data: null, error: null } */
function createNoOpChain() {
    const result = { data: null, error: null };
    const chain = new Proxy(
        {},
        {
            get(_target, prop) {
                if (prop === "then") {
                    return (resolve) => resolve(result);
                }
                return () => chain;
            },
        }
    );
    return chain;
}

module.exports = {
    get supabase() {
        return getSupabase();
    },
};
