# Codebase Concerns & Technical Debt

## Known Issues & Gotchas
1. **Port Collisions / Zombie Processes**: Running `npm run dev` in the root runs the backend engine on port 3001, whereas the frontend runs on port 3000 in `dashboard/`. Stale Node.js dev processes on port 3000 can cause `EADDRINUSE` errors or serve cached, failing endpoints.
2. **Environment Variable Duplication**: Environment variables exist in both root `.env` and `dashboard/.env.local`. Twilio secrets need to be kept consistent across both files.
3. **CSS Formatting**: `globals.css` in the dashboard previously suffered from duplicated/corrupted `@layer base` blocks, which can reoccur if CSS files are edited via unverified automated patches.
4. **Local Webhooks**: Twilio webhooks require a publicly accessible URL via ngrok (`PUBLIC_BASE_URL`). If the ngrok session expires or changes, webhooks will fail until the environment variable is updated.
5. **Deprecated Package Warning**: Legacy CLI commands using `get-shit-done-cc` are deprecated upstream on npm.

## Mitigation Strategies
- Ensure processes on ports 3000 and 3001 are properly stopped before re-running dev servers (`netstat` / `taskkill`).
- Verify `.env.local` contents whenever Twilio or Supabase credentials change.
- Keep frontend and backend terminal sessions running concurrently in separate windows.
