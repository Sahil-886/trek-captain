"use client";

import React, { useState } from "react";
import type { ItineraryItem } from "@/lib/types";

interface PublicItineraryProps {
  itinerary: ItineraryItem[];
  accentColor: string;
}

export default function PublicItinerary({ itinerary, accentColor }: PublicItineraryProps) {
  const [expanded, setExpanded] = useState(false);

  if (itinerary.length === 0) return null;

  const showCollapseButton = itinerary.length > 3;
  // On desktop or when expanded, show all days. On mobile when not expanded, show only 3.
  const visibleItinerary = expanded ? itinerary : itinerary;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
      <h3 className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
        Day-Wise Itinerary
      </h3>
      
      {/* Container that enforces desktop always expanded and mobile responsive collapsing */}
      <div className="relative pl-8 space-y-8">
        {/* Connecting line */}
        <div 
          className="absolute left-[11px] top-2 bottom-2 w-0.5" 
          style={{ backgroundColor: `${accentColor}30` }}
        />
        
        {itinerary.map((item, idx) => {
          // Hide elements above index 2 if collapsed on mobile view
          const isCollapsedMobile = !expanded && idx > 2;

          return (
            <div 
              key={idx} 
              className={`relative space-y-1.5 transition-all duration-300 ${
                isCollapsedMobile ? "hidden md:block" : "block"
              }`}
            >
              {/* Connecting dot */}
              <div 
                className="absolute -left-[29px] top-0 w-6 h-6 rounded-full border-2 border-[#0B0F0D] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: accentColor }}
              >
                {item.day}
              </div>
              
              <h4 className="font-bold text-sm text-text-primary pt-0.5">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showCollapseButton && (
        <div className="md:hidden pt-2 border-t border-border/30 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold transition-all px-4 py-2 rounded-lg bg-charcoal hover:bg-border/30 cursor-pointer"
            style={{ color: accentColor }}
          >
            {expanded ? "Show Less Days" : `Show All ${itinerary.length} Days`}
          </button>
        </div>
      )}
    </div>
  );
}
