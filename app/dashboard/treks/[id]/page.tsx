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
import { getTrekById, deleteTrek, getParticipants, getPayments, getItinerary, getAnnouncements } from "@/lib/store";
import type { Trek } from "@/lib/types";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const t = getTrekById(id);
    if (t) setTrek(t);
  }, [id, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  if (!trek) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        Trek not found
      </div>
    );
  }

  const participants = getParticipants(trek.id);
  const payments = getPayments(trek.id);
  const itinerary = getItinerary(trek.id);
  const announcements = getAnnouncements(trek.id);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this trek? This action cannot be undone.")) {
      deleteTrek(trek.id);
      toast("Trek deleted", "error");
      router.push("/dashboard/treks");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Info className="w-4 h-4" /> },
    { id: "participants", label: "Participants", icon: <Users className="w-4 h-4" />, count: participants.filter((p) => p.status !== "Cancelled").length },
    { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" />, count: payments.length },
    { id: "itinerary", label: "Itinerary", icon: <Map className="w-4 h-4" />, count: itinerary.length },
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
        {activeTab === "overview" && <TrekOverview trek={trek} onUpdate={refresh} />}
        {activeTab === "participants" && <ParticipantsTab trek={trek} onUpdate={refresh} />}
        {activeTab === "payments" && <PaymentsTab trek={trek} onUpdate={refresh} />}
        {activeTab === "itinerary" && <ItineraryTab trek={trek} onUpdate={refresh} />}
        {activeTab === "announcements" && <AnnouncementsTab trek={trek} onUpdate={refresh} />}
      </div>
    </div>
  );
}
