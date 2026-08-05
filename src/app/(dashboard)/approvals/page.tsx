"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Send, Clock } from "lucide-react";

export default function ApprovalsPage() {
  const [tab, setTab] = useState<"pending" | "drafts" | "approved" | "rejected">("pending");
  const [note, setNote] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const tabs = [
    { key: "pending" as const, label: "Pending Review" },
    { key: "drafts" as const, label: "Drafts" },
    { key: "approved" as const, label: "Approved" },
    { key: "rejected" as const, label: "Rejected" },
  ];

  const posts = [
    { id: "p1", platform: "X", text: "Promo produk baru dengan diskon 20% untuk semua pelanggan setia.", status: "PENDING_REVIEW", scheduled: "2026-08-07T09:00:00Z" },
    { id: "p2", platform: "Threads", text: "Tips meningkatkan engagement di Threads dengan konten visual yang menarik.", status: "DRAFT", scheduled: null },
    { id: "p3", platform: "Instagram", text: "Review pelanggan bulan ini: produk kami mendapat rating 4.9 dari 5.", status: "APPROVED", scheduled: "2026-08-07T11:00:00Z" },
    { id: "p4", platform: "TikTok", text: "Tutorial singkat cara menggunakan fitur baru aplikasi dalam 30 detik.", status: "REJECTED", scheduled: null },
  ];

  const filtered = posts.filter((p) => {
    if (tab === "pending") return p.status === "PENDING_REVIEW";
    if (tab === "drafts") return p.status === "DRAFT";
    if (tab === "approved") return p.status === "APPROVED";
    if (tab === "rejected") return p.status === "REJECTED";
    return true;
  });

  const handleApprove = async (postId: string) => {
    await fetch("/api/posts/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "approve", note }),
    });
    setShowNoteModal(false);
    setNote("");
  };

  const handleReject = async (postId: string) => {
    if (!note.trim()) return;
    await fetch("/api/posts/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "reject", note }),
    });
    setShowNoteModal(false);
    setNote("");
  };

  const handleSubmit = async (postId: string) => {
    await fetch("/api/posts/submit-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Approvals</h1>
        <p className="mt-2 text-[rgb(var(--color-text-muted))]">Kelola persetujuan konten sebelum dipublikasikan.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-surface))]"
                : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((post) => (
          <Card key={post.id} className="rounded-xl shadow-sm border-[rgb(var(--color-border))] overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-semibold">{post.platform}</Badge>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    post.status === "PENDING_REVIEW"
                      ? "text-amber-600 border-amber-300"
                      : post.status === "APPROVED"
                      ? "text-green-600 border-green-300"
                      : post.status === "REJECTED"
                      ? "text-red-600 border-red-300"
                      : "text-[rgb(var(--color-text-muted))] border-[rgb(var(--color-border))]"
                  }`}
                >
                  {post.status}
                </Badge>
              </div>

              <p className="text-sm font-medium line-clamp-3">{post.text}</p>

              {post.scheduled && (
                <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-muted))]">
                  <Clock size={14} />
                  <span>{new Date(post.scheduled).toLocaleString()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {(post.status === "PENDING_REVIEW") && (
                  <>
                    <button
                      onClick={() => { setShowNoteModal(true); setSelectedPostId(post.id); setNote("Approved — aligns with brand guidelines."); }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => { setShowNoteModal(true); setSelectedPostId(post.id); setNote(""); }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <X size={14} /> Reject
                    </button>
                  </>
                )}
                {post.status === "DRAFT" && (
                  <button
                    onClick={() => handleSubmit(post.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[rgb(var(--color-primary))] text-[rgb(var(--color-surface))] px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Send size={14} /> Submit for Review
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--color-surface))] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Review Note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              placeholder="Add a brief note..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => selectedPostId && handleApprove(selectedPostId)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:opacity-90"
              >
                Approve
              </button>
              <button
                onClick={() => selectedPostId && handleReject(selectedPostId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:opacity-90"
              >
                Reject
              </button>
              <button
                onClick={() => { setShowNoteModal(false); setNote(""); }}
                className="px-4 py-2 rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] text-sm font-medium border border-[rgb(var(--color-border))]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
