import { useState, useEffect } from "react";
import type { Transcript } from "./types";

export function useTranscriptStream(callSid: string | null, initialTranscripts: Transcript[] = []) {
    const [transcripts, setTranscripts] = useState<Transcript[]>(initialTranscripts);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        // Only reset if callSid actually changes, to avoid wiping current session on re-renders
        setTranscripts(initialTranscripts);

        if (!callSid) {
            setIsListening(false);
            return;
        }

        setIsListening(true);
        const eventSource = new EventSource(`/api/transcript/stream?callSid=${callSid}`);

        eventSource.onmessage = (event) => {
            // Heartbeat/ping checking
            if (event.data === ":") return;
            try {
                const newDelta = JSON.parse(event.data) as Transcript;
                // Append delta to state. Since it comes in one by one, we use functional state update
                setTranscripts((prev) => {
                    // Prevent duplicate IDs if the backend ever retries/duplicates
                    if (prev.some(t => t.id === newDelta.id && t.text === newDelta.text)) return prev;
                    if (!newDelta.id) {
                        newDelta.id = "live-" + Math.random().toString(36).substr(2, 9); // mock ID for live UI
                    }
                    return [...prev, newDelta];
                });
            } catch (err) {
                console.error("Failed to parse transcript stream delta:", err);
            }
        };

        eventSource.onerror = (error) => {
            console.error("EventSource failed:", error);
            eventSource.close();
            setIsListening(false);
        };

        return () => {
            eventSource.close();
            setIsListening(false);
        };
    }, [callSid]);

    return { transcripts, isListening };
}
