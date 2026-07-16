"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mountain,
  Users,
  IndianRupee,
  AlertCircle,
  Plus,
  CreditCard,
  UserPlus,
  ArrowRight,
  Copy,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  X,
  FileText
} from "lucide-react";
import { StatCard } from "@/components/ui/Card";
import { DifficultyBadge, StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  getTreks,
  getParticipants,
  getPayments,
  getDashboardStats,
  getCaptain,
  getGlobalAnnouncements,
  getPageViewsStats,
  getPendingDuesList,
  markAsShared,
  recordPayment
} from "@/lib/store";
import { formatINR, formatDate, getWhatsAppLink, getTelLink, getRelativeTimeString } from "@/lib/utils";
import type { Trek, Participant, Payment, Captain, PaymentMode } from "@/lib/types";

export default function DashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeTreks: 0, totalParticipants: 0, amountCollected: 0, pendingDues: 0 });
  const [allTreks, setAllTreks] = useState<Trek[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [captain, setCaptain] = useState<Captain | null>(null);
  
  // Analytics and Dues States
  const [analytics, setAnalytics] = useState<any>(null);
  const [dues, setDues] = useState<any[]>([]);

  // Celebration state
  const [checklistCelebrated, setChecklistCelebrated] = useState(false);

  // Quick Pay Modal State
  const [quickPayDue, setQuickPayDue] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<PaymentMode>("UPI");
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);

  const load = async () => {
    try {
      const [s, c, allTreksData, allPart, allPay, announcements, viewsStats, duesList] = await Promise.all([
        getDashboardStats(),
        getCaptain(),
        getTreks(),
        getParticipants(),
        getPayments(),
        getGlobalAnnouncements(),
        getPageViewsStats(),
        getPendingDuesList(),
      ]);

      setStats(s);
      setCaptain(c);
      setAllTreks(allTreksData);
      setAllParticipants(allPart);
      setAnalytics(viewsStats);
      setDues(duesList);

      // Build merged activity feed (last 10 events)
      const feed: any[] = [];

      // 1. Participant Joins
      allPart
        .filter((p: Participant) => p.status === "Confirmed")
        .forEach((p: Participant) => {
          const trek = allTreksData.find((t: Trek) => t.id === p.trekId);
          if (trek) {
            feed.push({
              id: `join-${p.id}`,
              type: "join",
              text: `${p.name} joined ${trek.title}`,
              time: getRelativeTimeString(p.createdAt),
              icon: <UserPlus className="w-4 h-4 text-trail-orange" />,
              sortTime: new Date(p.createdAt).getTime(),
              trekId: trek.id,
            });
          }
        });

      // 2. Payments Recorded
      allPay.forEach((p: Payment) => {
        const participant = allPart.find((pp: Participant) => pp.id === p.participantId);
        const trek = allTreksData.find((t: Trek) => t.id === p.trekId);
        if (participant && trek) {
          feed.push({
            id: `pay-${p.id}`,
            type: "payment",
            text: `${participant.name} paid ${formatINR(p.amount)} for ${trek.title}`,
            time: getRelativeTimeString(p.paidAt),
            icon: <CreditCard className="w-4 h-4 text-alpine-green" />,
            sortTime: new Date(p.paidAt).getTime(),
            trekId: trek.id,
          });
        }
      });

      // 3. Announcements Posted
      announcements.forEach((a) => {
        const trek = allTreksData.find((t: Trek) => t.id === a.trekId);
        if (trek) {
          feed.push({
            id: `ann-${a.id}`,
            type: "announcement",
            text: `Announcement: "${a.message.slice(0, 45)}${a.message.length > 45 ? "..." : ""}" posted on ${trek.title}`,
            time: getRelativeTimeString(a.createdAt),
            icon: <MessageCircle className="w-4 h-4 text-sky-400" />,
            sortTime: new Date(a.createdAt).getTime(),
            trekId: trek.id,
          });
        }
      });

      // 4. Treks Published
      allTreksData
        .filter((t) => t.isPublished)
        .forEach((t) => {
          feed.push({
            id: `pub-${t.id}`,
            type: "publish",
            text: `Trek published: ${t.title} is now live!`,
            time: getRelativeTimeString(t.createdAt),
            icon: <Mountain className="w-4 h-4 text-alpine-green" />,
            sortTime: new Date(t.createdAt).getTime(),
            trekId: t.id,
          });
        });

      feed.sort((a, b) => b.sortTime - a.sortTime);
      setActivities(feed.slice(0, 10));

    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCopyLink = async () => {
    if (!captain) return;
    const url = `${window.location.origin}/c/${captain.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Public page link copied to clipboard.");
      
      // Update share state for checklist
      if (!captain.hasShared) {
        await markAsShared();
        await load();
      }
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!captain) return;
    const url = `${window.location.origin}/c/${captain.slug}`;
    const waText = `Check out my upcoming treks 🏔️ ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");

    // Update share state for checklist
    if (!captain.hasShared) {
      await markAsShared();
      await load();
    }
  };

  const handleQuickPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayDue || !payAmount) return;

    setPaySaving(true);
    try {
      await recordPayment({
        participantId: quickPayDue.participantId,
        trekId: quickPayDue.trekId,
        amount: parseInt(payAmount, 10),
        mode: payMode,
        note: payNote,
      });
      setQuickPayDue(null);
      setPayAmount("");
      setPayNote("");
      toast("Payment recorded successfully.");
      await load();
    } catch (err) {
      console.error("Failed to record payment:", err);
    } finally {
      setPaySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Checklist Step States
  const isStep1Done = true; // Account creation
  const isStep2Done = allTreks.length > 0;
  const isStep3Done = allTreks.some((t) => t.coverUrl !== null);
  const isStep4Done = allTreks.some((t) => t.isPublished);
  const isStep5Done = captain?.hasShared || false;

  const stepsDoneCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done].filter(Boolean).length;
  const allStepsCompleted = stepsDoneCount === 5;
  const hasTreks = allTreks.length > 0;

  // Track if checklist was ever completed to trigger celebration rendering
  const showChecklist = !hasTreks || (allStepsCompleted && !checklistCelebrated);

  const publicUrl = captain ? `${window.location.origin}/c/${captain.slug}` : "";
  const liveTreksCount = allTreks.filter((t) => t.isPublished).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)]">
            Welcome back, {captain?.fullName || "Captain"} 👋
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Overview of your trek operations for {captain?.brandName || "Your Brand"}
          </p>
        </div>
        <Link href="/dashboard/treks">
          <Button icon={<Plus className="w-4 h-4" />}>New Trek</Button>
        </Link>
      </div>

      {/* Public Page Card (Part 2) */}
      {captain && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <h2 className="text-xs uppercase tracking-wider text-text-dim font-bold">
              Your Public Page
            </h2>
            {liveTreksCount > 0 ? (
              <span className="text-xs text-alpine-green font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-alpine-green animate-ping" />
                {liveTreksCount} {liveTreksCount === 1 ? "trek" : "treks"} live
              </span>
            ) : (
              <span className="text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                No treks published yet — your page is empty
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="bg-charcoal border border-border/80 px-4 py-2.5 rounded-lg font-mono text-sm text-text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-1">
              {publicUrl}
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-border/50 hover:bg-border border border-border rounded-lg px-4 py-2 text-xs font-semibold text-text-primary transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-border/50 hover:bg-border border border-border rounded-lg px-4 py-2 text-xs font-semibold text-text-primary transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-alpine-green/10 hover:bg-alpine-green/20 border border-alpine-green/20 text-alpine-green rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-alpine-green/10" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conditionally Render Empty State Checklist vs Normal Dashboard */}
      {showChecklist ? (
        /* Part 3: Empty State / First-Run Checklist */
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-[family-name:var(--font-sora-family)]">
              {allStepsCompleted ? "🎉 You're Ready to Roll!" : "Get Started Checklist"}
            </h2>
            <p className="text-xs text-text-muted">
              {allStepsCompleted
                ? "All onboarding steps completed successfully. Start sharing your page to trekkers!"
                : "Complete these steps to set up your profile and launch your public trek page."}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-text-muted">
              <span>Progress</span>
              <span>{stepsDoneCount} of 5 done</span>
            </div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-trail-orange to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(stepsDoneCount / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="divide-y divide-border/60">
            {/* Step 1 */}
            <div className="py-3.5 flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-alpine-green shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Create your account</h4>
                <p className="text-xs text-text-muted mt-0.5">Account successfully registered and profile ready.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {isStep2Done ? (
                  <CheckCircle2 className="w-5 h-5 text-alpine-green shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Create your first trek</h4>
                  <p className="text-xs text-text-muted mt-0.5">Set up location, pricing details, and date itinerary.</p>
                </div>
              </div>
              {!isStep2Done && (
                <Link href="/dashboard/treks">
                  <Button size="sm">Create Trek</Button>
                </Link>
              )}
            </div>

            {/* Step 3 */}
            <div className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {isStep3Done ? (
                  <CheckCircle2 className="w-5 h-5 text-alpine-green shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Add a cover photo</h4>
                  <p className="text-xs text-text-muted mt-0.5">Upload a cover banner to make your trek card visual.</p>
                </div>
              </div>
              {!isStep3Done && isStep2Done && (
                <Link href={`/dashboard/treks/${allTreks[0]?.id}`}>
                  <Button size="sm" variant="outline">Upload Photo</Button>
                </Link>
              )}
            </div>

            {/* Step 4 */}
            <div className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {isStep4Done ? (
                  <CheckCircle2 className="w-5 h-5 text-alpine-green shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Publish it</h4>
                  <p className="text-xs text-text-muted mt-0.5">Make your trek public so trekkers can browse details.</p>
                </div>
              </div>
              {!isStep4Done && isStep2Done && (
                <Link href={`/dashboard/treks/${allTreks[0]?.id}`}>
                  <Button size="sm" variant="outline">Publish Trek</Button>
                </Link>
              )}
            </div>

            {/* Step 5 */}
            <div className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {isStep5Done ? (
                  <CheckCircle2 className="w-5 h-5 text-alpine-green shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Share your link</h4>
                  <p className="text-xs text-text-muted mt-0.5">Copy or send your branded page link to your audience.</p>
                </div>
              </div>
              {!isStep5Done && (
                <Button size="sm" variant="outline" onClick={handleCopyLink}>Share Link</Button>
              )}
            </div>
          </div>

          {allStepsCompleted && (
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setChecklistCelebrated(true)}>
                Got it, let's explore!
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Normal Dashboard View */
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Treks"
              value={stats.activeTreks.toString()}
              icon={<Mountain className="w-5 h-5 text-trail-orange" />}
            />
            <StatCard
              label="Total Participants"
              value={stats.totalParticipants.toString()}
              icon={<Users className="w-5 h-5 text-trail-orange" />}
            />
            <StatCard
              label="Amount Collected"
              value={formatINR(stats.amountCollected)}
              icon={<IndianRupee className="w-5 h-5 text-alpine-green" />}
            />
            <StatCard
              label="Pending Dues"
              value={formatINR(stats.pendingDues)}
              icon={<AlertCircle className="w-5 h-5 text-danger" />}
            />
          </div>

          {/* Analytics, Dues, and Feeds Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side: Analytics & Treks */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Analytics Widget (Part 4) */}
              {analytics && (
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-text-dim">
                        Your page this week
                      </h2>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-text-primary">
                          {analytics.uniqueViewsLast7Days}
                        </span>
                        <span className="text-xs text-text-muted">unique visitors</span>
                        <span
                          className={`text-xs font-bold flex items-center gap-0.5 ml-1 ${
                            analytics.percentChange >= 0 ? "text-alpine-green" : "text-danger"
                          }`}
                        >
                          {analytics.percentChange >= 0 ? "+" : ""}
                          {analytics.percentChange}%
                        </span>
                      </div>
                    </div>
                    {/* SVG Sparkline (Last 7 Days) */}
                    {analytics.uniqueViewsLast7Days > 0 ? (
                      <div className="w-24">
                        <div className="flex items-end gap-1 h-12 pt-2">
                          {analytics.sparkline.map((val: number, i: number) => {
                            const maxVal = Math.max(...analytics.sparkline, 1);
                            const heightPercent = (val / maxVal) * 100;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div
                                  className="w-full bg-trail-orange rounded-t-sm hover:bg-trail-orange-hover transition-all"
                                  style={{ height: `${Math.max(10, heightPercent)}%` }}
                                />
                                <span className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 transition-all bg-neutral-900 border border-border text-[9px] px-1.5 py-0.5 rounded text-text-primary whitespace-nowrap z-20 pointer-events-none">
                                  {val} views
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {analytics.uniqueViewsLast7Days === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 bg-charcoal/50 border border-dashed border-border rounded-xl text-center p-4">
                      <p className="text-xs text-text-muted mb-3">
                        Share your link to start seeing visitors
                      </p>
                      <button
                        onClick={handleWhatsAppShare}
                        className="bg-alpine-green/10 hover:bg-alpine-green/20 border border-alpine-green/20 text-alpine-green rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-alpine-green/10" />
                        Share Page
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/60 text-xs">
                      {analytics.mostViewedTrekName && (
                        <div>
                          <span className="block text-text-dim">Most viewed trek</span>
                          <span className="font-semibold text-text-primary mt-0.5 block truncate">
                            {analytics.mostViewedTrekName} ({analytics.mostViewedTrekCount} views)
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="block text-text-dim">Top Referrers</span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-text-muted">
                          {analytics.topReferrers.slice(0, 3).map((ref: any, idx: number) => (
                            <span key={idx}>
                              {ref.source}: <strong className="text-text-primary font-medium">{ref.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming Treks Cards slider */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold font-[family-name:var(--font-sora-family)]">
                    Upcoming Treks
                  </h2>
                  <Link
                    href="/dashboard/treks"
                    className="text-sm text-trail-orange hover:text-trail-orange-hover transition-colors flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {allTreks
                    .filter((t) => t.status === "Upcoming" || t.status === "Ongoing")
                    .map((trek) => {
                      const trekParticipants = allParticipants.filter(
                        (p) => p.trekId === trek.id && p.status !== "Cancelled"
                      );
                      return (
                        <Link
                          key={trek.id}
                          href={`/dashboard/treks/${trek.id}`}
                          className="min-w-[280px] max-w-[320px] flex-shrink-0"
                        >
                          <div className="bg-card border border-border rounded-xl p-5 card-hover h-full">
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className="w-2 h-10 rounded-full"
                                style={{ backgroundColor: trek.coverColor }}
                              />
                              <DifficultyBadge difficulty={trek.difficulty} />
                            </div>
                            <h3 className="font-semibold text-text-primary font-[family-name:var(--font-sora-family)] mb-1">
                              {trek.title}
                            </h3>
                            <p className="text-xs text-text-muted mb-3">
                              {formatDate(trek.startDate)} — {trek.location}
                            </p>
                            <ProgressBar
                              current={trekParticipants.length}
                              max={trek.maxCapacity}
                            />
                            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                              <span>{formatINR(trek.pricePerPerson)}/person</span>
                              <StatusBadge status={trek.status} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>

              {/* Comprehensive Recent Activity (Part 3) */}
              <div>
                <h2 className="text-lg font-semibold font-[family-name:var(--font-sora-family)] mb-4">
                  Recent Activity
                </h2>
                <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center text-text-muted text-sm">
                      No recent activity
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <Link
                        key={activity.id}
                        href={`/dashboard/treks/${activity.trekId}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-border/25 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-charcoal">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">
                            {activity.text}
                          </p>
                        </div>
                        <span className="text-xs text-text-muted whitespace-nowrap">
                          {activity.time}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Dues Chase List Widget (Part 5) */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-text-dim">
                    Trekkers owing you
                  </h2>
                  <Link href="/dashboard/money" className="text-xs text-trail-orange hover:underline font-semibold">
                    View all
                  </Link>
                </div>

                {dues.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-xs bg-charcoal/50 border border-dashed border-border rounded-xl">
                    All dues are fully paid!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dues.slice(0, 5).map((due) => {
                      const isUrgent = due.daysUntilStart >= 0 && due.daysUntilStart < 7;
                      const daysLabel =
                        due.daysUntilStart < 0
                          ? `Started ${Math.abs(due.daysUntilStart)}d ago`
                          : due.daysUntilStart === 0
                          ? "Starts today"
                          : `Starts in ${due.daysUntilStart}d`;

                      // Prefilled WhatsApp reminder text template
                      const waMessage = `Hi ${due.participantName}! Just a gentle reminder — ${formatINR(
                        due.amountPending
                      )} is pending for ${due.trekTitle} starting on ${due.trekStartDate}. You can pay via UPI. See you on the trail!`;

                      return (
                        <div
                          key={due.participantId}
                          className="bg-charcoal border border-border/80 rounded-xl p-3.5 space-y-3"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-semibold text-text-primary text-xs">{due.participantName}</h4>
                              <p className="text-[10px] text-text-muted mt-0.5 truncate max-w-[140px]">
                                {due.trekTitle}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-danger">
                                {formatINR(due.amountPending)}
                              </span>
                              <span
                                className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                                  isUrgent
                                    ? "bg-danger/10 text-danger border border-danger/20"
                                    : "bg-border/60 text-text-muted"
                                }`}
                              >
                                {daysLabel}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/30">
                            <button
                              onClick={() => setQuickPayDue(due)}
                              className="bg-trail-orange/10 hover:bg-trail-orange/20 border border-trail-orange/20 text-trail-orange text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Mark paid
                            </button>
                            <a
                              href={getWhatsAppLink(due.participantPhone, waMessage)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-alpine-green/10 hover:bg-alpine-green/20 border border-alpine-green/20 text-alpine-green text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3 fill-alpine-green/10" />
                              Remind
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Record Quick Payment Modal inside Dashboard */}
      {quickPayDue && (
        <Modal
          isOpen={!!quickPayDue}
          onClose={() => setQuickPayDue(null)}
          title="Record Payment"
        >
          <form onSubmit={handleQuickPaySubmit} className="space-y-4">
            <div>
              <span className="block text-xs text-text-dim">Participant</span>
              <span className="text-sm font-bold text-text-primary">
                {quickPayDue.participantName} ({quickPayDue.trekTitle})
              </span>
            </div>

            <div>
              <label className="block text-xs text-text-muted font-medium mb-1.5">
                Amount Paid (INR)
              </label>
              <input
                type="number"
                required
                min="1"
                max={quickPayDue.amountPending}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={`Pending: ${formatINR(quickPayDue.amountPending)}`}
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-trail-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted font-medium mb-1.5">
                Payment Mode
              </label>
              <select
                value={payMode}
                onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-trail-orange focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-text-muted font-medium mb-1.5">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="e.g. UPI Ref 38291..."
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-trail-orange focus:outline-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-border/80">
              <button
                type="button"
                onClick={() => setQuickPayDue(null)}
                className="px-4 py-2 border border-border hover:bg-border/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paySaving}
                className="px-4 py-2 bg-trail-orange text-white hover:bg-trail-orange-hover text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {paySaving ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
