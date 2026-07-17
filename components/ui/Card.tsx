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
  iconBg = "bg-trail-orange/10 text-trail-orange ring-trail-orange/20",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  iconBg?: string;
}) {
  return (
    <Card className="flex items-start gap-4 bg-gradient-to-br from-card to-charcoal border-border/80 hover:border-trail-orange/20 hover:shadow-[0_8px_30px_rgba(5,150,105,0.06)] transition-all duration-300">
      <div className={`p-3 rounded-xl ring-1 shadow-sm ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-muted text-[10px] font-bold tracking-wider uppercase">{label}</p>
        <p className="text-2xl font-bold font-[family-name:var(--font-sora-family)] text-text-primary mt-1 truncate">
          {value}
        </p>
        {trend && <p className="text-xs text-alpine-green mt-1 font-medium">{trend}</p>}
      </div>
    </Card>
  );
}
