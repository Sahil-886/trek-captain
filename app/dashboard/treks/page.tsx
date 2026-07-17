"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DifficultyBadge, StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useToast } from "@/components/ui/Toast";
import { getTreks, getParticipants, getPayments, createTrek, uploadImage } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/utils";
import type { Trek, Participant, Payment, Difficulty, TrekStatus } from "@/lib/types";

const COVER_COLORS = ["#FF6B2C", "#2DD4A7", "#818CF8", "#F59E0B", "#EC4899", "#06B6D4"];

export default function TreksPage() {
  const { toast } = useToast();
  const [treks, setTreks] = useState<Trek[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [t, p, pay] = await Promise.all([
        getTreks(),
        getParticipants(),
        getPayments(),
      ]);
      setTreks(t);
      setAllParticipants(p);
      setAllPayments(pay);
    } catch (err) {
      console.error("Failed to load treks:", err);
      toast("Failed to load treks", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = treks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Parameters<typeof createTrek>[0]) => {
    const result = await createTrek(data);
    if (result) {
      await loadData();
      setShowCreate(false);
      toast("Trek created successfully!");
    } else {
      toast("Failed to create trek", "error");
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Treks" }]} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-sora-family)]">Treks</h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
          New Trek
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input
          type="text"
          placeholder="Search treks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No treks found"
          description={search ? "Try a different search term" : "Create your first trek to get started"}
          actionLabel={!search ? "Create Trek" : undefined}
          onAction={!search ? () => setShowCreate(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trek) => {
            const participants = allParticipants.filter((p) => p.trekId === trek.id && p.status !== "Cancelled");
            const payments = allPayments.filter((p) => p.trekId === trek.id);
            const collected = payments.reduce((s, p) => s + p.amount, 0);
            const expected = participants.length * trek.pricePerPerson;

            return (
              <Link key={trek.id} href={`/dashboard/treks/${trek.id}`}>
                <div className="bg-card border border-border rounded-xl p-5 card-hover h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: trek.coverColor }}
                      />
                      <div>
                        <h3 className="font-semibold text-text-primary font-[family-name:var(--font-sora-family)] leading-tight">
                          {trek.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-text-dim" />
                          <span className="text-xs text-text-muted">{trek.location}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={trek.status} />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <DifficultyBadge difficulty={trek.difficulty} />
                    <span className="text-xs text-text-muted">
                      {formatDate(trek.startDate)} — {formatDate(trek.endDate)}
                    </span>
                  </div>

                  <ProgressBar current={participants.length} max={trek.maxCapacity} className="mb-3" />

                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>
                      {formatINR(collected)} / {formatINR(expected)}
                    </span>
                    <span>{formatINR(trek.pricePerPerson)}/person</span>
                  </div>

                  {trek.isPublished && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-alpine-green" />
                      <span className="text-[10px] text-alpine-green font-medium">Published</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Trek Slide-over */}
      <CreateTrekPanel isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
    </div>
  );
}

function CreateTrekPanel({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Parameters<typeof createTrek>[0]) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    region: "Sahyadris",
    startDate: "",
    endDate: "",
    difficulty: "Moderate" as Difficulty,
    pricePerPerson: "",
    maxCapacity: "",
    coverColor: COVER_COLORS[0],
    status: "Upcoming" as TrekStatus,
    meetingPoint: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.location.trim()) errs.location = "Required";
    if (!form.startDate) errs.startDate = "Required";
    if (!form.endDate) errs.endDate = "Required";
    if (!form.pricePerPerson || Number(form.pricePerPerson) <= 0) errs.pricePerPerson = "Enter a valid price";
    if (!form.maxCapacity || Number(form.maxCapacity) <= 0) errs.maxCapacity = "Enter a valid capacity";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    try {
      let coverUrl: string | null = null;
      if (imageFile) {
        coverUrl = await uploadImage(imageFile, "treks");
      }
      onCreate({
        title: form.title,
        location: form.location,
        region: form.region,
        startDate: form.startDate,
        endDate: form.endDate,
        difficulty: form.difficulty,
        pricePerPerson: Number(form.pricePerPerson),
        maxCapacity: Number(form.maxCapacity),
        coverColor: form.coverColor,
        status: form.status,
        meetingPoint: form.meetingPoint,
        description: form.description,
        coverUrl,
      });
      // Reset image state
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trek" variant="slide-over">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Trek Title"
          placeholder="e.g. Kalsubai Night Trek"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
        />
        <Input
          label="Location"
          placeholder="e.g. Kalsubai Peak, Ahmednagar"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          error={errors.location}
        />
        <Input
          label="Region"
          placeholder="e.g. Sahyadris"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            error={errors.startDate}
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            error={errors.endDate}
          />
        </div>
        <Select
          label="Difficulty"
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
          options={[
            { value: "Easy", label: "Easy" },
            { value: "Moderate", label: "Moderate" },
            { value: "Hard", label: "Hard" },
          ]}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price per Person (₹)"
            type="number"
            placeholder="1800"
            value={form.pricePerPerson}
            onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })}
            error={errors.pricePerPerson}
          />
          <Input
            label="Max Capacity"
            type="number"
            placeholder="25"
            value={form.maxCapacity}
            onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
            error={errors.maxCapacity}
          />
        </div>
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as TrekStatus })}
          options={[
            { value: "Upcoming", label: "Upcoming" },
            { value: "Ongoing", label: "Ongoing" },
            { value: "Completed", label: "Completed" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
        />
        <Input
          label="Meeting Point"
          placeholder="e.g. Kasara Railway Station, East Exit"
          value={form.meetingPoint}
          onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
        />
        <Textarea
          label="Description"
          placeholder="Describe the trek..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Trek Cover Image</label>
          <div className="flex flex-col gap-3">
            {imagePreview ? (
              <div className="relative h-40 rounded-xl overflow-hidden border border-border group bg-charcoal">
                <img src={imagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full text-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-border hover:border-border-hover transition-colors cursor-pointer bg-charcoal/30">
                <Upload className="w-6 h-6 text-text-dim mb-1" />
                <span className="text-xs text-text-muted font-semibold">Upload Cover Image</span>
                <span className="text-[10px] text-text-dim mt-0.5">JPEG, PNG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Cover Color</label>
          <div className="flex gap-2">
            {COVER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                  form.coverColor === color ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setForm({ ...form, coverColor: color })}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={uploading}>
            {uploading ? "Creating Trek..." : "Create Trek"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
