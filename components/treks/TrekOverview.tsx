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
  ShieldCheck,
  Edit3,
  X,
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

  const [safetyExpanded, setSafetyExpanded] = useState(false);
  const [safetyForm, setSafetyForm] = useState({
    emergencyContactName: trek.emergencyContactName || "",
    emergencyContactPhone: trek.emergencyContactPhone || "",
    nearestHospital: trek.nearestHospital || "",
    networkAvailability: trek.networkAvailability || "",
    safetyNotes: trek.safetyNotes || "",
    fitnessRequirement: trek.fitnessRequirement || "",
    whatsappGroupUrl: trek.whatsappGroupUrl || "",
  });
  const [savingSafety, setSavingSafety] = useState(false);

  const [editingCapacity, setEditingCapacity] = useState(false);
  const [tempCapacity, setTempCapacity] = useState(trek.maxCapacity.toString());
  const [savingCapacity, setSavingCapacity] = useState(false);

  const handleSaveCapacityLimit = async () => {
    const val = parseInt(tempCapacity, 10);
    if (isNaN(val) || val <= 0) {
      toast("Please enter a valid capacity limit", "error");
      return;
    }
    setSavingCapacity(true);
    try {
      const result = await updateTrek(trek.id, { maxCapacity: val });
      if (result) {
        toast("Capacity limit updated successfully!");
        setEditingCapacity(false);
        onUpdate();
      } else {
        toast("Failed to update capacity limit", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error updating capacity limit", "error");
    } finally {
      setSavingCapacity(false);
    }
  };

  const handleSaveSafety = async () => {
    setSavingSafety(true);
    try {
      const result = await updateTrek(trek.id, safetyForm);
      if (result) {
        toast("Safety details updated successfully!");
        onUpdate();
      } else {
        toast("Failed to update safety details");
      }
    } catch (err) {
      console.error(err);
      toast("Error updating safety details");
    } finally {
      setSavingSafety(false);
    }
  };

  const activeParticipants = participants.filter((p) => p.status !== "Cancelled");
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = activeParticipants.length * trek.pricePerPerson;

  // Load captain slug for public URL
  React.useEffect(() => {
    getCaptain().then((c) => {
      if (c) setCaptainSlug(c.slug);
    });
  }, []);

  React.useEffect(() => {
    setSafetyForm({
      emergencyContactName: trek.emergencyContactName || "",
      emergencyContactPhone: trek.emergencyContactPhone || "",
      nearestHospital: trek.nearestHospital || "",
      networkAvailability: trek.networkAvailability || "",
      safetyNotes: trek.safetyNotes || "",
      fitnessRequirement: trek.fitnessRequirement || "",
      whatsappGroupUrl: trek.whatsappGroupUrl || "",
    });
    setTempCapacity(trek.maxCapacity.toString());
  }, [trek]);

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
        <div className="bg-card border border-border rounded-xl p-5 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase text-text-dim tracking-wider font-medium">
              Capacity
            </h3>
            {!editingCapacity && (
              <button
                onClick={() => setEditingCapacity(true)}
                className="text-text-muted hover:text-accent transition-colors p-1 rounded hover:bg-charcoal/50 cursor-pointer"
                title="Edit Capacity"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-center">
            {editingCapacity ? (
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={tempCapacity}
                    onChange={(e) => setTempCapacity(e.target.value)}
                    className="w-20 text-center bg-charcoal border border-border rounded px-2 py-1 text-sm font-bold text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleSaveCapacityLimit}
                    disabled={savingCapacity}
                    className="p-1.5 bg-alpine-green/10 hover:bg-alpine-green/20 text-alpine-green rounded transition-colors cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCapacity(false);
                      setTempCapacity(trek.maxCapacity.toString());
                    }}
                    className="p-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-text-dim leading-snug">
                  Enter new maximum capacity limit for this trek.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
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

      {/* Safety Info Editor */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setSafetyExpanded(!safetyExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-border/20 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary font-[family-name:var(--font-sora-family)]">
                Safety & Emergency Info
              </h3>
              <p className="text-xs text-text-muted">
                Configure safety details visible to public visitors
              </p>
            </div>
          </div>
          <span className="text-xs text-accent font-semibold">
            {safetyExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {safetyExpanded && (
          <div className="p-5 border-t border-border space-y-4 bg-charcoal/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram (Base Coordinator)"
                  value={safetyForm.emergencyContactName}
                  onChange={(e) => setSafetyForm({ ...safetyForm, emergencyContactName: e.target.value })}
                  className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={safetyForm.emergencyContactPhone}
                  onChange={(e) => setSafetyForm({ ...safetyForm, emergencyContactPhone: e.target.value })}
                  className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Nearest Hospital
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sahyadri Hospital, Base Village (12km)"
                  value={safetyForm.nearestHospital}
                  onChange={(e) => setSafetyForm({ ...safetyForm, nearestHospital: e.target.value })}
                  className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Network Availability
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jio/Airtel till base village, no signal above"
                  value={safetyForm.networkAvailability}
                  onChange={(e) => setSafetyForm({ ...safetyForm, networkAvailability: e.target.value })}
                  className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Fitness Requirement
              </label>
              <input
                type="text"
                placeholder="e.g. Should be able to walk 6km continuously with 5kg backpack"
                value={safetyForm.fitnessRequirement}
                onChange={(e) => setSafetyForm({ ...safetyForm, fitnessRequirement: e.target.value })}
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                WhatsApp Group Invite Link
              </label>
              <input
                type="text"
                placeholder="e.g. https://chat.whatsapp.com/..."
                value={safetyForm.whatsappGroupUrl}
                onChange={(e) => setSafetyForm({ ...safetyForm, whatsappGroupUrl: e.target.value })}
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
              />
              <p className="text-[10px] text-text-dim mt-1">
                Registered participants will be prompted to join this group immediately after registering online.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Safety Notes
              </label>
              <textarea
                placeholder="e.g. Carry personal medications. First-aid kit and oxygen cylinder are available with leads."
                value={safetyForm.safetyNotes}
                onChange={(e) => setSafetyForm({ ...safetyForm, safetyNotes: e.target.value })}
                className="w-full bg-charcoal border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={handleSaveSafety}
                disabled={savingSafety}
              >
                {savingSafety ? "Saving..." : "Save Safety Info"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
