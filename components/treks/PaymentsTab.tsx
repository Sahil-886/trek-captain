"use client";

import React, { useState } from "react";
import { Plus, MessageCircle, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { recordPayment } from "@/lib/store";
import { formatINR, formatDate, getWhatsAppLink } from "@/lib/utils";
import type { Trek, PaymentMode, Participant, Payment } from "@/lib/types";

export default function PaymentsTab({
  trek,
  participants: rawParticipants,
  payments,
  onUpdate,
}: {
  trek: Trek;
  participants: Participant[];
  payments: Payment[];
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [showRecord, setShowRecord] = useState(false);
  const [filterMode, setFilterMode] = useState<string>("all");

  const participants = rawParticipants.filter((p) => p.status !== "Cancelled");

  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const expected = participants.length * trek.pricePerPerson;
  const pending = Math.max(0, expected - collected);

  const filteredPayments = payments
    .filter((p) => filterMode === "all" || p.mode === filterMode)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

  const getParticipantName = (participantId: string) => {
    const p = participants.find((pp) => pp.id === participantId);
    return p?.name || "Unknown";
  };

  const getParticipantPhone = (participantId: string) => {
    const p = participants.find((pp) => pp.id === participantId);
    return p?.phone || "";
  };

  const getPendingParticipants = () => {
    return participants.filter((p) => {
      const pPayments = payments.filter((pay) => pay.participantId === p.id);
      const totalPaid = pPayments.reduce((s, pay) => s + pay.amount, 0);
      return totalPaid < trek.pricePerPerson;
    });
  };

  const getDueAmount = (participantId: string) => {
    const pPayments = payments.filter((p) => p.participantId === participantId);
    const totalPaid = pPayments.reduce((s, p) => s + p.amount, 0);
    return Math.max(0, trek.pricePerPerson - totalPaid);
  };

  const handleRecord = async (data: { participantId: string; amount: number; mode: PaymentMode; note: string }) => {
    const res = await recordPayment({
      participantId: data.participantId,
      trekId: trek.id,
      amount: data.amount,
      mode: data.mode,
      note: data.note,
    });
    if (res) {
      onUpdate();
      setShowRecord(false);
      toast("Payment recorded!");
    } else {
      toast("Failed to record payment", "error");
    }
  };

  const sendReminder = (participantId: string) => {
    const name = getParticipantName(participantId);
    const phone = getParticipantPhone(participantId);
    const due = getDueAmount(participantId);
    const message = `Hi ${name.split(" ")[0]}! 👋\n\nThis is a friendly reminder regarding your pending payment for *${trek.title}*.\n\nDue amount: *${formatINR(due)}*\n\nPlease complete the payment at your earliest convenience. Let me know if you have any questions!\n\n— ${trek.title} Team`;
    window.open(getWhatsAppLink(phone, message), "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-xs text-text-muted mb-1">Expected</p>
          <p className="text-xl font-bold font-[family-name:var(--font-sora-family)] text-text-primary">{formatINR(expected)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-muted mb-1">Collected</p>
          <p className="text-xl font-bold font-[family-name:var(--font-sora-family)] text-alpine-green">{formatINR(collected)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-muted mb-1">Pending</p>
          <p className="text-xl font-bold font-[family-name:var(--font-sora-family)] text-danger">{formatINR(pending)}</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-trail-orange focus:outline-none cursor-pointer"
          >
            <option value="all">All Modes</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowRecord(true)}>
          Record Payment
        </Button>
      </div>

      {/* Pending Participants */}
      {getPendingParticipants().length > 0 && (
        <Card>
          <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-3 text-sm">
            Pending Payments ({getPendingParticipants().length})
          </h3>
          <div className="space-y-2">
            {getPendingParticipants().map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.name}</p>
                  <p className="text-xs text-danger">Due: {formatINR(getDueAmount(p.id))}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => sendReminder(p.id)}
                >
                  Remind
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment History */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          title="No payments recorded"
          description="Record a payment to get started"
          actionLabel="Record Payment"
          onAction={() => setShowRecord(true)}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {filteredPayments.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {getParticipantName(p.participantId)}
                </p>
                <p className="text-xs text-text-muted">
                  {p.mode} • {formatDate(p.paidAt)}
                  {p.note && ` • ${p.note}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-alpine-green">
                  {formatINR(p.amount)}
                </span>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecord && (
        <RecordPaymentModal
          isOpen={showRecord}
          onClose={() => setShowRecord(false)}
          participants={participants}
          payments={payments}
          pricePerPerson={trek.pricePerPerson}
          onRecord={handleRecord}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({
  isOpen,
  onClose,
  participants,
  payments,
  pricePerPerson,
  onRecord,
}: {
  isOpen: boolean;
  onClose: () => void;
  participants: { id: string; name: string }[];
  payments: { participantId: string; amount: number }[];
  pricePerPerson: number;
  onRecord: (data: { participantId: string; amount: number; mode: PaymentMode; note: string }) => void;
}) {
  const [form, setForm] = useState({
    participantId: participants[0]?.id || "",
    amount: "",
    mode: "UPI" as PaymentMode,
    note: "",
  });

  const selectedPaid = payments
    .filter((p) => p.participantId === form.participantId)
    .reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, pricePerPerson - selectedPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.participantId || !form.amount || Number(form.amount) <= 0) return;
    onRecord({
      participantId: form.participantId,
      amount: Number(form.amount),
      mode: form.mode,
      note: form.note,
    });
    setForm({ participantId: participants[0]?.id || "", amount: "", mode: "UPI", note: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Participant"
          value={form.participantId}
          onChange={(e) => setForm({ ...form, participantId: e.target.value })}
          options={participants.map((p) => ({ value: p.id, label: p.name }))}
        />
        {form.participantId && (
          <div className="text-xs text-text-muted bg-border/30 rounded-lg p-3">
            Paid so far: {formatINR(selectedPaid)} • Remaining: {formatINR(remaining)}
          </div>
        )}
        <Input
          label="Amount (₹)"
          type="number"
          placeholder={remaining.toString()}
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <Select
          label="Payment Mode"
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value as PaymentMode })}
          options={[
            { value: "UPI", label: "UPI" },
            { value: "Cash", label: "Cash" },
            { value: "Bank", label: "Bank Transfer" },
          ]}
        />
        <Input
          label="Notes"
          placeholder="e.g. Transaction ID, half-payment"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">Record Payment</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
