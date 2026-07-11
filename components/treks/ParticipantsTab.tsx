"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  MessageCircle,
  UserMinus,
  Download,
  ArrowUpDown,
  ShieldAlert,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  getParticipants,
  addParticipant,
  updateParticipant,
  removeParticipant,
  getPayments,
} from "@/lib/store";
import { formatDate, getTelLink, getWhatsAppLink, exportCSV } from "@/lib/utils";
import type { Trek, Participant, ParticipantStatus } from "@/lib/types";

export default function ParticipantsTab({
  trek,
  onUpdate,
}: {
  trek: Trek;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "joinedAt" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAdd, setShowAdd] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "confirmed" | "waitlist" | "paid" | "pending">("all");

  const participants = getParticipants(trek.id);
  const payments = getPayments(trek.id);

  const getPaymentStatus = (participantId: string) => {
    const pPayments = payments.filter((p) => p.participantId === participantId);
    const totalPaid = pPayments.reduce((s, p) => s + p.amount, 0);
    if (totalPaid >= trek.pricePerPerson) return "Paid";
    if (totalPaid > 0) return "Partial";
    return "Pending";
  };

  const filtered = participants
    .filter((p) => {
      // 1. Text Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.email.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Tab selection filter
      if (filterTab === "confirmed") return p.status === "Confirmed";
      if (filterTab === "waitlist") return p.status === "Waitlist";
      if (filterTab === "paid") return getPaymentStatus(p.id) === "Paid";
      if (filterTab === "pending") return getPaymentStatus(p.id) === "Pending" || getPaymentStatus(p.id) === "Partial";
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "joinedAt") return (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()) * dir;
      return a.status.localeCompare(b.status) * dir;
    });

  const toggleSort = (col: "name" | "joinedAt" | "status") => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleAdd = (data: Omit<Participant, "id" | "joinedAt">) => {
    addParticipant(data);
    onUpdate();
    setShowAdd(false);
    toast("Participant added!");
  };

  const handleStatusChange = (id: string, status: ParticipantStatus) => {
    updateParticipant(id, { status });
    onUpdate();
    toast(`Participant moved to ${status}`);
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remove ${name}? Their payment records will also be deleted.`)) {
      removeParticipant(id);
      onUpdate();
      toast("Participant removed", "error");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Phone", "Email", "Emergency Contact", "Blood Group", "Status", "Payment Status", "Joined"];
    const rows = participants.map((p) => [
      p.name, p.phone, p.email, p.emergencyContact, p.bloodGroup, p.status, getPaymentStatus(p.id), formatDate(p.joinedAt),
    ]);
    exportCSV(headers, rows, `${trek.title.replace(/\s+/g, "_")}_participants`);
    toast("CSV exported!");
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="text"
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={<ShieldAlert className="w-4 h-4 text-trail-orange" />}
              onClick={() => setShowEmergency(true)}
              className="flex-1 sm:flex-none"
            >
              Emergency Info
            </Button>
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV} className="flex-1 sm:flex-none">
              Export CSV
            </Button>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)} className="flex-1 sm:flex-none">
              Add Participant
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "confirmed", label: "Confirmed" },
            { id: "waitlist", label: "Waitlist" },
            { id: "paid", label: "Paid" },
            { id: "pending", label: "Pending Dues" },
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
      {filtered.length === 0 ? (
        <EmptyState
          title="No participants yet"
          description="Add participants to this trek"
          actionLabel="Add Participant"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-text-primary text-base">{p.name}</h4>
                    <p className="text-xs text-text-muted mt-0.5">Joined: {formatDate(p.joinedAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={p.status} />
                    <StatusBadge status={getPaymentStatus(p.id)} />
                  </div>
                </div>

                <div className="text-xs text-text-muted space-y-1 pt-1 border-t border-border/50">
                  <p><span className="text-text-dim">Phone:</span> {p.phone}</p>
                  {p.email && <p><span className="text-text-dim">Email:</span> {p.email}</p>}
                  {p.emergencyContact && <p><span className="text-text-dim">Emergency:</span> {p.emergencyContact}</p>}
                  {p.bloodGroup && <p><span className="text-text-dim">Blood Group:</span> {p.bloodGroup}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <a
                    href={getTelLink(p.phone)}
                    className="flex-1 max-w-[44px] flex items-center justify-center p-2 rounded-lg bg-charcoal border border-border text-text-muted hover:text-text-primary active:bg-border transition-colors min-h-[40px]"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={getWhatsAppLink(p.phone, `Hi ${p.name.split(" ")[0]}!`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 max-w-[44px] flex items-center justify-center p-2 rounded-lg bg-charcoal border border-border text-text-muted hover:text-alpine-green active:bg-border transition-colors min-h-[40px]"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  {p.status === "Confirmed" && (
                    <button
                      onClick={() => handleStatusChange(p.id, "Waitlist")}
                      className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-charcoal border border-border text-text-muted hover:text-trail-orange active:bg-border transition-colors min-h-[40px] cursor-pointer"
                    >
                      Waitlist
                    </button>
                  )}
                  {p.status === "Waitlist" && (
                    <button
                      onClick={() => handleStatusChange(p.id, "Confirmed")}
                      className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-charcoal border border-border text-alpine-green hover:bg-alpine-green/5 active:bg-border transition-colors min-h-[40px] cursor-pointer"
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(p.id, p.name)}
                    className="flex-1 max-w-[44px] flex items-center justify-center p-2 rounded-lg bg-charcoal border border-danger/30 text-text-muted hover:text-danger active:bg-danger/10 transition-colors min-h-[40px] cursor-pointer"
                    title="Remove"
                  >
                    <Trash2Icon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 cursor-pointer">
                      Name <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    <button onClick={() => toggleSort("status")} className="flex items-center gap-1 cursor-pointer">
                      Status <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Payment</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">
                    <button onClick={() => toggleSort("joinedAt")} className="flex items-center gap-1 cursor-pointer">
                      Joined <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-border/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-muted md:hidden">{p.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{p.phone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={getPaymentStatus(p.id)} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(p.joinedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={getTelLink(p.phone)}
                          className="p-1.5 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text-primary"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={getWhatsAppLink(p.phone, `Hi ${p.name.split(" ")[0]}!`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-alpine-green"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        {p.status === "Confirmed" && (
                          <button
                            onClick={() => handleStatusChange(p.id, "Waitlist")}
                            className="p-1.5 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-trail-orange cursor-pointer"
                            title="Move to Waitlist"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                        {p.status === "Waitlist" && (
                          <button
                            onClick={() => handleStatusChange(p.id, "Confirmed")}
                            className="p-1.5 rounded-lg hover:bg-border transition-colors text-xs text-alpine-green cursor-pointer"
                            title="Confirm"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(p.id, p.name)}
                          className="p-1.5 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-danger cursor-pointer"
                          title="Remove"
                        >
                          <Trash2Icon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}


      {/* Add Modal */}
      <AddParticipantModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        trekId={trek.id}
        onAdd={handleAdd}
      />

      {/* Emergency Sheet Modal */}
      <EmergencySheetModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
        participants={participants.filter((p) => p.status === "Confirmed")}
      />
    </div>
  );
}

function EmergencySheetModal({
  isOpen,
  onClose,
  participants,
}: {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency & Medical Directory" size="lg">
      <div className="space-y-4">
        <p className="text-xs text-text-muted">
          Showing confirmed participants. Keep this list handy during the trek for quick access to emergency contacts and blood groups.
        </p>

        {participants.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">No confirmed participants found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
            {participants.map((p) => (
              <div key={p.id} className="bg-charcoal border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-text-primary text-sm">{p.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-danger/15 text-danger text-xs font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-danger" />
                    {p.bloodGroup || "N/A"}
                  </span>
                </div>
                <div className="text-xs text-text-muted space-y-1">
                  <p className="flex items-center justify-between">
                    <span>Phone:</span>
                    <a href={getTelLink(p.phone)} className="text-trail-orange hover:underline">{p.phone}</a>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Emergency Contact:</span>
                    <a href={getTelLink(p.emergencyContact)} className="text-trail-orange hover:underline">{p.emergencyContact}</a>
                  </p>
                </div>
                <div className="flex gap-2 pt-1.5">
                  <a
                    href={getWhatsAppLink(p.emergencyContact, `Hello, this is Arjun from Summit Seekers. I am the captain for ${p.name}'s trek.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1 px-2.5 rounded bg-border hover:bg-border-hover text-text-muted hover:text-text-primary transition-colors text-center text-xs font-medium flex items-center justify-center gap-1 min-h-[32px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-alpine-green" />
                    Emergency WA
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose} size="sm">Close Directory</Button>
        </div>
      </div>
    </Modal>
  );
}

function Trash2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function AddParticipantModal({
  isOpen,
  onClose,
  trekId,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  trekId: string;
  onAdd: (data: Omit<Participant, "id" | "joinedAt">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    emergencyContact: "",
    bloodGroup: "O+",
    status: "Confirmed" as ParticipantStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    onAdd({
      trekId,
      name: form.name,
      phone: form.phone,
      email: form.email,
      emergencyContact: form.emergencyContact,
      bloodGroup: form.bloodGroup,
      status: form.status,
    });
    setForm({ name: "", phone: "", email: "", emergencyContact: "", bloodGroup: "O+", status: "Confirmed" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Participant">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Phone" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Input label="Email" type="email" placeholder="priya@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Emergency Contact" placeholder="Phone number" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
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
          <Button type="submit" className="flex-1">Add Participant</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
