// ─────────────────────────────────────────────
// MOCK DATA — exact same shape as Supabase schema
// Used as fallback when backend isn't ready yet
// ─────────────────────────────────────────────
import type { Call, Transcript, CallbackQueueItem } from "./types";

export const MOCK_CALLS: Call[] = [
    {
        id: "a1b2c3d4-0001-0001-0001-000000000001",
        provider_call_id: "call_vapi_001",
        assistant_id: "asst_demo",
        customer_number: "+1 (415) 555-0101",
        status: "ended",
        outcome: "callback",
        lead_score: 90,
        started_at: "2026-02-23T08:05:00Z",
        ended_at: "2026-02-23T08:11:42Z",
        summary:
            "Priya is evaluating enterprise CRM options. Very interested in a live demo. High-intent buyer — asked about pricing and integrations.",
        cost: 0.051,
        duration_seconds: 402,
        created_at: "2026-02-23T08:05:00Z",
    },
    {
        id: "a1b2c3d4-0002-0002-0002-000000000002",
        provider_call_id: "call_vapi_002",
        assistant_id: "asst_demo",
        customer_number: "+1 (212) 555-0202",
        status: "ended",
        outcome: "callback",
        lead_score: 75,
        started_at: "2026-02-23T08:30:00Z",
        ended_at: "2026-02-23T08:34:28Z",
        summary:
            "Rahul asked about team pricing for a 20-person startup. Wants to compare against Salesforce. Callback requested before end of week.",
        cost: 0.032,
        duration_seconds: 268,
        created_at: "2026-02-23T08:30:00Z",
    },
    {
        id: "a1b2c3d4-0003-0003-0003-000000000003",
        provider_call_id: "call_vapi_003",
        assistant_id: "asst_demo",
        customer_number: "+44 20 7946 0303",
        status: "ended",
        outcome: "completed",
        lead_score: 60,
        started_at: "2026-02-23T09:00:00Z",
        ended_at: "2026-02-23T09:03:15Z",
        summary:
            "Sophie asked about GDPR compliance features. Will forward information to their IT team. Warm lead – might re-engage in 2 weeks.",
        cost: 0.024,
        duration_seconds: 195,
        created_at: "2026-02-23T09:00:00Z",
    },
    {
        id: "a1b2c3d4-0004-0004-0004-000000000004",
        provider_call_id: "call_vapi_004",
        assistant_id: "asst_demo",
        customer_number: "+91 98765 40404",
        status: "ended",
        outcome: "completed",
        lead_score: 35,
        started_at: "2026-02-23T09:15:00Z",
        ended_at: "2026-02-23T09:16:22Z",
        summary:
            "Arjun was looking for a job application platform, wrong product. Redirected to support team.",
        cost: 0.011,
        duration_seconds: 82,
        created_at: "2026-02-23T09:15:00Z",
    },
    {
        id: "a1b2c3d4-0005-0005-0005-000000000005",
        provider_call_id: "call_vapi_005",
        assistant_id: "asst_demo",
        customer_number: "+1 (650) 555-0505",
        status: "ended",
        outcome: "callback",
        lead_score: 85,
        started_at: "2026-02-23T09:45:00Z",
        ended_at: "2026-02-23T09:53:20Z",
        summary:
            "Maria is the CTO of a 200-person SaaS company. Wants API access and SSO. Urgent — evaluating 3 vendors this week. Top priority.",
        cost: 0.064,
        duration_seconds: 500,
        created_at: "2026-02-23T09:45:00Z",
    },
    {
        id: "a1b2c3d4-0006-0006-0006-000000000006",
        provider_call_id: "call_vapi_006",
        assistant_id: "asst_demo",
        customer_number: "+1 (310) 555-0606",
        status: "ended",
        outcome: "completed",
        lead_score: 50,
        started_at: "2026-02-23T10:00:00Z",
        ended_at: "2026-02-23T10:04:45Z",
        summary:
            "Daniel asked general questions about product features. Requested email follow-up with feature comparison sheet.",
        cost: 0.035,
        duration_seconds: 285,
        created_at: "2026-02-23T10:00:00Z",
    },
    {
        id: "a1b2c3d4-0007-0007-0007-000000000007",
        provider_call_id: "call_vapi_007",
        assistant_id: "asst_demo",
        customer_number: "+1 (617) 555-0707",
        status: "ended",
        outcome: "customer-ended-call",
        lead_score: 20,
        started_at: "2026-02-23T10:20:00Z",
        ended_at: "2026-02-23T10:20:48Z",
        summary: "Caller ended the call shortly after greeting. No interest expressed.",
        cost: 0.006,
        duration_seconds: 48,
        created_at: "2026-02-23T10:20:00Z",
    },
    {
        id: "a1b2c3d4-0008-0008-0008-000000000008",
        provider_call_id: "call_vapi_008",
        assistant_id: "asst_demo",
        customer_number: "+49 30 5544 0808",
        status: "ended",
        outcome: "callback",
        lead_score: 80,
        started_at: "2026-02-23T10:30:00Z",
        ended_at: "2026-02-23T10:36:55Z",
        summary:
            "Klaus is evaluating the platform for his logistics company. Interested in bulk data import and BI integrations. Callback requested.",
        cost: 0.052,
        duration_seconds: 415,
        created_at: "2026-02-23T10:30:00Z",
    },
    {
        id: "a1b2c3d4-0009-0009-0009-000000000009",
        provider_call_id: "call_vapi_009",
        assistant_id: "asst_demo",
        customer_number: "+1 (404) 555-0909",
        status: "ended",
        outcome: "completed",
        lead_score: 45,
        started_at: "2026-02-23T10:50:00Z",
        ended_at: "2026-02-23T10:53:12Z",
        summary:
            "Aaliyah is a consultant researching options for a client. Will share information internally before scheduling a demo.",
        cost: 0.026,
        duration_seconds: 192,
        created_at: "2026-02-23T10:50:00Z",
    },
    {
        id: "a1b2c3d4-0010-0010-0010-000000000010",
        provider_call_id: "call_vapi_010",
        assistant_id: "asst_demo",
        customer_number: "+1 (512) 555-1010",
        status: "in-progress",
        outcome: null,
        lead_score: null,
        started_at: "2026-02-23T11:04:00Z",
        ended_at: null,
        summary: null,
        cost: null,
        duration_seconds: null,
        created_at: "2026-02-23T11:04:00Z",
    },
];

