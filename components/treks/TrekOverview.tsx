"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Clock,
  Mountain,
  Globe,
  Copy,
  ExternalLink,
  Check,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { DifficultyBadge, StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateTrek, getCaptain } from "@/lib/store";
import { formatINR, formatDate, getWhatsAppLink } from "@/lib/utils";
import type { Trek, Participant, Payment } from "@/lib/types";

interface TrekOverviewProps {
  trek: Trek;
  participants: Participant[];
  payments: Payment[];
  onUpdate: () => void;
}

export default function TrekOverview({
  trek,
  participants,
  payments,
  onUpdate,
}: TrekOverviewProps) {
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captainSlug, setCaptainSlug] = useState<string | null>(null);

  const activeParticipants = participants.filter((p) => p.status !== "Cancelled");
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = activeParticipants.length * trek.pricePerPerson;

  // Load captain slug for public URL
  React.useEffect(() => {
    getCaptain().then((c) => {
      if (c) setCaptainSlug(c.slug);
    });
  }, []);

  const publicUrl = captainSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${captainSlug}/${trek.slug}`
    : null;

  const handlePublishToggle = async () => {
    setPublishing(true);
    const result = await updateTrek(trek.id, { isPublished: !trek.isPublished });
    if (result) {
      toast(result.isPublished ? "Trek published! It's now visible on your public page." : "Trek unpublished");
      onUpdate();
    }
    setPublishing(false);
  };

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (publicUrl) {
      const msg = `Check out ${trek.title} by our team!\n📍 ${trek.location}\n📅 ${formatDate(trek.startDate)}\n💰 ${formatINR(trek.pricePerPerson)}/person\n\n${publicUrl}`;
      window.open(getWhatsAppLink("", msg), "_blank");
    }
  };

  // Check for incomplete published trek
  const isIncomplete = trek.isPublished && (!trek.description || trek.itinerary.length === 0);

  const startDate = new Date(trek.startDate);
  const endDate = new Date(trek.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="space-y-6">
      {/* Incomplete warning */}
      {isIncomplete && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">Published but incomplete</p>
            <p className="text-xs text-text-muted mt-1">
              {!trek.description && "Add a description. "}
              {trek.itinerary.length === 0 && "Add itinerary items. "}
              Visitors will see a bare page.
            </p>
          </div>
        </div>
      )}

      {/* Publishing Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-border/50">
              <Globe className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary font-[family-name:var(--font-sora-family)]">
                Publishing
              </h3>
              <p className="text-xs text-text-muted">
                {trek.isPublished
                  ? "This trek is live on your public page"
                  : "Publish to make this visible to participants"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle */}
            <button
              onClick={handlePublishToggle}
              disabled={publishing}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: trek.isPublished ? "#2DD4A7" : "#21262D" }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                style={{ transform: trek.isPublished ? "translateX(30px)" : "translateX(4px)" }}
              />
            </button>
            <span className="text-xs text-text-muted font-medium">
              {trek.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Public URL section (only when published) */}
        {trek.isPublished && publicUrl && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-0 flex items-center gap-2 bg-charcoal border border-border rounded-lg px-3 py-2">
                <span className="text-xs text-text-muted truncate">{publicUrl}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={handleCopyLink}>
                {copied ? <Check className="w-3.5 h-3.5 text-alpine-green" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => window.open(publicUrl, "_blank")}>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleShareWhatsApp}>
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Trek Details */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium mb-4">
            Trek Details
          </h3>
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-trail-orange flex-shrink-0" />
              <div>
                <p className="text-sm text-text-primary">{trek.location}</p>
                {trek.region && <p className="text-xs text-text-muted">{trek.region}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-alpine-green flex-shrink-0" />
              <div>
                <p className="text-sm text-text-primary">
                  {formatDate(trek.startDate)} — {formatDate(trek.endDate)}
                </p>
                <p className="text-xs text-text-muted">{durationDays} {durationDays === 1 ? "day" : "days"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mountain className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={trek.difficulty} />
                <StatusBadge status={trek.status} />
              </div>
            </div>
            {trek.meetingPoint && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-text-dim flex-shrink-0" />
                <p className="text-xs text-text-muted">{trek.meetingPoint}</p>
              </div>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium mb-4">
            Capacity
          </h3>
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <Users className="w-5 h-5 text-alpine-green mr-1" />
              <span className="text-3xl font-bold text-text-primary">
                {activeParticipants.length}
              </span>
              <span className="text-text-muted text-lg">/ {trek.maxCapacity}</span>
            </div>
            <ProgressBar
              current={activeParticipants.length}
              max={trek.maxCapacity}
              className="mb-2"
            />
            <p className="text-xs text-text-muted">
              {trek.maxCapacity - activeParticipants.length} spots remaining
            </p>
          </div>
        </div>

        {/* Financials */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium mb-4">
            Financials
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Per Person
              </span>
              <span className="text-sm font-medium text-text-primary">
                {formatINR(trek.pricePerPerson)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Collected</span>
              <span className="text-sm font-medium text-alpine-green">
                {formatINR(totalCollected)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Expected</span>
              <span className="text-sm font-medium text-text-primary">
                {formatINR(totalExpected)}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-sm text-text-muted font-medium">Pending</span>
              <span className="text-sm font-bold text-trail-orange">
                {formatINR(Math.max(0, totalExpected - totalCollected))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {trek.description && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium mb-3">
            Description
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {trek.description}
          </p>
        </div>
      )}

      {/* Highlights */}
      {trek.highlights && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium mb-3">
            Highlights
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {trek.highlights}
          </p>
        </div>
      )}

      {/* Participant Quick List */}
      {activeParticipants.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium mb-4">
            Participants ({activeParticipants.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeParticipants.slice(0, 8).map((p) => {
              const participantPayments = payments.filter(
                (pay) => pay.participantId === p.id
              );
              const totalPaid = participantPayments.reduce(
                (s, pay) => s + pay.amount,
                0
              );
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 bg-charcoal rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-trail-orange/20 flex items-center justify-center text-xs font-medium text-trail-orange">
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-sm text-text-primary">{p.name}</span>
                  </div>
                  <StatusBadge
                    status={
                      totalPaid >= trek.pricePerPerson
                        ? "Paid"
                        : totalPaid > 0
                        ? "Partial"
                        : "Pending"
                    }
                  />
                </div>
              );
            })}
          </div>
          {activeParticipants.length > 8 && (
            <p className="text-xs text-text-muted text-center mt-3">
              +{activeParticipants.length - 8} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
