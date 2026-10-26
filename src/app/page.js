"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { 
  FaYoutube, 
  FaInstagram, 
  FaLinkedin, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaShareAlt,
  FaRocket,
  FaGoogle,
  FaBolt
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { FiPlus, FiTrash2, FiEdit2, FiExternalLink, FiRefreshCw, FiX } from "react-icons/fi";
import Link from "next/link";
import ContentCalendar from "@/components/calendar/ContentCalendar";
import PostComposerModal from "@/components/composer/PostComposerModal";

export default function WorkspaceDashboard() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  // Composer Modal State
  const [composerOpen, setComposerOpen] = useState(false);
  const [openWithAi, setOpenWithAi] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Post Detail Modal State
  const [viewingPost, setViewingPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch real connected accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/social/accounts");
      if (res.ok) {
        const data = await res.json();
        setConnectedAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Error fetching accounts:", err);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
      fetchAccounts();
    }
  }, [status, fetchPosts, fetchAccounts]);

  // Global listener for Header actions
  useEffect(() => {
    const handleOpenComposer = (e) => {
      setSelectedDate(null);
      setEditingPost(null);
      setOpenWithAi(!!e.detail?.withAi);
      setComposerOpen(true);
    };
    window.addEventListener("open-composer", handleOpenComposer);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("compose") === "true") {
        setComposerOpen(true);
      } else if (params.get("ai") === "true") {
        setOpenWithAi(true);
        setComposerOpen(true);
      }
    }

    return () => window.removeEventListener("open-composer", handleOpenComposer);
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingPost(null);
    setOpenWithAi(false);
    setComposerOpen(true);
  };

  const handlePostClick = (post) => {
    setViewingPost(post);
  };

  const handleNewPost = () => {
    setSelectedDate(null);
    setEditingPost(null);
    setOpenWithAi(false);
    setComposerOpen(true);
  };

  const handleWriteWithAi = () => {
    setSelectedDate(null);
    setEditingPost(null);
    setOpenWithAi(true);
    setComposerOpen(true);
  };

  const handleEditPost = (post) => {
    setViewingPost(null);
    setEditingPost(post);
    setOpenWithAi(false);
    setComposerOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setViewingPost(null);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishNow = async (postId) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish_now" })
      });
      if (res.ok) {
        const updated = await res.json();
        setViewingPost(updated);
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to publish post.");
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing post");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedulePost = async (postId, newScheduledAt) => {
    const prevPosts = [...posts];
    const postToUpdate = posts.find((p) => p.id === postId);
    if (!postToUpdate) return;

    const newIsoDate = newScheduledAt instanceof Date ? newScheduledAt.toISOString() : newScheduledAt;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, scheduledAt: newIsoDate, status: "scheduled", error: null } : p
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newIsoDate })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server failed to reschedule post");
      }
    } catch (err) {
      console.error("Reschedule failed:", err);
      // Rollback
      setPosts(prevPosts);
      throw err;
    }
  };

  const handlePostSaved = (savedPost) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPost.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = savedPost;
        return updated;
      }
      return [savedPost, ...prev];
    });
  };

  // Stats calculation
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const publishedCount = posts.filter((p) => p.status === "completed").length;
  const uniqueChannels = new Set(posts.map((p) => p.platform)).size;
  const userCredits = session?.user?.credits ?? 0;

  // Unauthenticated Welcome View
  if (status === "unauthenticated") {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 bg-[#f8f9fa] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium shadow-xs">
            <FaRocket className="text-[11px] text-[#612bd3] dark:text-zinc-300" />
            <span>Social Media Scheduling Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
            Schedule, preview & publish across all your channels
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Manage YouTube, TikTok, Instagram, X (Twitter), and LinkedIn from a clean interactive content calendar with real-time feed previews.
          </p>

          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => signIn("google")}
              className="px-5 py-2.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white border border-zinc-300 dark:border-zinc-700 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow active:scale-98"
            >
              <FaGoogle className="text-xs text-red-500" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-10 text-left">
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-1.5 shadow-xs dark:shadow-none transition-colors">
              <div className="w-8 h-8 rounded-md bg-[#612bd3]/10 dark:bg-zinc-800/60 text-[#612bd3] dark:text-zinc-300 flex items-center justify-center text-xs">
                <FaCalendarAlt />
              </div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                Content Calendar
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Month & week views with slot clicking and multi-channel post tracking.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-1.5 shadow-xs dark:shadow-none transition-colors">
              <div className="w-8 h-8 rounded-md bg-purple-500/10 dark:bg-zinc-800/60 text-purple-600 dark:text-zinc-300 flex items-center justify-center text-xs">
                <FaShareAlt />
              </div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                Live Feed Mockups
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Real-time previews for YouTube, TikTok, Instagram, X, and LinkedIn.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-1.5 shadow-xs dark:shadow-none transition-colors">
              <div className="w-8 h-8 rounded-md bg-pink-500/10 dark:bg-zinc-800/60 text-pink-600 dark:text-zinc-300 flex items-center justify-center text-xs">
                <FaRocket />
              </div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                Automated Publishing
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Scheduled background queues publish automatically to connected accounts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Scheduled */}
        <div className="p-3.5 rounded-[12px] bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] flex items-center justify-between shadow-xs dark:shadow-sm transition-colors">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-[#999999] tracking-wider uppercase">
              SCHEDULED
            </span>
            <p className="text-2xl font-bold text-[#612bd3] dark:text-[#8c66ff] font-mono">
              {scheduledCount}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#612bd3]/15 border border-[#612bd3]/30 text-[#612bd3] dark:text-[#8c66ff] flex items-center justify-center text-xs shadow-xs">
            <FaClock />
          </div>
        </div>

        {/* Card 2: Published */}
        <div className="p-3.5 rounded-[12px] bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] flex items-center justify-between shadow-xs dark:shadow-sm transition-colors">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-[#999999] tracking-wider uppercase">
              PUBLISHED
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {publishedCount}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs shadow-xs">
            <FaCheckCircle />
          </div>
        </div>

        {/* Card 3: Connected Channels */}
        <div className="p-3.5 rounded-[12px] bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] flex items-center justify-between shadow-xs dark:shadow-sm transition-colors">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-[#999999] tracking-wider uppercase">
              CONNECTED CHANNELS
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                {connectedAccounts.length > 0 ? connectedAccounts.length : uniqueChannels}
              </p>
              <Link
                href="/integrations"
                className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                + Add
              </Link>
            </div>
          </div>
          <Link
            href="/integrations"
            className="w-8 h-8 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs shadow-xs transition-colors"
            title="Manage Connected Channels"
          >
            <FaShareAlt />
          </Link>
        </div>

        {/* Card 4: Credits Balance */}
        <div className="p-3.5 rounded-[12px] bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] flex items-center justify-between shadow-xs dark:shadow-sm transition-colors">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-[#999999] tracking-wider uppercase">
              CREDITS BALANCE
            </span>
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400 font-mono">
              {userCredits}
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-3 py-1 rounded-md text-xs font-semibold text-amber-600 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all shadow-xs"
          >
            Top Up
          </Link>
        </div>
      </div>

      {/* Content Calendar Main Component */}
      <ContentCalendar
        posts={posts}
        connectedAccounts={connectedAccounts}
        onDateClick={handleDateClick}
        onPostClick={handlePostClick}
        onNewPostClick={handleNewPost}
        onWriteWithAi={handleWriteWithAi}
        onDuplicatePost={handleEditPost}
        onDeletePost={handleDeletePost}
        onPublishNow={handlePublishNow}
        onReschedulePost={handleReschedulePost}
      />

      {/* Post Details / Quick Actions Modal */}
      {viewingPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingPost(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] rounded-[14px] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#252525]">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                  viewingPost.platform === "youtube" ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" :
                  viewingPost.platform === "instagram" ? "bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30" :
                  viewingPost.platform === "tiktok" ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30" :
                  viewingPost.platform === "linkedin" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30" :
                  viewingPost.platform === "threads" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30" :
                  "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                }`}>
                  {viewingPost.platform}
                </span>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded ${
                  viewingPost.status === "completed" 
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" 
                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                }`}>
                  {viewingPost.status}
                </span>
              </div>
              <button
                onClick={() => setViewingPost(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Media & Title */}
            {viewingPost.mediaUrl && (
              <div className="aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-black">
                <img
                  src={viewingPost.mediaUrl}
                  alt="Post thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {viewingPost.title || "Untitled Post"}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {viewingPost.description || "No description provided."}
              </p>
              {viewingPost.tags && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                  {viewingPost.tags.split(",").map(t => `#${t.trim()}`).join(" ")}
                </p>
              )}
            </div>

            {/* Scheduled Date Info */}
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FaClock className="text-zinc-400 text-xs" />
                Scheduled for:
              </span>
              <span className="font-medium text-slate-800 dark:text-zinc-200 font-mono">
                {viewingPost.scheduledAt ? new Date(viewingPost.scheduledAt).toLocaleString() : "Immediate"}
              </span>
            </div>

            {/* Error Banner if any */}
            {viewingPost.error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <FaExclamationTriangle className="text-red-500 text-xs shrink-0 mt-0.5" />
                <span className="leading-normal">{viewingPost.error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDeletePost(viewingPost.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FiTrash2 /> Delete
              </button>

              <div className="flex items-center gap-2">
                {viewingPost.status !== "completed" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handlePublishNow(viewingPost.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/25 active:scale-95 disabled:opacity-50"
                  >
                    <FaBolt className="text-[10px]" />
                    <span>{actionLoading ? "Publishing..." : "Publish Now"}</span>
                  </button>
                )}
                {viewingPost.publishedUrl && (
                  <a
                    href={viewingPost.publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5"
                  >
                    <FiExternalLink /> View Live
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleEditPost(viewingPost)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-transparent transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <FiEdit2 /> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Composer & Multi-Channel Modal */}
      <PostComposerModal
        isOpen={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setSelectedDate(null);
          setEditingPost(null);
          setOpenWithAi(false);
        }}
        initialDate={selectedDate}
        initialPost={editingPost}
        onPostSaved={handlePostSaved}
        initialOpenAiWriter={openWithAi}
      />
    </div>
  );
}
