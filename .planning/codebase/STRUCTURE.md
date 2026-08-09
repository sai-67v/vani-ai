# Structure

## Root Workspace (`c:\Users\DELL\Documents\voice`)
This is the root of the backend Express.js application and the main git repository.
- `src/`: Backend source code.
  - `src/index.js`: Main Express/WebSocket server entry point.
  - `src/index.test.js`: Main backend test file.
  - `src/lib/`: Core backend logic (Supabase client, logger, environment vars, call store, voice analysis).
  - `src/routes/`: Express route definitions.
- `package.json`: Backend dependencies.
- `.planning/`: GSD workflow planning, map, and context directory.
- `*.sql`: Database schema definitions and migrations.

## Dashboard Directory (`c:\Users\DELL\Documents\voice\dashboard`)
This contains the Next.js frontend application.
- `src/app/`: Next.js App Router directories.
  - `(marketing)/`, `(dashboard)/`: Route groups for organized layouts.
  - `api/`: Next.js serverless API routes (e.g., Twilio token generation).
  - `globals.css`: Global styles including a custom design system with dual `@layer base` setups.
- `src/components/`: Reusable React components.
- `src/lib/`: Frontend utilities, types, mock data, API wrappers, and Supabase SSR clients.
- `src/middleware.ts`: Next.js middleware for authentication route protection.
- `package.json`: Frontend dependencies.
