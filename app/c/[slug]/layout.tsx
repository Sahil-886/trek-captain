import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch captain profile by slug
  const { data: captain } = await supabase
    .from("captains")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!captain) {
    notFound();
  }

  // Accent color overrides
  const accentColor = captain.accent_color || "#FF6B2C";
  // Generate hover color (approximate by adding opacity or using a secondary color)
  const accentHoverColor = accentColor + "dd";

  return (
    <div
      style={
        {
          "--accent": accentColor,
          "--accent-hover": accentHoverColor,
        } as React.CSSProperties
      }
      className="min-h-screen bg-charcoal text-text-primary selection:bg-accent/30 selection:text-accent font-sans antialiased"
    >
      {children}
    </div>
  );
}
