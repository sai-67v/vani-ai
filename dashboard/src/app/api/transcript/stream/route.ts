import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const callSid = request.nextUrl.searchParams.get("callSid");

        if (!callSid) {
            console.warn(JSON.stringify({
                level: "warn",
                module: "api/transcript/stream",
                message: "Missing callSid in request"
            }));
            return NextResponse.json({ error: "Missing callSid" }, { status: 400 });
        }

        // Proxy the SSE connection to our express backend
        const backendUrl = `http://127.0.0.1:3000/api/transcript/stream?callSid=${callSid}`;

        const response = await fetch(backendUrl, {
            headers: {
                Accept: "text/event-stream",
            },
            cache: "no-store"
        });

        if (!response.ok) {
            console.error(JSON.stringify({
                level: "error",
                module: "api/transcript/stream",
                message: "Backend stream failed",
                status: response.status
            }));
            return NextResponse.json({ error: "Backend stream failed" }, { status: response.status });
        }

        console.info(JSON.stringify({
            level: "info",
            module: "api/transcript/stream",
            message: "Successfully proxied transcript stream",
            callSid
        }));

        return new Response(response.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });
    } catch (err) {
        console.error(JSON.stringify({
            level: "error",
            module: "api/transcript/stream",
            message: "Internal Proxy Error",
            error: err instanceof Error ? err.message : String(err)
        }));
        return NextResponse.json({ error: "Internal Proxy Error" }, { status: 500 });
    }
}
