"use client";

import React, { useState } from "react";
import { Send, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { getAnnouncements, createAnnouncement } from "@/lib/store";
import { formatDate, getWhatsAppLink } from "@/lib/utils";
import type { Trek, AnnouncementPriority } from "@/lib/types";

export default function AnnouncementsTab({
  trek,
  onUpdate,
}: {
  trek: Trek;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");

  const announcements = getAnnouncements(trek.id);

  const handlePost = () => {
    if (!message.trim()) return;
    createAnnouncement({
      trekId: trek.id,
      message: message.trim(),
      priority,
    });
    setMessage("");
    setPriority("Normal");
    onUpdate();
    toast("Announcement posted!");
  };

  const shareOnWhatsApp = (text: string) => {
    const fullText = `📢 *${trek.title} — Announcement*\n\n${text}`;
    // Open with empty phone number for sharing to any contact/group
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Compose */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold font-[family-name:var(--font-sora-family)] text-sm">
          New Announcement
        </h3>
        <Textarea
          placeholder="Write your announcement here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setPriority(priority === "Normal" ? "Urgent" : "Normal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              priority === "Urgent"
                ? "bg-danger/15 text-danger"
                : "bg-border/50 text-text-muted hover:text-text-primary"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {priority === "Urgent" ? "Urgent" : "Mark as Urgent"}
          </button>
          <Button
            size="sm"
            icon={<Send className="w-4 h-4" />}
            onClick={handlePost}
            disabled={!message.trim()}
          >
            Post
          </Button>
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements"
          description="Post your first announcement for this trek"
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-card border rounded-xl p-5 ${
                ann.priority === "Urgent"
                  ? "border-danger/30 bg-danger/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {ann.priority === "Urgent" && (
                    <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
                  )}
                  <StatusBadge status={ann.priority} />
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {formatDate(ann.createdAt)}
                </span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {ann.message}
              </p>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => shareOnWhatsApp(ann.message)}
                >
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
