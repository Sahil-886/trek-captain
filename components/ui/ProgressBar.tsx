"use client";

import React from "react";

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  color?: "orange" | "green";
}

export function ProgressBar({
  current,
  max,
  className = "",
  showLabel = true,
  color = "orange",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const barColor = color === "green" ? "bg-alpine-green" : "bg-trail-orange";

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>
            {current}/{max}
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
