"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

interface StickyMobileBarProps {
  phone: string;
  brandName: string;
  accentColor: string;
}

export default function StickyMobileBar({ phone, brandName, accentColor }: StickyMobileBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      // Show after scrolling past the hero (approx 350px)
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  const normalized = cleanPhone.startsWith("91")
    ? cleanPhone
    : cleanPhone.length === 10
    ? `91${cleanPhone}`
    : cleanPhone.length === 11 && cleanPhone.startsWith("0")
    ? `91${cleanPhone.slice(1)}`
    : cleanPhone;

  const waText = `Hi ${brandName}! I saw your treks page and wanted to ask about your upcoming treks.`;
  const waUrl = `https://wa.me/${normalized}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F0D]/80 backdrop-blur-md border-t border-border p-4 pb-safe animate-fade-in">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm text-white shadow-lg shadow-black/20 hover:opacity-90 active:scale-[0.98] transition-all"
        style={{ backgroundColor: accentColor }}
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        Message on WhatsApp
      </a>
    </div>
  );
}
