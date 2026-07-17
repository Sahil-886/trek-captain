"use client";

import React, { useState } from "react";
import { MessageSquare, Check, X, ShieldAlert, Heart, Calendar, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface JoinTrekFormProps {
  trekId: string;
  captainId: string;
  brandName: string;
  trekTitle: string;
  accentColor: string;
  spotsLeft: number;
}

export default function JoinTrekForm({
  trekId,
  captainId,
  brandName,
  trekTitle,
  accentColor,
  spotsLeft,
}: JoinTrekFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "Male",
    bloodGroup: "O+",
    emergencyContact: "",
    emergencyContactPhone: "",
    medicalNotes: "",
  });

  const handleOpen = () => {
    setIsOpen(true);
    setSuccess(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      age: "",
      gender: "Male",
      bloodGroup: "O+",
      emergencyContact: "",
      emergencyContactPhone: "",
      medicalNotes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const statusVal = spotsLeft > 0 ? "Confirmed" : "Waitlist";
      setIsWaitlist(statusVal === "Waitlist");

      const { error } = await supabase
        .from("participants")
        .insert({
          trek_id: trekId,
          captain_id: captainId,
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          age: form.age ? parseInt(form.age, 10) : null,
          gender: form.gender || null,
          blood_group: form.bloodGroup || null,
          emergency_contact: form.emergencyContact || null,
          emergency_contact_phone: form.emergencyContactPhone || null,
          status: statusVal,
          medical_notes: form.medicalNotes || null,
          checked_in: false,
        });

      if (error) {
        console.error("Supabase insert error:", error);
        alert(`Failed to register: ${error.message}`);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-3.5 bg-card border hover:border-accent/40 text-text-primary hover:text-accent text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[48px]"
        style={{ borderColor: `${accentColor}25` }}
      >
        <Calendar className="w-4 h-4" style={{ color: accentColor }} />
        Register Online
      </button>

      {/* Slide Drawer/Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-text-primary font-[family-name:var(--font-sora-family)]">
                  Register for Trek
                </h3>
                <p className="text-xs text-text-muted mt-0.5">{trekTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg bg-charcoal/50 hover:bg-charcoal transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              /* Success Screen */
              <div className="p-6 text-center space-y-4 overflow-y-auto">
                <div className="w-12 h-12 bg-alpine-green/10 text-alpine-green rounded-full flex items-center justify-center mx-auto border border-alpine-green/20">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-text-primary text-lg">
                    {isWaitlist ? "Waitlist Confirmed!" : "Registration Successful!"}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                    {isWaitlist
                      ? "You have been added to the waitlist for this trek. The captain will reach out if a slot opens up."
                      : `Your spot has been reserved! ${brandName} team will reach out to you shortly to coordinate payments and briefing.`}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 bg-accent text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="priya@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1.5">
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="24"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1.5">
                        Gender
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none h-[38px] cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Blood Group
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none h-[38px] cursor-pointer"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Emergency Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh (Father)"
                      value={form.emergencyContact}
                      onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                      className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    Medical / Dietary Notes
                  </label>
                  <textarea
                    placeholder="e.g. Asthma, gluten-free diet, etc."
                    value={form.medicalNotes}
                    onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
                    className="w-full bg-charcoal border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-border/40">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    {loading ? "Registering..." : spotsLeft > 0 ? "Confirm Registration" : "Join Waitlist"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="py-3 px-6 bg-charcoal border border-border text-text-muted hover:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
