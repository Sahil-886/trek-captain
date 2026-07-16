"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  Users,
  CreditCard,
  Map,
  Megaphone,
  Trash2,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getTrekById, deleteTrek, getParticipants, getPayments, getAnnouncements } from "@/lib/store";
import type { Trek, Participant, Payment, Announcement } from "@/lib/types";
import TrekOverview from "@/components/treks/TrekOverview";
import ParticipantsTab from "@/components/treks/ParticipantsTab";
import PaymentsTab from "@/components/treks/PaymentsTab";
import ItineraryTab from "@/components/treks/ItineraryTab";
import AnnouncementsTab from "@/components/treks/AnnouncementsTab";

export default function TrekDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [trek, setTrek] = useState<Trek | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const t = await getTrekById(id);
      if (!t) {
        setLoading(false);
        return;
      }
      setTrek(t);

      const [p, pay, ann] = await Promise.all([
        getParticipants(id),
        getPayments(id),
        getAnnouncements(id),
      ]);
      setParticipants(p);
      setPayments(pay);
      setAnnouncements(ann);
    } catch (err) {
      console.error("Failed to load trek:", err);
      toast("Failed to load trek data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-trail-orange/30 border-t-trail-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        Trek not found
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this trek? This action cannot be undone.")) {
      await deleteTrek(trek.id);
      toast("Trek deleted", "error");
      router.push("/dashboard/treks");
    }
  };

  const activeParticipants = participants.filter((p) => p.status !== "Cancelled");

  const tabs = [
    { id: "overview", label: "Overview", icon: <Info className="w-4 h-4" /> },
    { id: "participants", label: "Participants", icon: <Users className="w-4 h-4" />, count: activeParticipants.length },
    { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" />, count: payments.length },
    { id: "itinerary", label: "Itinerary", icon: <Map className="w-4 h-4" />, count: trek.itinerary.length },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" />, count: announcements.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Treks", href: "/dashboard/treks" },
          { label: trek.title },
        ]}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: trek.coverColor }}
          />
          <h1 className="text-2xl font-bold font-[family-name:var(--font-sora-family)]">
            {trek.title}
          </h1>
        </div>
        <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
          Delete Trek
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === "overview" && <TrekOverview trek={trek} participants={participants} payments={payments} onUpdate={refresh} />}
        {activeTab === "participants" && <ParticipantsTab trek={trek} participants={participants} payments={payments} onUpdate={refresh} />}
        {activeTab === "payments" && <PaymentsTab trek={trek} participants={participants} payments={payments} onUpdate={refresh} />}
        {activeTab === "itinerary" && <ItineraryTab trek={trek} onUpdate={refresh} />}
        {activeTab === "announcements" && <AnnouncementsTab trek={trek} announcements={announcements} onUpdate={refresh} />}
      </div>
    </div>
  );
}
