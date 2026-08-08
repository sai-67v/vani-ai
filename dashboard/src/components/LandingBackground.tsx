"use client";

import { useEffect, useState } from "react";
import UnicornScene from "unicornstudio-react/next";

export function LandingBackground() {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Respect user's reduced-motion preference for accessibility & performance
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) return;

        // Defer heavy canvas background to idle callback to ensure 0ms main-thread TBT
        const scheduleIdle =
            window.requestIdleCallback ||
            ((cb: () => void) => setTimeout(cb, 1500));

        const idleId = scheduleIdle(() => {
            setShouldRender(true);
        });

        return () => {
            if (window.cancelIdleCallback && typeof idleId === "number") {
                window.cancelIdleCallback(idleId);
            }
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 -z-50 h-[100dvh] w-full overflow-hidden" aria-hidden="true">
            {/* Fallback ambient CSS gradient rendered immediately (0ms TBT) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b12] via-[#0f111a] to-[#0b0b12]" />

            {/* Heavy WebGL canvas rendered lazily on idle thread */}
            {shouldRender && (
                <div className="absolute inset-0">
                    <UnicornScene
                        projectId="pqMUNSam23s7O5mFHOXd"
                        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
                        width="100%"
                        height="100%"
                    />
                </div>
            )}

            {/* Readability overlays */}
            <div className="absolute inset-0 bg-background/40 dark:bg-background/80 mix-blend-normal" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>
    );
}

