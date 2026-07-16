"use client";

import React, { useState, useEffect } from "react";
import { Wallet, MessageCircle, DollarSign, Calendar, TrendingUp, CheckCircle, Info } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { getPendingDuesList, recordPayment, getTreks, getGlobalParticipants, getGlobalExpenses } from "@/lib/store";
import { formatINR, getWhatsAppLink, getTelLink, computePaymentStatus } from "@/lib/utils";
import type { PaymentMode } from "@/lib/types";

export default function MoneyPage() {
  const [loading, setLoading] = useState(true);
  const [dues, setDues] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);
  const [grandTotals, setGrandTotals] = useState({ expected: 0, collected: 0, expenses: 0, profit: 0 });

  // Quick Pay Modal State
  const [quickPayParticipant, setQuickPayParticipant] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("UPI");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [duesData, treks, globalParticipants, allExpenses] = await Promise.all([
      getPendingDuesList(),
      getTreks(),
      getGlobalParticipants(),
      getGlobalExpenses(),
    ]);

    setDues(duesData);

    // Calculate finances per trek
    let totalExpected = 0;
    let totalCollected = 0;
    let totalExpenses = 0;

    const trekFinances = treks.map((trek) => {
      // Find participants for this trek (excluding cancelled)
      const trekParticipants = globalParticipants.filter(
        (p) => p.trekId === trek.id && p.status !== "Cancelled"
      );

      const price = trek.pricePerPerson;
      const expected = price * trekParticipants.length;

      // Calculate collected
      const collected = trekParticipants.reduce((sum, p) => sum + p.totalPaid, 0);

      // Calculate expenses
      const trekExpenses = allExpenses
        .filter((e) => e.trekId === trek.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const profit = collected - trekExpenses;

      totalExpected += expected;
      totalCollected += collected;
      totalExpenses += trekExpenses;

      return {
        id: trek.id,
        title: trek.title,
        startDate: trek.startDate,
        expected,
        collected,
        expenses: trekExpenses,
        profit,
      };
    });

    setFinances(trekFinances);
    setGrandTotals({
      expected: totalExpected,
      collected: totalCollected,
      expenses: totalExpenses,
      profit: totalCollected - totalExpenses,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayParticipant || !amount) return;

    setSaving(true);
    try {
      await recordPayment({
        participantId: quickPayParticipant.participantId,
        trekId: quickPayParticipant.trekId,
        amount: parseInt(amount, 10),
        mode,
        note: note,
      });
      setQuickPayParticipant(null);
      setAmount("");
      setNote("");
      await loadData();
    } catch (err) {
      console.error("Failed to record payment:", err);
    } finally {
      setSaving(false);
    }
  };

  const totalDuesAmount = dues.reduce((sum, d) => sum + d.amountPending, 0);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finances & Dues" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-sora-family)]">
          Finances & Money
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-trail-orange/30 border-t-trail-orange rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Financial Tables */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 font-[family-name:var(--font-sora-family)]">
                <TrendingUp className="w-5 h-5 text-trail-orange" />
                Trek Finances Overview
              </h2>

              {finances.length === 0 ? (
                <EmptyState title="No treks found" description="Create a trek to track financials." />
              ) : (
                <div className="space-y-6">
                  {/* Table (Desktop) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-border/80 text-text-muted text-xs font-semibold">
                          <th className="pb-3 pr-2">Trek Name</th>
                          <th className="pb-3 text-right">Expected</th>
                          <th className="pb-3 text-right">Collected</th>
                          <th className="pb-3 text-right">Expenses</th>
                          <th className="pb-3 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {finances.map((fin) => {
                          const profitPercent = fin.expected > 0 ? (fin.profit / fin.expected) * 100 : 0;
                          return (
                            <tr key={fin.id} className="text-text-secondary hover:text-text-primary">
                              <td className="py-3.5 pr-2 font-medium">
                                <div>{fin.title}</div>
                                <div className="text-[10px] text-text-dim mt-0.5">
                                  {new Date(fin.startDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </div>
                              </td>
                              <td className="py-3.5 text-right font-medium">{formatINR(fin.expected)}</td>
                              <td className="py-3.5 text-right text-alpine-green font-medium">
                                {formatINR(fin.collected)}
                              </td>
                              <td className="py-3.5 text-right text-text-muted">{formatINR(fin.expenses)}</td>
                              <td className="py-3.5 text-right font-bold text-text-primary">
                                <div className="flex flex-col items-end">
                                  <span className={fin.profit >= 0 ? "text-alpine-green" : "text-danger"}>
                                    {formatINR(fin.profit)}
                                  </span>
                                  {/* Pure CSS Profit Bar */}
                                  <div className="w-20 bg-border/60 h-1 rounded-full overflow-hidden mt-1.5">
                                    <div
                                      className={`h-full rounded-full ${
                                        fin.profit >= 0 ? "bg-alpine-green" : "bg-danger"
                                      }`}
                                      style={{ width: `${Math.max(0, Math.min(100, profitPercent))}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Grand Totals */}
                        <tr className="border-t border-border font-bold text-text-primary bg-border/10">
                          <td className="py-4 pl-2 text-xs uppercase tracking-wider">Grand Total</td>
                          <td className="py-4 text-right">{formatINR(grandTotals.expected)}</td>
                          <td className="py-4 text-right text-alpine-green">{formatINR(grandTotals.collected)}</td>
                          <td className="py-4 text-right text-text-muted">{formatINR(grandTotals.expenses)}</td>
                          <td className="py-4 text-right text-alpine-green pr-2">
                            <span className={grandTotals.profit >= 0 ? "text-alpine-green" : "text-danger"}>
                              {formatINR(grandTotals.profit)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cards List (Mobile) */}
                  <div className="sm:hidden space-y-4">
                    {finances.map((fin) => {
                      const profitPercent = fin.expected > 0 ? (fin.profit / fin.expected) * 100 : 0;
                      return (
                        <div key={fin.id} className="bg-charcoal border border-border/80 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-text-primary">{fin.title}</h4>
                            <span className={`text-sm font-bold ${fin.profit >= 0 ? "text-alpine-green" : "text-danger"}`}>
                              {formatINR(fin.profit)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs border-t border-border/40 pt-2.5">
                            <div>
                              <span className="block text-text-dim">Expected</span>
                              <span className="font-medium text-text-primary">{formatINR(fin.expected)}</span>
                            </div>
                            <div>
                              <span className="block text-text-dim">Collected</span>
                              <span className="font-medium text-alpine-green">{formatINR(fin.collected)}</span>
                            </div>
                            <div>
                              <span className="block text-text-dim">Expenses</span>
                              <span className="font-medium text-text-muted">{formatINR(fin.expenses)}</span>
                            </div>
                          </div>

                          <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                fin.profit >= 0 ? "bg-alpine-green" : "bg-danger"
                              }`}
                              style={{ width: `${Math.max(0, Math.min(100, profitPercent))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Mobile Grand Totals Card */}
                    <div className="bg-trail-orange/5 border border-trail-orange/20 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs uppercase tracking-wider text-trail-orange font-bold">Grand Totals</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="block text-xs text-text-muted">Expected</span>
                          <span className="font-semibold text-text-primary">{formatINR(grandTotals.expected)}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-text-muted">Collected</span>
                          <span className="font-semibold text-alpine-green">{formatINR(grandTotals.collected)}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-text-muted">Expenses</span>
                          <span className="font-semibold text-text-muted">{formatINR(grandTotals.expenses)}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-text-muted">Net Profit</span>
                          <span className={`font-bold ${grandTotals.profit >= 0 ? "text-alpine-green" : "text-danger"}`}>
                            {formatINR(grandTotals.profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dues Chaser List Side Panel */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-2 font-[family-name:var(--font-sora-family)]">
                  <Wallet className="w-5 h-5 text-danger" />
                  Dues Chase List
                </h2>
                <span className="text-xs text-text-muted mt-1">
                  {dues.length} trekkers owe you <strong className="text-danger font-semibold">{formatINR(totalDuesAmount)}</strong>
                </span>
              </div>

              {dues.length === 0 ? (
                <EmptyState
                  title="All dues cleared!"
                  description="No outstanding balance from any participant."
                  icon={<CheckCircle className="w-10 h-10 text-alpine-green" />}
                />
              ) : (
                <div className="space-y-3">
                  {dues.map((due) => {
                    const daysLabel =
                      due.daysUntilStart < 0
                        ? `Started ${Math.abs(due.daysUntilStart)}d ago`
                        : due.daysUntilStart === 0
                        ? "Starts today"
                        : `Starts in ${due.daysUntilStart}d`;

                    // Polite warning for treks starting in under 7 days
                    const isUrgent = due.daysUntilStart >= 0 && due.daysUntilStart < 7;

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
                            <h4 className="font-semibold text-text-primary text-sm">{due.participantName}</h4>
                            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[150px]">{due.trekTitle}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-bold text-danger">
                              {formatINR(due.amountPending)}
                            </span>
                            <span
                              className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                                isUrgent
                                  ? "bg-danger/10 text-danger border border-danger/20 animate-pulse"
                                  : "bg-border/60 text-text-muted"
                              }`}
                            >
                              {daysLabel}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                          <button
                            onClick={() => setQuickPayParticipant(due)}
                            className="bg-trail-orange/10 hover:bg-trail-orange/20 border border-trail-orange/20 hover:border-trail-orange/30 text-trail-orange text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer text-center"
                          >
                            Mark as paid
                          </button>
                          <a
                            href={getWhatsAppLink(due.participantPhone, waMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-alpine-green/10 hover:bg-alpine-green/20 border border-alpine-green/20 hover:border-alpine-green/30 text-alpine-green text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-alpine-green/10" />
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
      )}

      {/* Record Quick Payment Modal */}
      {quickPayParticipant && (
        <Modal
          isOpen={!!quickPayParticipant}
          onClose={() => setQuickPayParticipant(null)}
          title="Record Payment"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <span className="block text-xs text-text-dim">Participant</span>
              <span className="text-sm font-bold text-text-primary">
                {quickPayParticipant.participantName} ({quickPayParticipant.trekTitle})
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
                max={quickPayParticipant.amountPending}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Pending: ${formatINR(quickPayParticipant.amountPending)}`}
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-trail-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted font-medium mb-1.5">
                Payment Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as PaymentMode)}
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. UPI Ref 38291..."
                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-trail-orange focus:outline-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-border/80">
              <button
                type="button"
                onClick={() => setQuickPayParticipant(null)}
                className="px-4 py-2 border border-border hover:bg-border/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-trail-orange text-white hover:bg-trail-orange-hover text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
