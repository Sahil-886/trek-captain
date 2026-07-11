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
} from "lucide-react";
import { StatCard } from "@/components/ui/Card";
import { DifficultyBadge, StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { getTreks, getParticipants, getPayments, getDashboardStats, getCaptain } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/utils";
import type { Trek, Participant, Payment, Captain } from "@/lib/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeTreks: 0, totalParticipants: 0, amountCollected: 0, pendingDues: 0 });
  const [treks, setTreks] = useState<Trek[]>([]);
  const [activities, setActivities] = useState<{ id: string; type: string; text: string; time: string; icon: React.ReactNode }[]>([]);
  const [captain, setCaptain] = useState<Captain | null>(null);

  useEffect(() => {
    const s = getDashboardStats();
    setStats(s);

    const c = getCaptain();
    setCaptain(c);

    const allTreks = getTreks();
    setTreks(allTreks.filter((t) => t.status === "Upcoming" || t.status === "Ongoing"));

    // Build activity feed from recent payments and joins
    const allParticipants = getParticipants();
    const allPayments = getPayments();
    const feed: { id: string; type: string; text: string; time: string; icon: React.ReactNode; sortTime: number }[] = [];

    allPayments.slice(-8).forEach((p: Payment) => {
      const participant = allParticipants.find((pp: Participant) => pp.id === p.participantId);
      const trek = allTreks.find((t: Trek) => t.id === p.trekId);
      if (participant && trek) {
        feed.push({
          id: p.id,
          type: "payment",
          text: `${participant.name} paid ${formatINR(p.amount)} for ${trek.title}`,
          time: formatDate(p.paidAt),
          icon: <CreditCard className="w-4 h-4 text-alpine-green" />,
          sortTime: new Date(p.paidAt).getTime(),
        });
      }
    });

    allParticipants
      .filter((p: Participant) => p.status === "Confirmed")
      .slice(-6)
      .forEach((p: Participant) => {
        const trek = allTreks.find((t: Trek) => t.id === p.trekId);
        if (trek) {
          feed.push({
            id: p.id,
            type: "join",
            text: `${p.name} joined ${trek.title}`,
            time: formatDate(p.joinedAt),
            icon: <UserPlus className="w-4 h-4 text-trail-orange" />,
            sortTime: new Date(p.joinedAt).getTime(),
          });
        }
      });

    feed.sort((a, b) => b.sortTime - a.sortTime);
    setActivities(feed.slice(0, 10));
    setLoading(false);
  }, []);

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

  const upcomingTreks = treks;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)]">
            Welcome back, {captain?.name || "Captain"} 👋
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Overview of your trek operations for {captain?.orgName || "Summit Seekers"}
          </p>
        </div>
        <Link href="/dashboard/treks">
          <Button icon={<Plus className="w-4 h-4" />}>New Trek</Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Treks"
          value={stats.activeTreks.toString()}
          icon={<Mountain className="w-5 h-5" />}
        />
        <StatCard
          label="Total Participants"
          value={stats.totalParticipants.toString()}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Amount Collected"
          value={formatINR(stats.amountCollected)}
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Dues"
          value={formatINR(stats.pendingDues)}
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Upcoming Treks */}
      {upcomingTreks.length > 0 && (
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
            {upcomingTreks.map((trek) => {
              const participants = getParticipants(trek.id).filter(
                (p) => p.status !== "Cancelled"
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
                      current={participants.length}
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
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-sora-family)] mb-4">
          Recent Activity
        </h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div className="p-2 rounded-lg bg-border/50">
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
