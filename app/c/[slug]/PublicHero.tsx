"use client";

import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface PublicHeroProps {
  coverUrl: string | null;
  avatarUrl: string | null;
  brandName: string;
  tagline: string | null;
  city: string | null;
  accentColor: string;
  fullName: string;
}

export default function PublicHero({
  coverUrl,
  avatarUrl,
  brandName,
  tagline,
  city,
  accentColor,
  fullName,
}: PublicHeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = reducedMotion ? 0 : scrollY * 0.35;

  return (
    <div className="relative h-[45vh] md:h-[55vh] w-full overflow-hidden bg-[#0B0F0D]">
      {/* Cover Hero Image */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${Math.max(0, parallaxOffset)}px)`,
          transition: "transform 0.05s linear"
        }}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div 
            className="w-full h-full relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 20% 30%, ${accentColor}15 0%, transparent 70%),
                          radial-gradient(circle at 80% 70%, ${accentColor}10 0%, transparent 70%),
                          #141A16`
            }}
          >
            {/* Topography Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04] text-text-primary" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="topo-hero" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M 0 15 Q 30 30 60 15 T 120 15" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M 0 45 Q 45 15 75 45 T 120 45" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M 0 75 Q 22 90 60 75 T 120 75" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M 0 105 Q 52 75 90 105 T 120 105" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo-hero)" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse duration-[5000ms]" />
          </div>
        )}
      </div>

      {/* Dark gradient scrim */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(to top, #0B0F0D 0%, rgba(11, 15, 13, 0.85) 25%, transparent 100%)"
        }}
      />

      {/* Content overlays */}
      <div className="absolute bottom-0 left-0 right-0 z-20 max-w-4xl mx-auto px-6 pb-6 md:pb-8 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        {/* Avatar */}
        <div 
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-[#0B0F0D] bg-card flex items-center justify-center text-white text-3xl font-bold shadow-2xl overflow-hidden shrink-0"
          style={{ borderColor: "#0B0F0D" }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={brandName} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white font-extrabold"
              style={{ backgroundColor: accentColor }}
            >
              {fullName.charAt(0)}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h1 
            className="font-extrabold tracking-tight text-white font-[family-name:var(--font-sora-family)] leading-none"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            {brandName}
          </h1>
          {tagline && (
            <p className="text-text-muted text-sm md:text-base font-medium">
              {tagline}
            </p>
          )}
          <p className="text-text-dim text-xs flex items-center gap-1.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
            {city || "India"}
          </p>
        </div>
      </div>
    </div>
  );
}
