"use client";

import React, { useState } from "react";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Car,
  Footprints,
  UtensilsCrossed,
  Moon,
  Target,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  getItinerary,
  addItineraryItem,
  updateItineraryItem,
  removeItineraryItem,
  reorderItinerary,
} from "@/lib/store";
import { formatItineraryAsText } from "@/lib/utils";
import type { Trek, ItineraryItem, ItineraryType } from "@/lib/types";

const typeIcons: Record<ItineraryType, React.ReactNode> = {
  Travel: <Car className="w-4 h-4" />,
  Trek: <Footprints className="w-4 h-4" />,
  Meal: <UtensilsCrossed className="w-4 h-4" />,
  Rest: <Moon className="w-4 h-4" />,
  Activity: <Target className="w-4 h-4" />,
};

const typeColors: Record<ItineraryType, string> = {
  Travel: "bg-blue-500",
  Trek: "bg-trail-orange",
  Meal: "bg-amber-500",
  Rest: "bg-purple-500",
  Activity: "bg-alpine-green",
};

export default function ItineraryTab({
  trek,
  onUpdate,
}: {
  trek: Trek;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null);

  const items = getItinerary(trek.id);

  // Group by day
  const days = new Map<number, ItineraryItem[]>();
  items.forEach((item) => {
    const dayItems = days.get(item.dayNumber) || [];
    dayItems.push(item);
    days.set(item.dayNumber, dayItems);
  });
  const sortedDays = Array.from(days.entries()).sort(([a], [b]) => a - b);
  const maxDay = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1][0] : 0;

  const handleAdd = (data: Omit<ItineraryItem, "id">) => {
    addItineraryItem(data);
    onUpdate();
    setShowAdd(false);
    toast("Item added to itinerary!");
  };

  const handleEdit = (data: Partial<ItineraryItem>) => {
    if (editItem) {
      updateItineraryItem(editItem.id, data);
      onUpdate();
      setEditItem(null);
      toast("Itinerary item updated!");
    }
  };

  const handleRemove = (id: string) => {
    removeItineraryItem(id);
    onUpdate();
    toast("Item removed", "error");
  };

  const handleReorder = (itemId: string, direction: "up" | "down") => {
    reorderItinerary(trek.id, itemId, direction);
    onUpdate();
  };

  const handleCopyText = () => {
    const text = formatItineraryAsText(trek.title, items);
    navigator.clipboard.writeText(text);
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
                  {dayItems.map((item, idx) => (
                    <div key={item.id} className="relative flex items-start gap-4 group">
                      {/* Dot */}
                      <div className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full ${typeColors[item.type]} ring-4 ring-charcoal z-10`} />

                      <div className="flex-1 bg-card border border-border rounded-xl p-4 group-hover:border-border-hover transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-text-muted">{typeIcons[item.type]}</span>
                              <span className="text-xs text-text-muted font-medium">{item.time}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[item.type]}/15 text-text-muted`}>
                                {item.type}
                              </span>
                            </div>
                            <h4 className="font-medium text-text-primary text-sm">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-text-muted mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleReorder(item.id, "up")}
                              disabled={idx === 0}
                              className="p-2 rounded-lg bg-charcoal md:bg-transparent border border-border md:border-transparent text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReorder(item.id, "down")}
                              disabled={idx === dayItems.length - 1}
                              className="p-2 rounded-lg bg-charcoal md:bg-transparent border border-border md:border-transparent text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditItem(item)}
                              className="p-2 rounded-lg bg-charcoal md:bg-transparent border border-border md:border-transparent text-text-muted hover:text-trail-orange cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2 rounded-lg bg-charcoal md:bg-transparent border border-danger/30 md:border-transparent text-text-muted hover:text-danger cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <ItineraryItemModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Itinerary Item"
        trekId={trek.id}
        defaultDay={maxDay || 1}
        onSave={(data) => handleAdd({ ...data, trekId: trek.id })}
      />

      {/* Edit Modal */}
      {editItem && (
        <ItineraryItemModal
          isOpen={true}
          onClose={() => setEditItem(null)}
          title="Edit Itinerary Item"
          trekId={trek.id}
          defaultDay={editItem.dayNumber}
          initialData={editItem}
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
  trekId,
  defaultDay,
  initialData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  trekId: string;
  defaultDay: number;
  initialData?: ItineraryItem;
  onSave: (data: Omit<ItineraryItem, "id">) => void;
}) {
  const [form, setForm] = useState({
    dayNumber: (initialData?.dayNumber || defaultDay).toString(),
    time: initialData?.time || "08:00",
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || ("Trek" as ItineraryType),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      trekId,
      dayNumber: Number(form.dayNumber),
      time: form.time,
      title: form.title,
      description: form.description,
      type: form.type as ItineraryType,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Day Number"
            type="number"
            min="1"
            value={form.dayNumber}
            onChange={(e) => setForm({ ...form, dayNumber: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
        </div>
        <Select
          label="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as ItineraryType })}
          options={[
            { value: "Travel", label: "🚗 Travel" },
            { value: "Trek", label: "🥾 Trek" },
            { value: "Meal", label: "🍽 Meal" },
            { value: "Rest", label: "😴 Rest" },
            { value: "Activity", label: "🎯 Activity" },
          ]}
        />
        <Input
          label="Title"
          placeholder="e.g. Summit Push"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Textarea
          label="Description"
          placeholder="Details about this activity..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">{initialData ? "Save Changes" : "Add Item"}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
