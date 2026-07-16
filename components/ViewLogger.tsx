"use client";

import { useEffect } from "react";

interface ViewLoggerProps {
  slug: string;
  trekSlug?: string;
}

export default function ViewLogger({ slug, trekSlug }: ViewLoggerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Capture referrer from browser document
    const referrer = document.referrer || "";

    const payload = JSON.stringify({
      slug,
      trekSlug: trekSlug || null,
      referrer,
    });

    // Use sendBeacon for non-blocking analytics logging
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/views", payload);
    } else {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch((e) => console.error("Failed to log view:", e));
    }
  }, [slug, trekSlug]);

  return null;
}
