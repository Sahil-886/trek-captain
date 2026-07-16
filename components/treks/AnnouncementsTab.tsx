"use client";

import React, { useState } from "react";
import { Send, MessageCircle, AlertTriangle, Globe, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { createAnnouncement, updateAnnouncement } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { Trek, AnnouncementPriority, Announcement } from "@/lib/types";

export default function AnnouncementsTab({
  trek,
  announcements,
  onUpdate,
}: {
  trek: Trek;
  announcements: Announcement[];
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("Normal");
  const [isPublic, setIsPublic] = useState(false);

  const handlePost = async () => {
    if (!message.trim()) return;
    const res = await createAnnouncement({
      trekId: trek.id,
      message: message.trim(),
      priority,
      isPublic,
    });
    if (res) {
      setMessage("");
      setPriority("Normal");
      setIsPublic(false);
      onUpdate();
      toast("Announcement posted!");
    } else {
      toast("Failed to post announcement", "error");
    }
  };

  const handleTogglePublic = async (id: string, currentPublic: boolean) => {
    await updateAnnouncement(id, { isPublic: !currentPublic });
    onUpdate();
    toast(currentPublic ? "Announcement made private" : "Announcement made public");
  };

  const shareOnWhatsApp = (text: string) => {
    const fullText = `📢 *${trek.title} — Announcement*\n\n${text}`;
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
            <label className="flex items-center gap-2 text-xs font-medium text-text-muted cursor-pointer hover:text-text-primary transition-colors select-none">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-border text-trail-orange focus:ring-trail-orange bg-charcoal"
              />
              <Globe className="w-3.5 h-3.5" />
              Show on public page
            </label>
          </div>
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
                  {ann.isPublic ? (
                    <span className="flex items-center gap-1 text-[10px] text-alpine-green bg-alpine-green/10 px-1.5 py-0.5 rounded font-medium">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-text-dim bg-border px-1.5 py-0.5 rounded font-medium">
                      <EyeOff className="w-3 h-3" /> Private
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {formatDate(ann.createdAt)}
                </span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {ann.message}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                <button
                  onClick={() => handleTogglePublic(ann.id, ann.isPublic)}
                  className="text-xs text-text-muted hover:text-text-primary font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {ann.isPublic ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Make Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" /> Make Public
                    </>
                  )}
                </button>
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
