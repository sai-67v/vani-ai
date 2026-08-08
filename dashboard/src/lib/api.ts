/**
 * dashboard/src/lib/api.ts
 * Type-safe API client for backend communication.
 * Skill: nextjs-best-practices — "Data Fetching & API Client"
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

export interface CallInsight {
  callId: string;
  leadLabel: string;
  language: string;
  emotions: string[];
  summary: string;
  transcript: string;
  hasTranscript: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  async getCalls(): Promise<CallInsight[]> {
    const res = await fetch(`${API_BASE_URL}/calls`, {
      next: { revalidate: 0 }, // always fetch fresh for dashboard
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || [];
  },

  async triggerCall(to: string): Promise<{ callSid: string }> {
    const res = await fetch(`${API_BASE_URL}/twilio/outbound`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Failed to trigger call");
    }
    return data;
  },
};
