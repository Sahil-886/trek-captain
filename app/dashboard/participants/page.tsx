"use client";

import React, { useState, useEffect } from "react";
import { Search, Phone, MessageCircle, X, ShieldAlert, Heart, Calendar, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { getGlobalParticipants, getTreks, addParticipant } from "@/lib/store";
import { formatDate, getTelLink, getWhatsAppLink, formatINR } from "@/lib/utils";
import type { Participant, Payment, Trek, ParticipantStatus } from "@/lib/types";

export default function ParticipantsPage() {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<any[]>([]);
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unpaid" | "partial" | "paid">("all");
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [data, treksList] = await Promise.all([
      getGlobalParticipants(),
      getTreks(),
    ]);
    setParticipants(data);
    setTreks(treksList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddParticipant = async (data: {
    trekId: string;
    name: string;
    phone: string;
    email: string;
    emergencyContact: string;
    bloodGroup: string;
    status: ParticipantStatus;
  }) => {
    const res = await addParticipant({
      ...data,
      medicalNotes: "",
      age: null,
      gender: "",
      bloodGroup: data.bloodGroup || "",
      emergencyContact: data.emergencyContact || "",
      emergencyContactPhone: "",
    });
    if (res) {
      await loadData();
      setShowAdd(false);
      toast("Participant added manually!");
    } else {
      toast("Failed to add participant");
    }
  };

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);

    if (!matchesSearch) return false;

    if (filterTab === "unpaid") return p.paymentStatus === "Pending";
    if (filterTab === "partial") return p.paymentStatus === "Partial";
    if (filterTab === "paid") return p.paymentStatus === "Paid";
    return true;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Participants" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-sora-family)]">
          Global Participant Directory
        </h1>
        <Button
          onClick={() => setShowAdd(true)}
          icon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Add Participant
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "unpaid", label: "Unpaid" },
            { id: "partial", label: "Partial" },
            { id: "paid", label: "Paid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                filterTab === tab.id
                  ? "bg-trail-orange/15 border-trail-orange/30 text-trail-orange"
                  : "bg-card border-border text-text-muted hover:text-text-primary hover:border-border-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table (Desktop) & Cards (Mobile) */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-trail-orange/30 border-t-trail-orange rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No participants found"
          description={search ? "Try a different search term" : "No participants listed yet"}
        />
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedParticipant(p)}
                className="bg-card border border-border rounded-xl p-4 space-y-3 cursor-pointer hover:border-border-hover transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-text-primary text-base">{p.name}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{p.trekTitle}</p>
                  </div>
                  <StatusBadge status={p.paymentStatus} />
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted pt-2 border-t border-border/50">
                  <a
                    href={getTelLink(p.phone)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-trail-orange hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {p.phone}
                  </a>
                  <span className="text-text-dim">Status: {p.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-text-muted font-medium">Name</th>
                  <th className="px-5 py-3 text-text-muted font-medium">Trek Name</th>
                  <th className="px-5 py-3 text-text-muted font-medium">Phone</th>
                  <th className="px-5 py-3 text-text-muted font-medium">Payment Status</th>
                  <th className="px-5 py-3 text-text-muted font-medium">Roster Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedParticipant(p)}
                    className="hover:bg-border/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-medium text-text-primary">{p.name}</td>
                    <td className="px-5 py-3.5 text-text-muted">{p.trekTitle}</td>
                    <td className="px-5 py-3.5 text-text-muted">
                      <a
                        href={getTelLink(p.phone)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-trail-orange hover:underline flex items-center gap-1.5 w-fit"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {p.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Participant Drawer / Slide-Over Modal */}
      {selectedParticipant && (
        <Modal
          isOpen={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          title="Participant Profile"
          variant="slide-over"
        >
          <div className="space-y-6">
            {/* Header section inside drawer */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-trail-orange/10 border border-trail-orange/20 flex items-center justify-center text-trail-orange font-bold text-lg">
                {selectedParticipant.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-base font-[family-name:var(--font-sora-family)]">
                  {selectedParticipant.name}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{selectedParticipant.trekTitle}</p>
              </div>
            </div>

            {/* Info list */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-dim">Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-text-muted">Age / Gender</span>
                  <span className="text-text-primary font-medium">
                    {selectedParticipant.age || "N/A"} / {selectedParticipant.gender || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-text-muted">Blood Group</span>
                  <span className="text-danger font-semibold flex items-center gap-1 mt-0.5">
                    <Heart className="w-3.5 h-3.5 fill-danger" />
                    {selectedParticipant.bloodGroup || "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-xs text-text-muted">Phone Number</span>
                <a
                  href={getTelLink(selectedParticipant.phone)}
                  className="text-trail-orange hover:underline text-sm font-medium flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-4 h-4" />
                  {selectedParticipant.phone}
                </a>
              </div>

              {selectedParticipant.email && (
                <div>
                  <span className="block text-xs text-text-muted">Email Address</span>
                  <span className="text-text-primary text-sm font-medium">{selectedParticipant.email}</span>
                </div>
              )}

              {selectedParticipant.emergencyContact && (
                <div>
                  <span className="block text-xs text-text-muted">Emergency Contact</span>
                  <a
                    href={getTelLink(selectedParticipant.emergencyContact)}
                    className="text-trail-orange hover:underline text-sm font-medium flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedParticipant.emergencyContact}
                  </a>
                </div>
              )}

              {selectedParticipant.medicalNotes && (
                <div className="p-3 bg-danger/5 border border-danger/10 rounded-xl">
                  <span className="text-xs text-danger font-semibold flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4" /> Medical Notes
                  </span>
                  <p className="text-xs text-text-muted whitespace-pre-wrap">
                    {selectedParticipant.medicalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Ledger */}
            <div className="space-y-3.5 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-dim">Payment History</h4>
                <StatusBadge status={selectedParticipant.paymentStatus} />
              </div>

              <div className="bg-charcoal border border-border/80 rounded-xl p-3 flex justify-between text-xs">
                <div>
                  <span className="block text-text-dim">Trek Price</span>
                  <span className="font-semibold text-text-primary">{formatINR(selectedParticipant.pricePerPerson)}</span>
                </div>
                <div>
                  <span className="block text-text-dim">Paid So Far</span>
                  <span className="font-semibold text-alpine-green">{formatINR(selectedParticipant.totalPaid)}</span>
                </div>
                <div>
                  <span className="block text-text-dim">Pending</span>
                  <span className="font-semibold text-danger">{formatINR(selectedParticipant.amountPending)}</span>
                </div>
              </div>

              {selectedParticipant.payments.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4 bg-charcoal/50 border border-dashed border-border rounded-xl">
                  No payment records found
                </p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {selectedParticipant.payments.map((pay: any) => (
                    <div
                      key={pay.id}
                      className="bg-charcoal border border-border/60 rounded-lg px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="block font-medium text-text-primary">{pay.mode}</span>
                        <span className="text-[10px] text-text-muted">{formatDate(pay.paidAt)}</span>
                      </div>
                      <span className="font-bold text-alpine-green">{formatINR(pay.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <AddParticipantModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        treks={treks}
        onAdd={handleAddParticipant}
      />
    </div>
  );
}

function AddParticipantModal({
  isOpen,
  onClose,
  treks,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  treks: Trek[];
  onAdd: (data: {
    trekId: string;
    name: string;
    phone: string;
    email: string;
    emergencyContact: string;
    bloodGroup: string;
    status: ParticipantStatus;
  }) => void;
}) {
  const [form, setForm] = useState({
    trekId: treks[0]?.id || "",
    name: "",
    phone: "",
    email: "",
    emergencyContact: "",
    bloodGroup: "O+",
    status: "Confirmed" as ParticipantStatus,
  });

  // Keep trekId in sync when treks finish loading
  useEffect(() => {
    if (treks.length > 0 && !form.trekId) {
      setForm((f) => ({ ...f, trekId: treks[0].id }));
    }
  }, [treks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.trekId || !form.name.trim() || !form.phone.trim()) return;
    onAdd({
      trekId: form.trekId,
      name: form.name,
      phone: form.phone,
      email: form.email,
      emergencyContact: form.emergencyContact,
      bloodGroup: form.bloodGroup,
      status: form.status,
    });
    setForm({
      trekId: treks[0]?.id || "",
      name: "",
      phone: "",
      email: "",
      emergencyContact: "",
      bloodGroup: "O+",
      status: "Confirmed",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Participant">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Trek *"
          value={form.trekId}
          onChange={(e) => setForm({ ...form, trekId: e.target.value })}
          options={treks.map((t) => ({ value: t.id, label: `${t.title} (${formatDate(t.startDate)})` }))}
          required
        />
        <Input
          label="Full Name *"
          placeholder="e.g. Priya Sharma"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Phone *"
          placeholder="9876543210"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="priya@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Emergency Contact"
          placeholder="Phone number"
          value={form.emergencyContact}
          onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
        />
        <Select
          label="Blood Group"
          value={form.bloodGroup}
          onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ParticipantStatus })}
          options={[
            { value: "Confirmed", label: "Confirmed" },
            { value: "Waitlist", label: "Waitlist" },
          ]}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">
            Add Participant
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
