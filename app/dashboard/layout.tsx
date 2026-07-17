"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mountain,
  Settings,
  Menu,
  X,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import { getCaptain, hasLocalData, clearLocalData } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Captain } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/treks", label: "Treks", icon: Mountain },
  { href: "/dashboard/participants", label: "Participants", icon: Users },
  { href: "/dashboard/money", label: "Money", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [captain, setCaptain] = useState<Captain | null>(null);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const [loadingCaptain, setLoadingCaptain] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCaptain();
        if (!c) {
          // No captain profile — redirect to onboarding
          router.push("/onboarding");
          return;
        }
        setCaptain(c);
      } catch {
        // Not authenticated — proxy should handle this, but safety net
        router.push("/login");
      }
      setLoadingCaptain(false);
    }
    load();

    // Check for legacy localStorage data
    if (hasLocalData()) {
      setShowMigrationBanner(true);
    }
  }, [pathname, router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const dismissMigration = () => {
    clearLocalData();
    setShowMigrationBanner(false);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  if (loadingCaptain) {
    return (
      <div className="flex h-screen items-center justify-center bg-charcoal">
        <div className="w-8 h-8 border-2 border-trail-orange/30 border-t-trail-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-[#E6F0E9] to-[#DCECE2] border-r border-[#C3D5C8] flex-shrink-0">
          <div className="p-5 border-b border-[#C3D5C8]">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="text-2xl">⛰</span>
              <span className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-[#1C2E24]">
                Trek Captain
              </span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-trail-orange/15 text-trail-orange font-semibold border-l-4 border-trail-orange rounded-l-none"
                      : "text-[#526A5D] hover:text-[#1C2E24] hover:bg-[#D3E4D9]/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {/* User section + Sign out */}
          <div className="border-t border-[#C3D5C8]">
            {captain && (
              <div className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#059669] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {captain.avatarInitials || "CP"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1C2E24] truncate">{captain.name}</p>
                  <p className="text-[10px] text-[#526A5D] truncate">{captain.orgName}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-7 py-3 text-sm text-[#526A5D] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden modal-overlay"
            onClick={() => setSidebarOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-[#E6F0E9] to-[#DCECE2] border-r border-[#C3D5C8] slide-in-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-[#C3D5C8] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⛰</span>
                  <span className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-[#1C2E24]">
                    Trek Captain
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-[#526A5D] hover:text-[#1C2E24] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-trail-orange/15 text-trail-orange font-semibold border-l-4 border-trail-orange rounded-l-none"
                          : "text-[#526A5D] hover:text-[#1C2E24] hover:bg-[#D3E4D9]/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-[#C3D5C8] bg-[#E6F0E9]">
                {captain && (
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#059669] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                      {captain.avatarInitials || "CP"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1C2E24] truncate">{captain.name}</p>
                      <p className="text-[10px] text-[#526A5D] truncate">{captain.orgName}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-7 py-3 text-sm text-[#526A5D] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative min-h-screen">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-30 bg-charcoal/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-text-muted hover:text-text-primary cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">⛰</span>
              <span className="font-bold text-sm font-[family-name:var(--font-sora-family)]">
                Trek Captain
              </span>
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>

          {/* Migration Banner */}
          {showMigrationBanner && (
            <div className="m-4 md:m-8 mb-0 px-4 py-3 bg-trail-orange/10 border border-trail-orange/20 rounded-xl flex items-center justify-between gap-3 relative z-10">
              <p className="text-sm text-trail-orange">
                <span className="font-semibold">Found local demo data.</span> This data won&apos;t carry over to Supabase.
              </p>
              <button
                onClick={dismissMigration}
                className="text-xs text-trail-orange hover:text-trail-orange-hover font-medium whitespace-nowrap cursor-pointer"
              >
                Dismiss & Clear
              </button>
            </div>
          )}

          <div className="p-4 md:p-8 relative z-10">{children}</div>

          {/* Decorative Background Glows */}
          <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[20%] left-[20%] w-[300px] h-[300px] bg-amber-400/8 rounded-full blur-[100px] pointer-events-none z-0" />

          {/* Mountain Silhouette Background */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-[0.06] z-0 overflow-hidden flex items-end">
            <svg viewBox="0 0 1440 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full min-w-[1000px] h-auto">
              <path d="M0 250 L150 130 L320 210 L480 90 L650 190 L820 50 L980 150 L1150 30 L1300 170 L1440 90 L1440 250 Z" fill="#059669" />
              <path d="M0 250 L200 170 L400 230 L600 130 L800 200 L1000 90 L1200 180 L1440 110 L1440 250 Z" fill="#2DD4A7" opacity="0.6" />
            </svg>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? "text-trail-orange" : "text-text-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </ToastProvider>
  );
}
