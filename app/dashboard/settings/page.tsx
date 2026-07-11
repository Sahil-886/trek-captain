"use client";

import React, { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useToast } from "@/components/ui/Toast";
import { getCaptain, updateCaptain, resetStore } from "@/lib/store";

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orgName: "",
  });

  useEffect(() => {
    const captain = getCaptain();
    setForm({
      name: captain.name,
      email: captain.email,
      phone: captain.phone,
      orgName: captain.orgName,
    });
  }, []);

  const handleSave = () => {
    updateCaptain({
      name: form.name,
      email: form.email,
      phone: form.phone,
      orgName: form.orgName,
      avatarInitials: form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    });
    toast("Profile updated!");
  };

  const handleReset = () => {
    if (
      confirm(
        "Reset all data to demo defaults? This will erase any changes you've made."
      )
    ) {
      resetStore();
      const captain = getCaptain();
      setForm({
        name: captain.name,
        email: captain.email,
        phone: captain.phone,
        orgName: captain.orgName,
      });
      toast("Demo data restored!", "info");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <h1 className="text-2xl font-bold font-[family-name:var(--font-sora-family)]">
        Settings
      </h1>

      {/* Profile */}
      <Card>
        <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-5">
          Captain Profile
        </h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Organization Name"
            value={form.orgName}
            onChange={(e) => setForm({ ...form, orgName: e.target.value })}
          />
          <Button
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Profile
          </Button>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-2">
          Theme
        </h3>
        <p className="text-sm text-text-muted">
          Trek Captain uses a dark adventure theme optimized for mountain
          vibes. Custom theme support coming soon.
        </p>
      </Card>

      {/* Data */}
      <Card>
        <h3 className="font-semibold font-[family-name:var(--font-sora-family)] mb-2">
          Data Management
        </h3>
        <p className="text-sm text-text-muted mb-4">
          All data is stored locally in your browser. Reset to restore the
          demo dataset with sample treks, participants, and payments.
        </p>
        <Button
          variant="danger"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={handleReset}
        >
          Reset Demo Data
        </Button>
      </Card>
    </div>
  );
}
