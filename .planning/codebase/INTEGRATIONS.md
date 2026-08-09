# Integrations

## Twilio
- **Purpose**: Voice calling, WebRTC frontend connection, media streaming.
- **Components**:
  - Outbound/Inbound webhooks (`/api/twilio/voice`, `/api/twilio/outbound`).
  - Access Token generation for WebRTC client (`/api/twilio/token`).
  - TwiML App integration for routing.
- **SDKs**: `twilio` (backend), `@twilio/voice-sdk` (frontend).

## Supabase
- **Purpose**: Relational database, user authentication, and storage.
- **Features Used**:
  - PostgreSQL DB (schemas for `calls`, `insights`, etc.).
  - Supabase Auth (Service role for backend, SSR for Next.js).
  - Supabase Storage.

## Sarvam AI
- **Purpose**: AI processing, presumably for voice translation, analysis, or generation.
- **SDK**: `sarvamai`

## ngrok / Localtunnel
- **Purpose**: Exposing the local backend to public URLs for Twilio webhooks.
- **Usage**: Handled via `PUBLIC_BASE_URL` in environment variables.
