import { Hero } from "./components/Hero";
import { FeatureSteps } from "./components/FeatureSteps";
import { InnovationCallouts } from "./components/InnovationCallouts";
import { DemoPreview } from "./components/DemoPreview";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Developer } from "./components/Developer";
import { CTA } from "./components/CTA";

export default function MarketingPage() {
    return (
        <div className="space-y-4">
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
