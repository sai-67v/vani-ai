import { ReactNode } from "react";
import { LayoutDashboard, Phone, Settings } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="header-logo mb-6 font-bold" style={{ width: 44, height: 44 }}>
                    <span className="text-xl">▼</span>
                </div>

                <div className="sidebar-icon active" title="Dashboard">
                    <LayoutDashboard size={20} />
                </div>
                <div className="sidebar-icon" title="Calls">
                    <Phone size={20} />
                </div>
                <div className="sidebar-icon" title="Settings">
                    <Settings size={20} />
                </div>

                <div className="mt-auto" style={{ marginBottom: 24, padding: "0 10px" }}>
                    <UserMenu />
                </div>
            </aside>
            <main className="main-content">
                <div className="topbar">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-text font-medium text-sm">Dashboard</span>
                        <span className="text-muted-text">/</span>
                        <span className="text-text font-bold text-sm">Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="status-dot" />
                        <span className="header-subtitle" style={{ fontSize: 13, color: "var(--muted-text)" }}>
                            Live · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}
