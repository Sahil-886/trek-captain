"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Edit2,
  CloudRain,
  CloudSun,
  Wind,
  Thermometer,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DifficultyBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateTrek, getParticipants, getPayments } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/utils";
import type { Trek, Difficulty, TrekStatus } from "@/lib/types";

function getWeatherForecast(location: string, difficulty: string) {
  const loc = location.toLowerCase();
  if (
    loc.includes("kalsubai") ||
    loc.includes("harishchandragad") ||
    loc.includes("rajmachi") ||
    loc.includes("monsoon") ||
    loc.includes("peak")
  ) {
    return {
      temp: "21°C",
      condition: "Heavy Rain / Mist",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      wind: "18 km/h",
      humidity: "95%",
      tip: "Carry rain covers for bags, ponchos, and high-traction trekking shoes.",
    };
  }
  if (difficulty === "Hard") {
    return {
      temp: "14°C",
      condition: "Windy / Cold",
      icon: <Wind className="w-5 h-5 text-blue-300" />,
      wind: "24 km/h",
      humidity: "60%",
      tip: "Layers are essential. Heavy winds expected at ridge traversals.",
    };
  }
  return {
    temp: "26°C",
    condition: "Partly Cloudy",
    icon: <CloudSun className="w-5 h-5 text-amber-300" />,
    wind: "10 km/h",
    humidity: "75%",
    tip: "Good weather for trekking. Keep hydrated and carry a cap.",
  };
}

export default function TrekOverview({
  trek,
  onUpdate,
}: {
  trek: Trek;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);

  const participants = getParticipants(trek.id).filter((p) => p.status !== "Cancelled");
  const payments = getPayments(trek.id);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const expected = participants.length * trek.pricePerPerson;

  const handleEdit = (updates: Partial<Trek>) => {
    updateTrek(trek.id, updates);
    onUpdate();
    setShowEdit(false);
    toast("Trek updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          icon={<Edit2 className="w-4 h-4" />}
          onClick={() => setShowEdit(true)}
        >
          Edit Trek
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <Card>
          <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-4">Trek Details</h3>
          <div className="space-y-3">
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Location" value={trek.location} />
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Region" value={trek.region} />
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Dates" value={`${formatDate(trek.startDate)} — ${formatDate(trek.endDate)}`} />
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Meeting Point" value={trek.meetingPoint || "Not set"} />
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Difficulty:</span>
              <DifficultyBadge difficulty={trek.difficulty} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Status:</span>
              <StatusBadge status={trek.status} />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <StatRow icon={<Users className="w-4 h-4 text-trail-orange" />} label="Participants" value={`${participants.length} / ${trek.maxCapacity}`} />
            <StatRow icon={<IndianRupee className="w-4 h-4 text-alpine-green" />} label="Collected" value={formatINR(collected)} />
            <StatRow icon={<IndianRupee className="w-4 h-4 text-danger" />} label="Pending" value={formatINR(Math.max(0, expected - collected))} />
            <StatRow icon={<IndianRupee className="w-4 h-4 text-text-muted" />} label="Price/Person" value={formatINR(trek.pricePerPerson)} />
          </div>
        </Card>
      </div>

      {/* Weather Forecast Card */}
      {(() => {
        const weather = getWeatherForecast(trek.location, trek.difficulty);
        return (
          <Card className="border border-border/60 bg-gradient-to-r from-card to-charcoal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-border/40">
                  {weather.icon}
                </div>
                <div>
                  <h3 className="font-semibold font-[family-name:var(--font-sora-family)] text-sm">
                    Simulated Mountain Weather
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Current condition: <span className="text-text-primary font-medium">{weather.condition}</span> • Temperature: <span className="text-text-primary font-medium">{weather.temp}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-text-muted">
                <div>
                  <span className="text-text-dim block">Wind speed</span>
                  <span className="text-text-primary font-semibold">{weather.wind}</span>
                </div>
                <div>
                  <span className="text-text-dim block">Humidity</span>
                  <span className="text-text-primary font-semibold">{weather.humidity}</span>
                </div>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-border/50 text-xs text-text-muted flex gap-2 items-start">
              <span className="px-1.5 py-0.5 rounded bg-trail-orange/15 text-trail-orange font-bold flex-shrink-0">Safety Tip</span>
              <span>{weather.tip}</span>
            </div>
          </Card>
        );
      })()}

      {/* Description */}
      {trek.description && (
        <Card>
          <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-3">Description</h3>
          <p className="text-sm text-text-muted leading-relaxed">{trek.description}</p>
        </Card>
      )}

      {/* Edit Modal */}
      <EditTrekModal trek={trek} isOpen={showEdit} onClose={() => setShowEdit(false)} onSave={handleEdit} />
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-text-dim mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function EditTrekModal({
  trek,
  isOpen,
  onClose,
  onSave,
}: {
  trek: Trek;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Trek>) => void;
}) {
  const [form, setForm] = useState({
    title: trek.title,
    location: trek.location,
    region: trek.region,
    startDate: trek.startDate.split("T")[0],
    endDate: trek.endDate.split("T")[0],
    difficulty: trek.difficulty,
    pricePerPerson: trek.pricePerPerson.toString(),
    maxCapacity: trek.maxCapacity.toString(),
    status: trek.status,
    meetingPoint: trek.meetingPoint,
    description: trek.description,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: form.title,
      location: form.location,
      region: form.region,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      difficulty: form.difficulty as Difficulty,
      pricePerPerson: Number(form.pricePerPerson),
      maxCapacity: Number(form.maxCapacity),
      status: form.status as TrekStatus,
      meetingPoint: form.meetingPoint,
      description: form.description,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Trek" variant="slide-over">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Input label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })} options={[{ value: "Easy", label: "Easy" }, { value: "Moderate", label: "Moderate" }, { value: "Hard", label: "Hard" }]} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (₹)" type="number" value={form.pricePerPerson} onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })} />
          <Input label="Capacity" type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} />
        </div>
        <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TrekStatus })} options={[{ value: "Upcoming", label: "Upcoming" }, { value: "Ongoing", label: "Ongoing" }, { value: "Completed", label: "Completed" }, { value: "Cancelled", label: "Cancelled" }]} />
        <Input label="Meeting Point" value={form.meetingPoint} onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })} />
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">Save Changes</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
