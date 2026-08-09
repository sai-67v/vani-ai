# Codebase Conventions

## Frontend (Dashboard)
- **Language**: TypeScript (`.ts`, `.tsx`).
- **Styling**: Tailwind CSS classes with CSS variables defined in `src/app/globals.css`.
- **Component Design**: Uses Radix UI primitives, Lucide React icons, and `framer-motion` for animations.
- **Routing**: Next.js App Router with logical grouping using parentheses (`(dashboard)`, `(marketing)`).
- **Environment Variables**: Frontend variables exposed to the browser must be prefixed with `NEXT_PUBLIC_`. Private keys are handled server-side only in Next.js API routes or middleware.

## Backend (Vani A.I. Engine)
- **Language**: ES6+ JavaScript (`.js`).
- **Module System**: CommonJS (`require` / `module.exports`).
- **Validation**: Strict schema validation using `zod`.
- **Error Handling**: Standardized error handling modules in `src/lib/errors.js`.
- **Logging**: Custom JSON logger in `src/lib/logger.js`.
- **Async Pattern**: Async/await for promise-based flows.
