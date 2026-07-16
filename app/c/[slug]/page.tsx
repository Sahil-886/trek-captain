import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  ArrowRight,
  Compass,
  Megaphone,
  Phone
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getRelativeTimeString } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/Badge";
import ViewLogger from "@/components/ViewLogger";
import PublicHero from "./PublicHero";
import StickyMobileBar from "./StickyMobileBar";

// Revalidate public profile pages every 60 seconds
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO Metadata dynamically
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: captain } = await supabase
    .from("captains")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!captain) return {};

  return {
    title: `${captain.brand_name} — Treks from ${captain.city || "India"}`,
    description: captain.tagline || `Join treks and adventures organized by ${captain.full_name}.`,
    openGraph: {
      title: `${captain.brand_name} — Treks from ${captain.city || "India"}`,
      description: captain.tagline || `Join treks and adventures organized by ${captain.full_name}.`,
      images: captain.cover_url ? [captain.cover_url] : [],
    },
  };
}

function normalizeWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) {
    return clean;
  }
  if (clean.length === 10) {
    return `91${clean}`;
  }
  if (clean.length === 11 && clean.startsWith("0")) {
    return `91${clean.slice(1)}`;
  }
  return clean;
}

function formatTrekDateHuman(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

  const startFmt = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${startFmt} · ${diffDays} day${diffDays > 1 ? "s" : ""}`;
}

export default async function CaptainProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch Captain details
  const { data: captain } = await supabase
    .from("captains")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!captain) {
    notFound();
  }

  // Fetch all treks for this captain
  const { data: treks } = await supabase
    .from("treks")
    .select("*")
    .eq("captain_id", captain.id)
    .eq("is_published", true)
    .order("start_date", { ascending: true });

  // Fetch public stats for spots calculation
  const { data: stats } = await supabase
    .from("trek_public_stats")
    .select("*");

  const getSpotsLeft = (trekId: string, maxCapacity: number) => {
    const stat = stats?.find((s: any) => s.trek_id === trekId);
    const booked = stat?.booked_count || 0;
    return Math.max(0, maxCapacity - booked);
  };

  const upcomingTreks = treks?.filter((t: any) => t.status === "Upcoming" || t.status === "Ongoing") || [];
  const pastTreks = treks?.filter((t: any) => t.status === "Completed") || [];

  // Calculate dynamic stats
  const treksHosted = treks?.length || 0;
  
  const captainTrekIds = treks?.map((t: any) => t.id) || [];
  const trekkersLed = stats
    ?.filter((s: any) => captainTrekIds.includes(s.trek_id))
    .reduce((sum: number, s: any) => sum + (s.booked_count || 0), 0) || 0;

  const startYear = new Date(captain.created_at || new Date()).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsActiveCount = currentYear - startYear;
  const yearsActiveLabel = yearsActiveCount <= 0 ? "New" : `${yearsActiveCount} yr${yearsActiveCount > 1 ? "s" : ""}`;

  // Hide stats strip if all values are 0
  const showStatsStrip = treksHosted > 0 || trekkersLed > 0 || yearsActiveCount > 0;

  const accentColor = captain.accent_color || "#FF6B2C";
  const whatsappNormalized = captain.whatsapp ? normalizeWhatsApp(captain.whatsapp) : "";

  return (
    <div 
      className="min-h-screen pb-20 flex flex-col justify-between topo-bg relative"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      {/* Topography faint background lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] text-text-primary pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="topo-bg-lines" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M 0 20 Q 40 40 80 20 T 160 20" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 0 60 Q 60 20 100 60 T 160 60" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 0 100 Q 30 120 80 100 T 160 100" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 0 140 Q 70 100 120 140 T 160 140" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo-bg-lines)" />
      </svg>

      <ViewLogger slug={slug} />
      
      {/* Sticky mobile WhatsApp footer */}
      {captain.whatsapp && (
        <StickyMobileBar 
          phone={captain.whatsapp} 
          brandName={captain.brand_name} 
          accentColor={accentColor} 
        />
      )}

      <div>
        {/* Full-bleed Cover Hero Section */}
        <PublicHero
          coverUrl={captain.cover_url}
          avatarUrl={captain.avatar_url}
          brandName={captain.brand_name}
          tagline={captain.tagline}
          city={captain.city}
          accentColor={accentColor}
          fullName={captain.full_name}
        />

        {/* Notice Board alert banner */}
        {captain.notice && (
          <div className="max-w-4xl mx-auto px-6 mt-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 shadow-md">
              <Megaphone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-100 font-semibold leading-relaxed">
                  {captain.notice}
                </p>
                {captain.notice_updated_at && (
                  <span className="text-[10px] text-amber-500/80 block mt-1">
                    Updated {getRelativeTimeString(captain.notice_updated_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact and Social Row */}
        <div className="max-w-4xl mx-auto px-6 mt-6 flex flex-wrap gap-3">
          {captain.whatsapp && (
            <a
              href={`https://wa.me/${whatsappNormalized}?text=${encodeURIComponent(
                `Hi ${captain.brand_name}! I saw your treks page and wanted to ask about your upcoming treks.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 hover:opacity-90 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Message on WhatsApp
            </a>
          )}
          {captain.instagram && (
            <a
              href={`https://instagram.com/${captain.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-card border border-border hover:border-border-hover rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </a>
          )}
          {captain.whatsapp && (
            <a
              href={`tel:+${whatsappNormalized}`}
              className="px-5 py-3 bg-card border border-border hover:border-border-hover rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-accent" />
              Call
            </a>
          )}
        </div>

        {/* Stats Strip */}
        {showStatsStrip && (
          <div className="max-w-4xl mx-auto px-6 mt-6">
            <div className="grid grid-cols-3 gap-3 bg-card/60 border border-border rounded-2xl p-4 text-center">
              {treksHosted > 0 ? (
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-text-primary font-[family-name:var(--font-sora-family)]">
                    {treksHosted}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">Treks Hosted</p>
                </div>
              ) : <div className="hidden" />}
              
              {trekkersLed > 0 ? (
                <div className="border-x border-border/80 px-2">
                  <p className="text-xl md:text-2xl font-extrabold font-[family-name:var(--font-sora-family)]" style={{ color: accentColor }}>
                    {trekkersLed}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">Trekkers Led</p>
                </div>
              ) : <div className="hidden" />}

              {yearsActiveCount > 0 || yearsActiveLabel === "New" ? (
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-text-primary font-[family-name:var(--font-sora-family)]">
                    {yearsActiveLabel}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">Years Active</p>
                </div>
              ) : <div className="hidden" />}
            </div>
          </div>
        )}

        {/* Main Content Areas */}
        <main className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Left Column: About Section (Hidden if bio is empty) */}
          {captain.bio && (
            <div className="md:col-span-1 space-y-4">
              <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: accentColor }} />
              <h2 className="text-sm uppercase tracking-wider text-text-dim font-bold font-[family-name:var(--font-sora-family)]">
                About the Captain
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed text-sm whitespace-pre-wrap font-medium">
                {captain.bio}
              </div>
            </div>
          )}

          {/* Right Column: Treks Listings */}
          <div className={captain.bio ? "md:col-span-2 space-y-10" : "md:col-span-3 space-y-10"}>
            
            {/* Upcoming Treks Grid */}
            <div>
              <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: accentColor }} />
              <h2 className="text-sm uppercase tracking-wider text-text-dim font-bold font-[family-name:var(--font-sora-family)] mb-4">
                Upcoming Adventures
              </h2>

              {upcomingTreks.length === 0 ? (
                /* Zero Published Treks State */
                <div className="bg-card border border-border border-dashed rounded-2xl p-10 text-center space-y-4 shadow-sm">
                  <svg className="w-12 h-12 text-text-dim mx-auto opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="m7 14 3-3 3 3 5-5" />
                  </svg>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-text-primary text-base">New treks coming soon</h3>
                    <p className="text-xs text-text-muted">
                      Message me on WhatsApp to hear about the next adventure first!
                    </p>
                  </div>
                  {captain.whatsapp && (
                    <a
                      href={`https://wa.me/${whatsappNormalized}?text=${encodeURIComponent(
                        `Hi ${captain.brand_name}! I saw your treks page and wanted to ask about your upcoming treks.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-alpine-green/10 hover:bg-alpine-green/20 border border-alpine-green/20 text-alpine-green rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 fill-alpine-green/10" />
                      Message on WhatsApp
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {upcomingTreks.map((trek: any) => {
                    const spotsLeft = getSpotsLeft(trek.id, trek.max_capacity);
                    const isSoldOut = spotsLeft === 0;

                    // Days away computation
                    const start = new Date(trek.start_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    const daysLabel =
                      daysDiff < 0
                        ? "Started"
                        : daysDiff === 0
                        ? "Starts today"
                        : daysDiff === 1
                        ? "Tomorrow"
                        : `In ${daysDiff} days`;

                    const isUrgent = daysDiff > 0 && daysDiff < 7;

                    // Spots badge colors
                    let spotsBg = "bg-border/60 text-text-muted";
                    let spotsText = "Spots available";
                    if (isSoldOut) {
                      spotsBg = "bg-border text-text-dim";
                      spotsText = "SOLD OUT";
                    } else if (spotsLeft <= 2) {
                      spotsBg = "bg-danger/10 text-danger border border-danger/20";
                      spotsText = `Last ${spotsLeft} spot${spotsLeft > 1 ? "s" : ""}`;
                    } else if (spotsLeft <= 5) {
                      spotsBg = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                      spotsText = `${spotsLeft} spots left`;
                    } else {
                      spotsBg = "bg-alpine-green/10 text-alpine-green border border-alpine-green/20";
                      spotsText = `${spotsLeft} spots left`;
                    }

                    // Accent-tinted hover shadow style
                    const shadowStyle = {
                      "--shadow-color": `${accentColor}12`
                    } as React.CSSProperties;

                    return (
                      <Link 
                        key={trek.id} 
                        href={isSoldOut ? "#" : `/c/${slug}/${trek.slug}`}
                        className={`group block bg-card border border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--shadow-color)] transition-all duration-300 ${
                          isSoldOut ? "saturate-50 opacity-70 pointer-events-none" : "cursor-pointer"
                        }`}
                        style={shadowStyle}
                      >
                        {/* Cover Image container */}
                        <div className="relative h-40 w-full overflow-hidden bg-charcoal">
                          {trek.cover_url ? (
                            <img 
                              src={trek.cover_url} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full opacity-20 bg-gradient-to-r from-accent to-amber-500" />
                          )}
                          
                          {/* Badges overlaid */}
                          <div className="absolute top-3 left-3">
                            <DifficultyBadge difficulty={trek.difficulty as any} />
                          </div>
                          
                          <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${spotsBg}`}>
                            {spotsText}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          <div className="space-y-1">
                            <h3 className="font-bold text-text-primary text-base font-[family-name:var(--font-sora-family)] line-clamp-2 leading-tight">
                              {trek.title}
                            </h3>
                            <p className="text-xs text-text-muted flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                              {trek.location}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-xs text-text-muted pt-1 border-t border-border/40">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-text-dim" />
                              {formatTrekDateHuman(trek.start_date, trek.end_date)}
                            </span>
                            <span 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isUrgent ? "bg-accent/15 text-accent border border-accent/25" : "bg-border/60 text-text-muted"
                              }`}
                            >
                              {daysLabel}
                            </span>
                          </div>

                          <div className="flex justify-between items-end pt-2">
                            <div>
                              <span className="block text-[9px] text-text-dim uppercase tracking-wider font-semibold">Price</span>
                              <span className="text-base font-extrabold text-text-primary font-[family-name:var(--font-sora-family)]">
                                ₹{trek.price_per_person.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-text-muted ml-0.5">/person</span>
                            </div>
                            
                            <div className="w-7 h-7 rounded-full bg-border/40 group-hover:bg-accent/10 border border-border group-hover:border-accent/20 flex items-center justify-center text-text-muted group-hover:text-accent transition-colors">
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Completed Treks Section (Social Proofs) */}
            {pastTreks.length > 0 && (
              <div>
                <div className="w-8 h-1 rounded-full mb-3" style={{ backgroundColor: accentColor }} />
                <h2 className="text-sm uppercase tracking-wider text-text-dim font-bold font-[family-name:var(--font-sora-family)] mb-4">
                  Adventures Completed
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastTreks.map((trek: any) => (
                    <div 
                      key={trek.id} 
                      className="group bg-card/40 border border-border/80 rounded-2xl overflow-hidden hover:border-border transition-colors flex flex-col justify-between"
                    >
                      {/* Greyscale cover regaining color on hover */}
                      <div className="relative h-28 w-full overflow-hidden bg-charcoal grayscale group-hover:grayscale-0 transition-all duration-500">
                        {trek.cover_url ? (
                          <img src={trek.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full opacity-10 bg-gradient-to-r from-accent to-amber-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                      </div>
                      
                      <div className="p-4 space-y-1">
                        <h4 className="font-bold text-text-secondary text-sm truncate">{trek.title}</h4>
                        <p className="text-xs text-text-dim flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          {trek.location}
                        </p>
                        <p className="text-[10px] text-text-dim pt-1 border-t border-border/40 mt-1">
                          Completed {formatDate(trek.end_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Branded Footer */}
      <footer className="text-center py-8 text-xs text-text-dim border-t border-border/25 mt-10">
        <Link href="/" className="hover:underline">
          Powered by Trek Captain ⛰
        </Link>
      </footer>
    </div>
  );
}
