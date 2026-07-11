"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "orange" | "green" | "red" | "purple" | "blue";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-border text-text-muted",
  orange: "bg-trail-orange/15 text-trail-orange",
  green: "bg-alpine-green/15 text-alpine-green",
  red: "bg-danger/15 text-danger",
  purple: "bg-purple-500/15 text-purple-400",
  blue: "bg-blue-500/15 text-blue-400",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: "Easy" | "Moderate" | "Hard" }) {
  const map: Record<string, "green" | "orange" | "red"> = {
    Easy: "green",
    Moderate: "orange",
    Hard: "red",
  };
  return <Badge variant={map[difficulty]}>{difficulty}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "green" | "orange" | "red" | "blue" | "default"> = {
    Upcoming: "blue",
    Ongoing: "orange",
    Completed: "green",
    Cancelled: "red",
    Confirmed: "green",
    Waitlist: "orange",
    Paid: "green",
    Partial: "orange",
    Pending: "red",
    Normal: "default",
    Urgent: "red",
  };
  return <Badge variant={map[status] || "default"}>{status}</Badge>;
}
