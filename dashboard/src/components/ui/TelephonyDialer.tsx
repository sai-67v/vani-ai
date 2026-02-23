"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PhoneForwarded, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TelephonyDialer() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [status, setStatus] = useState<"idle" | "calling" | "connected" | "failed">("idle");
    const [error, setError] = useState<string | null>(null);

    const isValid = useMemo(() => {
        const trimmed = phoneNumber.trim();
        // Basic E.164-ish check: starts with +, 8-15 digits after
        return /^\+[0-9]{8,15}$/.test(trimmed);
    }, [phoneNumber]);

    const handleDial = async () => {
        if (!isValid) {
            setError("Enter a valid number with country code, e.g. +14155552671");
            return;
        }
        setError(null);
        setStatus("calling");
        try {
            // Post to our custom Twilio proxy backend
            const res = await fetch("/api/twilio/dial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: phoneNumber.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setStatus("connected");
            } else {
                setStatus("failed");
                setError(data.error || "Call failed. Check Twilio credentials.");
            }
        } catch (err) {
            setStatus("failed");
            setError("Network error. Check your API is running.");
        }
    };

    return (
        <Dialog onOpenChange={(open) => { if (!open) setStatus("idle"); }}>
            <DialogTrigger asChild>
                <button className="btn btn-strong" title="Initiate Twilio Call">
                    <PhoneForwarded size={16} /> Initiate Outbound Call
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0f0f10] border border-white/10 shadow-2xl shadow-black/50">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <ShieldCheck className="text-lime-300" size={18} />
                        Initiate Twilio Telephony
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Enter a number with country code (E.164). We’ll bridge an outbound Twilio call into the Sarvam Conversational Agent.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/70">Destination number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 415 555 2671"
                            className={cn(
                                "flex h-11 w-full rounded-lg border bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/25",
                                error ? "border-[#ff6363]" : "border-white/10"
                            )}
                        />
                        <p className="text-xs text-white/50">Use the Twilio-verified destination. Formats: +14155552671, +919876543210.</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-[#ff6363]/40 bg-[#2a1313] px-3 py-2 text-xs text-[#ffb3b3]">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <Button
                        onClick={handleDial}
                        disabled={status === "calling" || !isValid}
                        className="h-11 bg-white text-black shadow-glow-cta hover:bg-gray-200 disabled:opacity-60"
                    >
                        {status === "calling" ? <Loader2 className="animate-spin mr-2" size={16} /> : <PhoneForwarded className="mr-2" size={16} />}
                        {status === "calling" ? "Dialing..." : status === "connected" ? "Call Connected" : "Connect Call"}
                    </Button>

                    {status === "connected" && (
                        <div className="text-sm text-[#DFFF00] mt-2 font-medium">
                            ✓ Call Initiated Successfully. Twilio is connecting to the Sarvam Bridge.
                        </div>
                    )}
                    {status === "failed" && (
                        <div className="text-sm text-[#FF6363] mt-2 font-medium">
                            ✗ Failed to initiate call. Check server logs to ensure Twilio envs are set.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
