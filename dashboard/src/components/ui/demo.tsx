"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

function Component() {
    const [step, setStep] = useState(1);

    const stepContent = [
        {
            title: "Welcome to Vani AI Dashboard",
            description:
                "India's Sovereign AI Platform for voice. Discover enterprise-grade conversational agents.",
        },
        {
            title: "Real-time Call Analytics",
            description:
                "Track total calls, qualified leads, and average duration in real-time.",
        },
        {
            title: "Live Transcripts & Scoring",
            description: "Read detailed transcripts and see AI-driven lead scoring applied instantly.",
        },
        {
            title: "Automated Callback Queue",
            description:
                "Efficiently manage and prioritize callbacks based on lead score and urgency.",
        },
    ];

    const totalSteps = stepContent.length;

    const handleContinue = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    return (
        <Dialog
            onOpenChange={(open) => {
                if (open) setStep(1);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    🚀 Platform Tour
                </Button>
            </DialogTrigger>
            <DialogContent className="gap-0 p-0 [&>button:last-child]:text-white">
                <div className="p-2">
                    <img
                        className="w-full rounded-lg object-cover"
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400"
                        width={382}
                        height={216}
                        alt="Sarvam AI Dashboard Tour"
                    />
                </div>
                <div className="space-y-6 px-6 pb-6 pt-3">
                    <DialogHeader>
                        <DialogTitle>{stepContent[step - 1].title}</DialogTitle>
                        <DialogDescription>{stepContent[step - 1].description}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex justify-center space-x-1.5 max-sm:order-1">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full bg-primary",
                                        index + 1 === step ? "bg-primary" : "opacity-20",
                                    )}
                                />
                            ))}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    Skip
                                </Button>
                            </DialogClose>
                            {step < totalSteps ? (
                                <Button className="group" type="button" onClick={handleContinue}>
                                    Next
                                    <ArrowRight
                                        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            ) : (
                                <DialogClose asChild>
                                    <Button type="button">Finish</Button>
                                </DialogClose>
                            )}
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { Component as DemoDialog };
