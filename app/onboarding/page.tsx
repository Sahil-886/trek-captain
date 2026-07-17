"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Mountain,
  User,
  Palette,
  Globe,
  Check,
  Loader2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createCaptainProfile, checkSlugAvailability, slugify, uploadImage } from "@/lib/store";

const ACCENT_SWATCHES = [
  "#FF6B2C", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#2DD4A7", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
];

const steps = [
  { id: 1, label: "Brand", icon: User },
  { id: 2, label: "Identity", icon: Palette },
  { id: 3, label: "Public Link", icon: Globe },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Step 1: Brand
  const [brandName, setBrandName] = useState("");
  const [fullName, setFullName] = useState("");
  const [tagline, setTagline] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Step 2: Identity
  const [accentColor, setAccentColor] = useState("#FF6B2C");
  const [customColor, setCustomColor] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Step 3: Slug
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState("");

  // Auto-suggest slug from brand name
  useEffect(() => {
    if (step === 3 && brandName && !slug) {
      setSlug(slugify(brandName));
    }
  }, [step, brandName, slug]);

  // Live slug availability check
  const checkSlug = useCallback(async (s: string) => {
    if (!s || s.length < 3) {
      setSlugAvailable(null);
      setSlugError(s ? "Slug must be at least 3 characters" : "");
      return;
    }

    setChecking(true);
    setSlugError("");
    try {
      const available = await checkSlugAvailability(s);
      setSlugAvailable(available);
      if (!available) setSlugError("This slug is already taken");
    } catch {
      setSlugAvailable(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 3 && slug) checkSlug(slug);
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, step, checkSlug]);

  // Check if captain already exists — redirect to dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }: any) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("captains")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        router.push("/dashboard");
      }
    });
  }, [router]);

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let avatarUrl: string | null = null;
      let coverUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, "avatars");
      }
      if (coverFile) {
        coverUrl = await uploadImage(coverFile, "covers");
      }

      await createCaptainProfile({
        slug,
        brandName,
        fullName,
        tagline: tagline || undefined,
        avatarUrl,
        coverUrl,
        accentColor,
        city: city || undefined,
        whatsapp: whatsapp || undefined,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Onboarding error:", err.message || err);
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return brandName.trim() && fullName.trim() && whatsapp.trim();
    if (step === 2) return true;
    if (step === 3) return slug.length >= 3 && slugAvailable === true;
    return false;
  };

  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-charcoal topo-bg flex flex-col relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: accentColor + "15" }} />

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⛰</span>
          <span className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
            Trek <span className="text-trail-orange">Captain</span>
          </span>
        </div>
        <span className="text-xs text-text-muted">Step {step} of 3</span>
      </header>

      {/* Progress Bar */}
      <div className="px-6">
        <div className="flex gap-2 max-w-lg mx-auto">
          {steps.map((s) => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: step >= s.id ? "100%" : "0%",
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-lg mx-auto mt-2">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${step >= s.id ? "text-text-primary" : "text-text-dim"}`} />
                <span className={`text-xs font-medium ${step >= s.id ? "text-text-primary" : "text-text-dim"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step 1: Brand */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)]">
                  Set up your brand
                </h1>
                <p className="text-text-muted text-sm mt-2">
                  This is how trekkers will know you
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Sahil Treks"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sahil Devendramakhamale"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">WhatsApp Phone Number *</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 9876543210 (without +, spaces, or leading 0)"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
                  />
                  <p className="text-[10px] text-text-dim mt-1">
                    Required. This number is used for WhatsApp booking referrals and coordinator check-ins.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Adventure starts where the road ends"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Identity */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)]">
                  Customize your look
                </h1>
                <p className="text-text-muted text-sm mt-2">
                  Avatar, cover photo, and brand colour
                </p>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Avatar</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold overflow-hidden"
                    style={{ backgroundColor: accentColor }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials || "?"
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-text-muted hover:text-text-primary hover:border-border-hover cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Cover Upload */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Cover Photo</label>
                <label className="block cursor-pointer">
                  <div className="h-32 rounded-xl border-2 border-dashed border-border hover:border-border-hover transition-colors flex items-center justify-center overflow-hidden">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-text-dim mx-auto mb-1" />
                        <span className="text-xs text-text-dim">Click to upload cover</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Accent Colour</label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => { setAccentColor(color); setCustomColor(""); }}
                      className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                        accentColor === color ? "border-white scale-110 shadow-lg" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-text-dim">Custom:</span>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        setAccentColor(e.target.value);
                      }
                    }}
                    placeholder="#FF6B2C"
                    className="w-24 px-2 py-1 bg-card border border-border rounded text-xs text-text-primary font-mono focus:border-trail-orange focus:outline-none"
                  />
                  <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: accentColor }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Public Link */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-sora-family)]">
                  Choose your public link
                </h1>
                <p className="text-text-muted text-sm mt-2">
                  Trekkers will find your page here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Your Slug</label>
                <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden focus-within:border-trail-orange transition-colors">
                  <span className="px-4 py-3 text-sm text-text-dim bg-charcoal border-r border-border whitespace-nowrap">
                    trekcaptain.app/c/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      const s = slugify(e.target.value);
                      setSlug(s);
                      setSlugAvailable(null);
                    }}
                    placeholder="sahil-treks"
                    className="flex-1 px-4 py-3 bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none"
                  />
                  <div className="px-3">
                    {checking && <Loader2 className="w-4 h-4 text-text-dim animate-spin" />}
                    {!checking && slugAvailable === true && <Check className="w-4 h-4 text-alpine-green" />}
                    {!checking && slugAvailable === false && <span className="text-danger text-xs">✕</span>}
                  </div>
                </div>
                {slugError && <p className="text-xs text-danger mt-1.5">{slugError}</p>}
                {slugAvailable === true && (
                  <p className="text-xs text-alpine-green mt-1.5">This slug is available!</p>
                )}
              </div>

              {/* Preview Card */}
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-text-dim uppercase tracking-wider mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden"
                    style={{ backgroundColor: accentColor }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials || "?"
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary font-[family-name:var(--font-sora-family)]">
                      {brandName || "Your Brand"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {tagline || "Your tagline"} {city ? `• ${city}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl text-sm text-text-muted hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              type="button"
              disabled={!canProceed() || loading}
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
                boxShadow: `0 10px 25px ${accentColor}30`,
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === 3 ? (
                <>
                  Launch Your Page
                  <Mountain className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