export const MOCK_TRANSCRIPTS: Record<string, Transcript[]> = {
    "a1b2c3d4-0001-0001-0001-000000000001": [
        { id: "t-001-1", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "assistant", text: "Hello! Thanks for reaching out to us today. How can I help you?", ts: "2026-02-23T08:05:03Z" },
        { id: "t-001-2", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "user", text: "Hi, I'm evaluating CRM solutions for my enterprise team of around 150 people.", ts: "2026-02-23T08:05:10Z" },
        { id: "t-001-3", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "assistant", text: "That sounds like a great fit for our platform! We have specific enterprise plans with dedicated onboarding. Could I ask what your main pain points are with your current setup?", ts: "2026-02-23T08:05:22Z" },
        { id: "t-001-4", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "user", text: "We're struggling with data silos between our sales and support teams. We also need custom reporting and API integrations.", ts: "2026-02-23T08:05:45Z" },
        { id: "t-001-5", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "assistant", text: "We solve exactly that. Our API is fully documented and we support custom dashboards. Would you like to schedule a live demo with one of our enterprise specialists?", ts: "2026-02-23T08:06:10Z" },
        { id: "t-001-6", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "user", text: "Yes, absolutely. And I'd like to know about pricing — we're comparing you against Salesforce and HubSpot.", ts: "2026-02-23T08:06:35Z" },
        { id: "t-001-7", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "assistant", text: "Our enterprise pricing starts at competitive rates with volume discounts. A specialist will prepare a tailored quote for you. I'll get your callback scheduled right away.", ts: "2026-02-23T08:07:00Z" },
        { id: "t-001-8", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "user", text: "Perfect. My name is Priya Sharma, you can reach me at this number.", ts: "2026-02-23T08:07:20Z" },
        { id: "t-001-9", call_id: "a1b2c3d4-0001-0001-0001-000000000001", speaker: "assistant", text: "Thank you, Priya! I've scheduled your callback. Our team will reach out within 24 hours. Have a great day!", ts: "2026-02-23T08:07:35Z" },
    ],
    "a1b2c3d4-0005-0005-0005-000000000005": [
        { id: "t-005-1", call_id: "a1b2c3d4-0005-0005-0005-000000000005", speaker: "assistant", text: "Hello! Thanks for calling. How can I assist you today?", ts: "2026-02-23T09:45:05Z" },
        { id: "t-005-2", call_id: "a1b2c3d4-0005-0005-0005-000000000005", speaker: "user", text: "Hi, I'm Maria, CTO at ScaleUp SaaS. We have 200 employees and I'm evaluating platforms for our ops team. We need SSO, API access, and granular permissions.", ts: "2026-02-23T09:45:20Z" },
        { id: "t-005-3", call_id: "a1b2c3d4-0005-0005-0005-000000000005", speaker: "assistant", text: "Maria, we fully support SAML SSO, a comprehensive REST API with webhooks, and role-based permissions down to the field level. Are you on a particular timeline?", ts: "2026-02-23T09:45:45Z" },
        { id: "t-005-4", call_id: "a1b2c3d4-0005-0005-0005-000000000005", speaker: "user", text: "Yes, we're comparing 3 vendors and need to make a decision by end of the month. It's urgent.", ts: "2026-02-23T09:46:10Z" },
        { id: "t-005-5", call_id: "a1b2c3d4-0005-0005-0005-000000000005", speaker: "assistant", text: "Understood. I'll flag this as high priority and get a senior solutions engineer to call you back today. They'll bring a custom demo environment.", ts: "2026-02-23T09:46:35Z" },
    ],
};

