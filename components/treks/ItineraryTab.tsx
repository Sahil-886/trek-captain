"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Edit2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { updateTrek } from "@/lib/store";
import type { Trek, ItineraryItem } from "@/lib/types";

export default function ItineraryTab({
  trek,
  onUpdate,
}: {
  trek: Trek;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const items = trek.itinerary || [];

  // Group by day
  const days = new Map<number, ItineraryItem[]>();
  items.forEach((item) => {
    const dayItems = days.get(item.day) || [];
    dayItems.push(item);
    days.set(item.day, dayItems);
  });
  const sortedDays = Array.from(days.entries()).sort(([a], [b]) => a - b);
  const maxDay = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1][0] : 0;

  const handleAdd = async (data: ItineraryItem) => {
    const newItinerary = [...items, data].sort((a, b) => a.day - b.day);
    const result = await updateTrek(trek.id, { itinerary: newItinerary });
    if (result) {
      onUpdate();
      setShowAdd(false);
      toast("Itinerary item added!");
    } else {
      toast("Failed to update itinerary", "error");
    }
  };

  const handleEdit = async (data: ItineraryItem) => {
    if (editIndex !== null) {
      const newItinerary = [...items];
      newItinerary[editIndex] = data;
      newItinerary.sort((a, b) => a.day - b.day);
      const result = await updateTrek(trek.id, { itinerary: newItinerary });
      if (result) {
        onUpdate();
        setEditIndex(null);
        toast("Itinerary item updated!");
      } else {
        toast("Failed to update itinerary", "error");
      }
    }
  };

  const handleRemove = async (index: number) => {
    if (confirm("Remove this itinerary item?")) {
      const newItinerary = items.filter((_, idx) => idx !== index);
      const result = await updateTrek(trek.id, { itinerary: newItinerary });
      if (result) {
        onUpdate();
        toast("Itinerary item removed", "error");
      } else {
        toast("Failed to update itinerary", "error");
      }
    }
  };

  const handleCopyText = () => {
    let text = `🏔 *${trek.title} — Itinerary*\n\n`;
    sortedDays.forEach(([dayNum, dayItems]) => {
      text += `📅 *Day ${dayNum}*\n`;
      dayItems.forEach((item) => {
        text += `• ${item.title}\n`;
        if (item.description) {
          text += `  ${item.description}\n`;
        }
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text.trim());
    toast("Itinerary copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        {items.length > 0 && (
          <Button variant="outline" size="sm" icon={<Copy className="w-4 h-4" />} onClick={handleCopyText}>
            Copy as Text
          </Button>
        )}
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
          Add Item
        </Button>
      </div>

      {/* Timeline */}
      {sortedDays.length === 0 ? (
        <EmptyState
          title="No itinerary yet"
          description="Build a day-wise itinerary for your trek"
          actionLabel="Add First Item"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="space-y-8">
          {sortedDays.map(([dayNum, dayItems]) => (
            <div key={dayNum}>
              <h3 className="text-lg font-semibold font-[family-name:var(--font-sora-family)] mb-4 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-trail-orange/15 text-trail-orange rounded-lg text-sm">
                  Day {dayNum}
                </span>
              </h3>
              <div className="relative pl-8">
                {/* Connecting line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

                <div className="space-y-4">
                  {dayItems.map((item) => {
                    const originalIndex = items.findIndex((it) => it === item);
                    return (
                      <div key={originalIndex} className="relative flex items-start gap-4 group">
                        {/* Dot */}
                        <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-trail-orange ring-4 ring-charcoal z-10" />

                        <div className="flex-1 bg-card border border-border rounded-xl p-4 group-hover:border-border-hover transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-primary text-sm">{item.title}</h4>
                              {item.description && (
                                <p className="text-xs text-text-muted mt-1 whitespace-pre-wrap">{item.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditIndex(originalIndex)}
                                className="p-2 rounded-lg bg-charcoal md:bg-transparent border border-border md:border-transparent text-text-muted hover:text-trail-orange cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemove(originalIndex)}
                                className="p-2 rounded-lg bg-charcoal md:bg-transparent border border-danger/30 md:border-transparent text-text-muted hover:text-danger cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <ItineraryItemModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          title="Add Itinerary Item"
          defaultDay={maxDay || 1}
          onSave={handleAdd}
        />
      )}

      {/* Edit Modal */}
      {editIndex !== null && (
        <ItineraryItemModal
          isOpen={true}
          onClose={() => setEditIndex(null)}
          title="Edit Itinerary Item"
          defaultDay={items[editIndex].day}
          initialData={items[editIndex]}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

function ItineraryItemModal({
  isOpen,
  onClose,
  title,
  defaultDay,
  initialData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultDay: number;
  initialData?: ItineraryItem;
  onSave: (data: ItineraryItem) => void;
}) {
  const [form, setForm] = useState({
    day: (initialData?.day || defaultDay).toString(),
    title: initialData?.title || "",
    description: initialData?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.day) return;
    onSave({
      day: Number(form.day),
      title: form.title.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Day Number"
          type="number"
          min="1"
          placeholder="e.g. 1"
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
          required
        />
        <Input
          label="Title"
          placeholder="e.g. Meet at Kasara Station"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Textarea
          label="Description"
          placeholder="What will happen during this part of the trek?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">Save Item</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
