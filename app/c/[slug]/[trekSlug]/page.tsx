import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Compass,
  MessageSquare,
  Share2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getWhatsAppLink } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/Badge";
import type { ItineraryItem } from "@/lib/types";
import ViewLogger from "@/components/ViewLogger";

interface PageProps {
  params: Promise<{ slug: string; trekSlug: string }>;
}

// Generate SEO Metadata & Event Schema Markup
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, trekSlug } = await params;
  const supabase = await createClient();

  const { data: rawTrek } = await supabase
    .from("treks")
    .select("*, captains(brand_name)")
    .eq("slug", trekSlug)
    .eq("is_published", true)
    .maybeSingle();

  const trek = rawTrek as any;

  if (!trek) return {};

  return {
    title: `${trek.title} | ${trek.captains?.brand_name || "Trek Captain"}`,
    description: trek.description || `Join us for the ${trek.title} at ${trek.location}.`,
    openGraph: {
      title: `${trek.title} | ${trek.captains?.brand_name || "Trek Captain"}`,
      description: trek.description || `Join us for the ${trek.title} at ${trek.location}.`,
      images: trek.cover_url ? [trek.cover_url] : [],
    },
  };
}

export default async function PublicTrekDetailPage({ params }: PageProps) {
  const { slug, trekSlug } = await params;
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

  // Fetch Trek details
  const { data: trek } = await supabase
    .from("treks")
    .select("*")
    .eq("slug", trekSlug)
    .eq("captain_id", captain.id)
    .eq("is_published", true)
    .maybeSingle();

  if (!trek) {
    notFound();
  }

  // Fetch spots count
  const { data: stats } = await supabase
    .from("trek_public_stats")
    .select("*")
    .eq("trek_id", trek.id)
    .maybeSingle();

  const booked = stats?.booked_count || 0;
  const spotsLeft = Math.max(0, trek.max_capacity - booked);

  // Fetch public announcements for this trek
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("trek_id", trek.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  // Fetch other treks by this captain
  const { data: otherTreks } = await supabase
    .from("treks")
    .select("*")
    .eq("captain_id", captain.id)
    .eq("is_published", true)
    .neq("id", trek.id)
    .limit(3);

  // Prefilled WhatsApp message
  const waMessage = `Hi ${captain.full_name}! 👋\n\nI want to book spots for *${trek.title}* starting on *${formatDate(trek.start_date)}*.\n\nAre spots available?`;
  const bookingLink = captain.whatsapp ? getWhatsAppLink(captain.whatsapp, waMessage) : "#";

  const itinerary: ItineraryItem[] = (trek.itinerary as any) || [];
  const packingList: string[] = (trek.packing_list as any) || [];
  const inclusions: string[] = (trek.inclusions as any) || [];
  const exclusions: string[] = (trek.exclusions as any) || [];

  // JSON-LD Event Schema Markup
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": trek.title,
    "description": trek.description,
    "startDate": trek.start_date,
    "endDate": trek.end_date,
    "eventStatus":
      trek.status === "Cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": trek.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": trek.region || "Sahyadris",
        "addressCountry": "IN",
      },
    },
    "offers": {
      "@type": "Offer",
      "price": trek.price_per_person,
      "priceCurrency": "INR",
      "availability": spotsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    "organizer": {
      "@type": "Organization",
      "name": captain.brand_name,
      "url": `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}`,
    },
  };

  return (
    <div className="min-h-screen pb-20 topo-bg">
      <ViewLogger slug={slug} trekSlug={trekSlug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* Hero Cover */}
      <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden bg-card">
        {trek.cover_url ? (
          <img src={trek.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full opacity-20 bg-gradient-to-r from-accent to-amber-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />

        {/* Back Link */}
        <Link
          href={`/c/${slug}`}
          className="absolute top-6 left-6 z-20 px-4 py-2 bg-charcoal/80 border border-border/80 hover:border-border rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {captain.brand_name}
        </Link>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 grid lg:grid-cols-12 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={trek.difficulty as any} />
                <span className="text-xs text-text-muted bg-border px-2.5 py-0.5 rounded-full font-medium">
                  {trek.region || "Sahyadris"}
                </span>
                {trek.status === "Cancelled" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-semibold flex items-center gap-1 border border-danger/25">
                    <XCircle className="w-3.5 h-3.5" /> Cancelled
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold font-[family-name:var(--font-sora-family)] text-text-primary tracking-tight">
                {trek.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-accent" />
                  {formatDate(trek.start_date)} — {formatDate(trek.end_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-alpine-green" />
                  {trek.location}
                </span>
              </div>
            </div>

            {/* Description */}
            {trek.description && (
              <div className="border-t border-border pt-6">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {trek.description}
                </p>
              </div>
            )}

            {/* Highlights */}
            {trek.highlights && (
              <div className="border-t border-border pt-6 space-y-3">
                <h3 className="font-bold text-base font-[family-name:var(--font-sora-family)] text-text-primary">
                  Trek Highlights
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {trek.highlights}
                </p>
              </div>
            )}

            {/* Meeting Point */}
            {trek.meeting_point && (
              <div className="border-t border-border pt-6 space-y-2">
                <h3 className="font-bold text-base font-[family-name:var(--font-sora-family)] text-text-primary">
                  Meeting Point
                </h3>
                <p className="text-sm text-text-muted">
                  {trek.meeting_point}
                </p>
              </div>
            )}
          </div>

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
                Day-Wise Itinerary
              </h3>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border" />
                {itinerary.map((item, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-accent ring-4 ring-charcoal" />
                    <span className="text-[10px] text-accent uppercase tracking-wider font-bold">
                      Day {item.day}
                    </span>
                    <h4 className="font-semibold text-sm text-text-primary">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-text-muted leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          {(inclusions.length > 0 || exclusions.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {inclusions.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-alpine-green">
                    Inclusions
                  </h4>
                  <ul className="space-y-2.5">
                    {inclusions.map((item, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="text-alpine-green font-bold select-none">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exclusions.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-danger">
                    Exclusions
                  </h4>
                  <ul className="space-y-2.5">
                    {exclusions.map((item, idx) => (
                      <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="text-danger font-bold select-none">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Packing List */}
          {packingList.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="font-bold text-base font-[family-name:var(--font-sora-family)] text-text-primary">
                What to Pack
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {packingList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Announcements */}
          {announcements && announcements.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
                Important Updates
              </h3>
              <div className="space-y-3">
                {announcements.map((ann: any) => (
                  <div
                    key={ann.id}
                    className={`bg-card border rounded-xl p-5 space-y-2 ${
                      ann.priority === "Urgent" ? "border-danger/30 bg-danger/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        {ann.priority === "Urgent" && (
                          <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                        )}
                        {ann.priority} Update
                      </span>
                      <span>{formatDate(ann.created_at)}</span>
                    </div>
                    <p className="text-xs md:text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {ann.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 sticky top-24">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Price per Person</p>
              <p className="text-3xl font-extrabold text-text-primary font-[family-name:var(--font-sora-family)] mt-1">
                ₹{trek.price_per_person.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Spots Status</span>
                {spotsLeft > 0 ? (
                  <span className="px-2 py-0.5 rounded bg-alpine-green/10 text-alpine-green font-medium">
                    {spotsLeft} spots remaining
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-danger/10 text-danger font-medium">
                    Sold Out
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Grade</span>
                <span className="text-text-primary font-medium">{trek.difficulty}</span>
              </div>
            </div>

            {/* CTAs */}
            {trek.status === "Cancelled" ? (
              <div className="p-4 bg-danger/10 border border-danger/25 rounded-xl text-center text-danger text-sm font-semibold">
                This trek has been cancelled.
              </div>
            ) : spotsLeft > 0 ? (
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                Book via WhatsApp
              </a>
            ) : (
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-card border border-border text-text-muted hover:text-text-primary text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Join Waitlist via WA
              </a>
            )}

            <p className="text-[10px] text-text-dim text-center leading-relaxed">
              Booking redirects to the Captain&apos;s WhatsApp. You can coordinate payments and logistics directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