export const MOCK_CALLBACKS: CallbackQueueItem[] = [
    {
        id: "cb-001",
        call_id: "a1b2c3d4-0001-0001-0001-000000000001",
        customer_number: "+1 (415) 555-0101",
        reason: "Enterprise demo + pricing for 150-seat team. Comparing vs Salesforce & HubSpot.",
        priority: "high",
        status: "pending",
        requested_at: "2026-02-23T08:11:42Z",
        call: { lead_score: 90, summary: "High-intent enterprise buyer. Priya Sharma.", ended_at: "2026-02-23T08:11:42Z" },
    },
    {
        id: "cb-002",
        call_id: "a1b2c3d4-0002-0002-0002-000000000002",
        customer_number: "+1 (212) 555-0202",
        reason: "Team pricing for 20-person startup. Wants comparison vs Salesforce.",
        priority: "normal",
        status: "pending",
        requested_at: "2026-02-23T08:34:28Z",
        call: { lead_score: 75, summary: "Startup team pricing inquiry, Rahul.", ended_at: "2026-02-23T08:34:28Z" },
    },
    {
        id: "cb-005",
        call_id: "a1b2c3d4-0005-0005-0005-000000000005",
        customer_number: "+1 (650) 555-0505",
        reason: "Urgent CTO evaluation — SSO, API access, 200-seat enterprise. Decide by month-end.",
        priority: "urgent",
        status: "pending",
        requested_at: "2026-02-23T09:53:20Z",
        call: { lead_score: 85, summary: "CTO Maria, urgent 3-vendor evaluation.", ended_at: "2026-02-23T09:53:20Z" },
    },
    {
        id: "cb-008",
        call_id: "a1b2c3d4-0008-0008-0008-000000000008",
        customer_number: "+49 30 5544 0808",
        reason: "Logistics company, bulk data import + BI integrations. Klaus requesting callback.",
        priority: "high",
        status: "completed",
        requested_at: "2026-02-23T10:36:55Z",
        call: { lead_score: 80, summary: "Logistics CRM eval, Klaus.", ended_at: "2026-02-23T10:36:55Z" },
    },
];

export function computeMockKpis() {
    const totalCalls = MOCK_CALLS.length;
    const qualified = MOCK_CALLS.filter((c) => (c.lead_score ?? 0) >= 65).length;
    const callbacksPending = MOCK_CALLBACKS.filter((c) => c.status === "pending").length;
    const durations = MOCK_CALLS.filter((c) => c.duration_seconds != null).map((c) => c.duration_seconds!);
    const avgDurationSeconds = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    return { totalCalls, qualified, callbacksPending, avgDurationSeconds };
}
