const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn("[supabase/admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const db = url && key ? createClient(url, key) : null;

module.exports = { db };
