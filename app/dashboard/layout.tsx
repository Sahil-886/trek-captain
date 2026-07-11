"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mountain,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import { initializeStore, getCaptain } from "@/lib/store";
import type { Captain } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/treks", label: "Treks", icon: Mountain },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [captain, setCaptain] = useState<Captain | null>(null);

  useEffect(() => {
    initializeStore();
    setCaptain(getCaptain());
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r border-border flex-shrink-0">
          <div className="p-5 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="text-2xl">⛰</span>
              <span className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
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
                      ? "bg-trail-orange/10 text-trail-orange"
                      : "text-text-muted hover:text-text-primary hover:bg-border/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {captain && (
            <div className="p-4 border-t border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-trail-orange flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {captain.avatarInitials || "CP"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{captain.name}</p>
                <p className="text-[10px] text-text-muted truncate">{captain.orgName}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden modal-overlay"
            onClick={() => setSidebarOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border slide-in-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⛰</span>
                  <span className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
                    Trek Captain
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-text-muted hover:text-text-primary cursor-pointer"
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
                          ? "bg-trail-orange/10 text-trail-orange"
                          : "text-text-muted hover:text-text-primary hover:bg-border/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              {captain && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border flex items-center gap-3 bg-card">
                  <div className="w-9 h-9 rounded-full bg-trail-orange flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    {captain.avatarInitials || "CP"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{captain.name}</p>
                    <p className="text-[10px] text-text-muted truncate">{captain.orgName}</p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
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

          <div className="p-4 md:p-8">{children}</div>
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
