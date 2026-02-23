"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

export function UserMenu() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    }, []);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    if (!user) return null;

    const name = user.user_metadata?.full_name ?? user.email ?? "User";
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
    const initials = name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div style={{ position: "relative" }}>
            {/* Avatar button */}
            <button
                title={name}
                onClick={() => setShowMenu(v => !v)}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1.5px solid var(--border)",
                    background: "var(--card-bg)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text)",
                    padding: 0,
                    transition: "border-color 0.2s",
                }}
            >
                {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <span>{initials}</span>
                )}
            </button>

            {/* Dropdown */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 40 }}
                        onClick={() => setShowMenu(false)}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: "calc(100% + 8px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 50,
                            minWidth: 180,
                            background: "var(--card-bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--r-sm)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                            overflow: "hidden",
                        }}
                    >
                        {/* User info */}
                        <div
                            style={{
                                padding: "12px 14px",
                                borderBottom: "1px solid var(--border)",
                            }}
                        >
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                                {name}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--muted-text)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user.email}
                            </p>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                width: "100%",
                                padding: "10px 14px",
                                background: "transparent",
                                border: "none",
                                color: "var(--muted-text)",
                                fontSize: 13,
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.08)";
                                (e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-text)";
                            }}
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
