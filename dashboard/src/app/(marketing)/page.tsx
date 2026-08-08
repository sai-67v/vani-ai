import type { Metadata } from "next";
import { Hero } from "./components/Hero";
import { FeatureSteps } from "./components/FeatureSteps";
import { InnovationCallouts } from "./components/InnovationCallouts";
import { DemoPreview } from "./components/DemoPreview";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Developer } from "./components/Developer";
import { CTA } from "./components/CTA";
import { LandingBackground } from "@/components/LandingBackground";

export const metadata: Metadata = {
    title: "Vaani AI — Voice Intelligence Platform",
    description:
        "Build production voice AI in minutes. Real-time speech recognition, multilingual support, sentiment analysis, and seamless Twilio integration.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "Vaani AI — Voice Intelligence Platform",
        description:
            "Build production voice AI in minutes. Real-time speech recognition, multilingual support, sentiment analysis, and seamless Twilio integration.",
        url: "/",
    },
};

export default function MarketingPage() {
    return (
        <div className="space-y-4">
            <LandingBackground />
            <Hero />
            <FeatureSteps />
            <InnovationCallouts />
            <DemoPreview />
            <Pricing />
            <Testimonials />
            <Developer />
            <CTA />
        </div>
    );
}

