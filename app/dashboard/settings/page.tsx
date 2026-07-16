"use client";

import React, { useState, useEffect } from "react";
import { Save, Globe, Copy, ExternalLink, Check, Upload, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useToast } from "@/components/ui/Toast";
import { getCaptain, updateCaptain, uploadImage, updateCaptainNotice } from "@/lib/store";
import type { Captain } from "@/lib/types";

const ACCENT_SWATCHES = [
  "#FF6B2C", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#2DD4A7", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [captain, setCaptain] = useState<Captain | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const [noticeSaving, setNoticeSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    brandName: "",
    tagline: "",
    bio: "",
    whatsapp: "",
    instagram: "",
    email: "",
    city: "",
    accentColor: "#FF6B2C",
    isPublic: true,
    slug: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const c = await getCaptain();
      if (c) {
        setCaptain(c);
        setForm({
          fullName: c.fullName || "",
          brandName: c.brandName || "",
          tagline: c.tagline || "",
          bio: c.bio || "",
          whatsapp: c.whatsapp || "",
          instagram: c.instagram || "",
          email: c.email || "",
          city: c.city || "",
          accentColor: c.accentColor || "#FF6B2C",
          isPublic: c.isPublic ?? true,
          slug: c.slug || "",
        });
        setAvatarPreview(c.avatarUrl);
        setCoverPreview(c.coverUrl);
        setNoticeText(c.notice || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = captain?.avatarUrl || null;
      let coverUrl = captain?.coverUrl || null;

      if (avatarFile) {
        const url = await uploadImage(avatarFile, "avatars");
        if (url) avatarUrl = url;
      }
      if (coverFile) {
        const url = await uploadImage(coverFile, "covers");
        if (url) coverUrl = url;
      }

      const updated = await updateCaptain({
        ...form,
        avatarUrl,
        coverUrl,
      });

      if (updated) {
        setCaptain(updated);
        toast("Profile updated successfully!");
      } else {
        toast("Failed to update profile", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error updating profile", "error");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-2 border-trail-orange/30 border-t-trail-orange rounded-full animate-spin" />
      </div>
    );
  }

  const publicUrl = captain
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${form.slug}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast("Public link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotice = async () => {
    setNoticeSaving(true);
    try {
      await updateCaptainNotice(noticeText);
      toast("Notice updated successfully!");
    } catch (e) {
      console.error(e);
      toast("Failed to save notice");
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleClearNotice = async () => {
    setNoticeSaving(true);
    try {
      await updateCaptainNotice("");
      setNoticeText("");
      toast("Notice cleared successfully!");
    } catch (e) {
      console.error(e);
      toast("Failed to clear notice");
    } finally {
      setNoticeSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <h1 className="text-2xl font-bold font-[family-name:var(--font-sora-family)]">
        Settings
      </h1>

      {/* Public Page Card */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-trail-orange/15 text-trail-orange">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold font-[family-name:var(--font-sora-family)] text-sm">
              Your Public Page
            </h3>
            <p className="text-xs text-text-muted">
              Trekkers can browse your published treks here
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center bg-charcoal border border-border rounded-lg px-3 py-2">
            <span className="text-xs text-text-muted truncate">{publicUrl}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopyLink}>
            {copied ? <Check className="w-3.5 h-3.5 text-alpine-green" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.open(publicUrl, "_blank")}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>

      {/* Notice Board Editor */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold font-[family-name:var(--font-sora-family)] text-sm">
              Notice Board Banner
            </h3>
            <p className="text-xs text-text-muted">
              Display a public alert banner at the top of your page
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              maxLength={200}
              placeholder="e.g. Kalsubai trek on Sunday is FULL!"
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              className="w-full bg-charcoal border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
              rows={3}
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Supports up to 200 characters</span>
              <span className={noticeText.length >= 180 ? "text-danger" : ""}>
                {noticeText.length}/200
              </span>
            </div>
          </div>

          {/* Notice Preview */}
          {noticeText.trim() && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                Live Preview
              </span>
              <div className="flex items-start gap-2.5">
                <Megaphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-100 whitespace-pre-wrap">
                    {noticeText}
                  </p>
                  <span className="text-[10px] text-amber-500/80 block mt-1">
                    Updated just now
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {captain?.notice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearNotice}
                disabled={noticeSaving}
              >
                Clear Notice
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSaveNotice}
              disabled={noticeSaving || !noticeText.trim()}
            >
              {noticeSaving ? "Saving..." : "Save Notice"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card>
        <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-5">
          Captain Profile Details
        </h3>
        <div className="space-y-5">
          {/* Avatar and Cover previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Avatar</label>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold overflow-hidden"
                  style={{ backgroundColor: form.accentColor }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    captain?.avatarInitials || "?"
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-charcoal border border-border rounded-lg text-xs text-text-muted hover:text-text-primary hover:border-border-hover cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Change
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Cover Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 rounded-lg bg-charcoal border border-border overflow-hidden flex items-center justify-center">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-text-dim">No Cover</span>
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-charcoal border border-border rounded-lg text-xs text-text-muted hover:text-text-primary hover:border-border-hover cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Change
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input
              label="Brand / Organization Name"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            />
          </div>

          <Input
            label="Slug (Page Address)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
          />

          <Input
            label="Tagline"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="e.g. Scaling peaks since 2021"
          />

          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            placeholder="Describe your background, experience and philosophy..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Phone"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="e.g. 9876543210"
            />
            <Input
              label="Instagram Username"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="e.g. sahil_treks"
            />
          </div>

          {/* Accent Swatches */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Accent Colour</label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, accentColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    form.accentColor === color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between py-2 border-t border-border/50">
            <div>
              <p className="text-sm font-medium text-text-primary">Public Visibility</p>
              <p className="text-xs text-text-muted">Allow search engines and non-members to view your page</p>
            </div>
            <button
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
              style={{ backgroundColor: form.isPublic ? "#2DD4A7" : "#21262D" }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                style={{ transform: form.isPublic ? "translateX(24px)" : "translateX(4px)" }}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-border flex justify-end">
            <Button
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
