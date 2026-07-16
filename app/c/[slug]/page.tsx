import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Users, MessageSquare, ArrowRight, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { DifficultyBadge } from "@/components/ui/Badge";
import ViewLogger from "@/components/ViewLogger";

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
    title: `${captain.brand_name} | Trek Captain`,
    description: captain.tagline || `Join treks and adventures organized by ${captain.full_name}.`,
    openGraph: {
      title: `${captain.brand_name} | Trek Captain`,
      description: captain.tagline || `Join treks and adventures organized by ${captain.full_name}.`,
      images: captain.cover_url ? [captain.cover_url] : [],
    },
  };
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

  return (
    <div className="min-h-screen pb-20 flex flex-col justify-between topo-bg">
      <ViewLogger slug={slug} />
      <div>
        {/* Cover Hero */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-card">
          {captain.cover_url ? (
            <img src={captain.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full opacity-20 bg-gradient-to-r from-accent to-amber-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-charcoal bg-accent flex items-center justify-center text-white text-3xl font-bold shadow-2xl overflow-hidden">
                {captain.avatar_url ? (
                  <img src={captain.avatar_url} alt={captain.full_name} className="w-full h-full object-cover" />
                ) : (
                  captain.full_name.charAt(0)
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)] text-text-primary tracking-tight">
                  {captain.brand_name}
                </h1>
                <p className="text-text-muted text-sm flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-accent" />
                  {captain.city || "India"}
                </p>
              </div>
            </div>

            {/* Socials / Action */}
            <div className="flex gap-2">
              {captain.whatsapp && (
                <a
                  href={`https://wa.me/91${captain.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-card border border-border hover:border-border-hover rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-alpine-green" />
                  WhatsApp
                </a>
              )}
              {captain.instagram && (
                <a
                  href={`https://instagram.com/${captain.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-card border border-border hover:border-border-hover rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  Instagram
                </a>
              )}
            </div>
          </div>

          {captain.tagline && (
            <p className="text-lg text-text-secondary font-medium italic">
              &ldquo;{captain.tagline}&rdquo;
            </p>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-card border border-border rounded-xl p-4 text-center">
            <div>
              <p className="text-xl md:text-2xl font-bold text-text-primary font-[family-name:var(--font-sora-family)]">
                {treks?.length || 0}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Treks Hosted</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-accent font-[family-name:var(--font-sora-family)]">
                {upcomingTreks.length}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Upcoming</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-text-primary font-[family-name:var(--font-sora-family)]">
                {pastTreks.length}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Completed</p>
            </div>
          </div>
        </div>

        {/* Main Content Areas */}
        <main className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
          {/* Left Column: Bio */}
          {captain.bio && (
            <div className="md:col-span-1 space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-text-dim font-bold">About the Captain</h2>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {captain.bio}
              </p>
            </div>
          )}

          {/* Right Column: Treks */}
          <div className="md:col-span-2 space-y-8">
            {/* Upcoming Treks */}
            <div>
              <h2 className="text-sm uppercase tracking-wider text-text-dim font-bold mb-4">Upcoming Treks</h2>
              {upcomingTreks.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center text-text-muted">
                  <Compass className="w-8 h-8 text-text-dim mx-auto mb-2" />
                  <p className="text-sm">No upcoming treks listed right now.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTreks.map((trek: any) => {
                    const spotsLeft = getSpotsLeft(trek.id, trek.max_capacity);
                    return (
                      <Link key={trek.id} href={`/c/${slug}/${trek.slug}`}>
                        <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/40 transition-colors flex gap-4 cursor-pointer mt-3">
                          {/* Trek Cover/Color bar */}
                          <div
                            className="w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: trek.cover_color || "var(--accent)" }}
                          />
                          <div className="flex-grow min-w-0 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-text-primary text-base font-[family-name:var(--font-sora-family)] truncate">
                                {trek.title}
                              </h3>
                              <DifficultyBadge difficulty={trek.difficulty as any} />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(trek.start_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {trek.location}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-text-primary font-semibold">
                                ₹{trek.price_per_person.toLocaleString("en-IN")}/person
                              </span>
                              {spotsLeft > 0 ? (
                                <span className="px-2 py-0.5 rounded bg-alpine-green/10 text-alpine-green font-medium">
                                  {spotsLeft} spots left
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-danger/10 text-danger font-medium">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Treks */}
            {pastTreks.length > 0 && (
              <div>
                <h2 className="text-sm uppercase tracking-wider text-text-dim font-bold mb-4">Completed Adventures</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastTreks.map((trek: any) => (
                    <div key={trek.id} className="bg-card/65 border border-border/80 rounded-xl p-4 space-y-1">
                      <h4 className="font-semibold text-text-secondary text-sm truncate">{trek.title}</h4>
                      <p className="text-xs text-text-dim flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trek.location}
                      </p>
                      <p className="text-[10px] text-text-dim">
                        Completed on {formatDate(trek.end_date)}
                      </p>
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
