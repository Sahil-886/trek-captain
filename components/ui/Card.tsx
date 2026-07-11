"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 transition-all duration-300 ${
        hover
          ? "card-hover cursor-pointer hover:border-trail-orange/40 hover:shadow-[0_10px_30px_rgba(255,107,44,0.08)]"
          : ""
      } ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card className="flex items-start gap-4 bg-gradient-to-br from-card to-charcoal border-border/80 hover:border-trail-orange/20 transition-all duration-300">
      <div className="p-3 rounded-xl bg-border/40 text-trail-orange ring-1 ring-border/50 shadow-inner">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-muted text-xs font-medium tracking-wide uppercase">{label}</p>
        <p className="text-2xl font-bold font-[family-name:var(--font-sora-family)] text-text-primary mt-1 truncate">
          {value}
        </p>
        {trend && <p className="text-xs text-alpine-green mt-1 font-medium">{trend}</p>}
      </div>
    </Card>
  );
}
