# Architecture

## High-Level Topology
The system consists of two distinct local services:
1. **Frontend (Dashboard)**: Next.js app running on Port 3000. It handles the UI, authentication flow, WebRTC client implementation, and displays analytics.
2. **Backend (Vani A.I. Engine)**: Express.js app running on Port 3001. It processes inbound and outbound Twilio calls, streams media to/from Twilio via WebSockets, and handles integration with AI models (Sarvam).

## Data Flow
- **WebRTC Calls**: The Next.js frontend fetches a short-lived access token from its own API route (`/api/twilio/token`). It uses the `@twilio/voice-sdk` to establish a WebRTC connection directly to Twilio.
- **Webhooks & Telephony**: When a call is initiated (either outbound from the dashboard or inbound from PSTN), Twilio hits the Express backend webhooks (exposed via ngrok). The backend instructs Twilio via TwiML to open a media stream.
- **Media Streaming**: Audio is streamed in real-time over WebSockets (`/stream`) to the backend, where it is analyzed and responded to.
- **Database Operations**: Supabase is used by both the frontend (for authenticated UI data fetching) and the backend (using the service role key for system-level operations like logging calls).
