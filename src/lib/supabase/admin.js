const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let db;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ [Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Operating in mock mode.");

    // Stub client to prevent crashes if env isn't fully configured
    db = {
        storage: {
            from: (bucket) => ({
                upload: async () => ({ data: { path: "mock-url.wav" }, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: "http://mock.audio/file.wav" } })
            })
        },
        from: (table) => ({
            insert: async () => ({ error: null }),
            upsert: async () => ({ error: null }),
            update: async () => ({ error: null })
        })
    };
} else {
    db = createClient(supabaseUrl, supabaseKey);
}

module.exports = { db };
