"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin, 
  FaPinterest, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlus, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaCalendarAlt, 
  FaList, 
  FaBolt,
  FaMagic,
  FaShareAlt
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiTrash2, 
  FiEdit2, 
  FiExternalLink, 
  FiCopy, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp, 
  FiX,
  FiCheck,
  FiTag
} from "react-icons/fi";

const PLATFORM_CONFIG = {
  youtube: { 
    name: "YouTube", 
    Icon: FaYoutube, 
    color: "text-red-500", 
    bannerBg: "#ef4444",
    cardBg: "bg-red-500/[0.08] hover:bg-red-500/[0.14] border-red-500/30",
    borderAccent: "border-l-2 border-l-red-500",
    activePill: "bg-red-500/20 text-red-500 border border-red-500/40 shadow-xs" 
  },
  tiktok: { 
    name: "TikTok", 
    Icon: SiTiktok, 
    color: "text-cyan-400", 
    bannerBg: "#06b6d4",
    cardBg: "bg-cyan-500/[0.08] hover:bg-cyan-500/[0.14] border-cyan-500/30",
    borderAccent: "border-l-2 border-l-cyan-400",
    activePill: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-xs" 
  },
  instagram: { 
    name: "Instagram", 
    Icon: FaInstagram, 
    color: "text-pink-500", 
    bannerBg: "#ec4899",
    cardBg: "bg-pink-500/[0.08] hover:bg-pink-500/[0.14] border-pink-500/30",
    borderAccent: "border-l-2 border-l-pink-500",
    activePill: "bg-pink-500/20 text-pink-500 border border-pink-500/40 shadow-xs" 
  },
  x_twitter: { 
    name: "X (Twitter)", 
    Icon: FaXTwitter, 
    color: "text-sky-400", 
    bannerBg: "#0ea5e9",
    cardBg: "bg-sky-500/[0.08] hover:bg-sky-500/[0.14] border-sky-500/30",
    borderAccent: "border-l-2 border-l-sky-400",
    activePill: "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-xs" 
  },
  facebook: { 
    name: "Facebook", 
    Icon: FaFacebook, 
    color: "text-blue-600", 
    bannerBg: "#2563eb",
    cardBg: "bg-blue-600/[0.08] hover:bg-blue-600/[0.14] border-blue-600/30",
    borderAccent: "border-l-2 border-l-blue-600",
    activePill: "bg-blue-600/20 text-blue-500 border border-blue-600/40 shadow-xs" 
  },
  linkedin: { 
    name: "LinkedIn", 
    Icon: FaLinkedin, 
    color: "text-blue-500", 
    bannerBg: "#0284c7",
    cardBg: "bg-blue-500/[0.08] hover:bg-blue-500/[0.14] border-blue-500/30",
    borderAccent: "border-l-2 border-l-blue-500",
    activePill: "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-xs" 
  },
  threads: { 
    name: "Threads", 
    Icon: FaThreads, 
    color: "text-purple-400", 
    bannerBg: "#a855f7",
    cardBg: "bg-purple-500/[0.08] hover:bg-purple-500/[0.14] border-purple-500/30",
    borderAccent: "border-l-2 border-l-purple-400",
    activePill: "bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-xs" 
  },
  pinterest: { 
    name: "Pinterest", 
    Icon: FaPinterest, 
    color: "text-rose-500", 
    bannerBg: "#f43f5e",
    cardBg: "bg-rose-500/[0.08] hover:bg-rose-500/[0.14] border-rose-500/30",
    borderAccent: "border-l-2 border-l-rose-500",
    activePill: "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs" 
  },
};

const HOURS_LIST = Array.from({ length: 24 }, (_, i) => i);

export default function ContentCalendar({
  posts = [],
  connectedAccounts = [],
  onDateClick,
  onPostClick,
  onNewPostClick,
  onWriteWithAi,
  onDuplicatePost,
  onDeletePost,
  onPublishNow,
  onReschedulePost,
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("month"); // "month" | "week" | "day" | "list"
  const [platformFilter, setPlatformFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [availableTags, setAvailableTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // for list view: "all" | "scheduled" | "draft" | "published"
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [draggedPostId, setDraggedPostId] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const weekTimelineRef = useRef(null);
  const dayTimelineRef = useRef(null);

  // Fetch available custom tags
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableTags(data);
      })
      .catch(() => {});
  }, []);

  const allTagOptions = useMemo(() => {
    const map = new Map();
    availableTags.forEach((t) => {
      if (t.name) map.set(t.name.toLowerCase(), t);
    });
    posts.forEach((p) => {
      if (p.customTag && !map.has(p.customTag.toLowerCase())) {
        map.set(p.customTag.toLowerCase(), { name: p.customTag, color: p.tagColor || "#612bd3" });
      }
    });
    return Array.from(map.values());
  }, [availableTags, posts]);

  // 1-minute ticker for the Now Line
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll timeline to current hour on week/day mode
  useEffect(() => {
    const targetScroll = Math.max(0, (now.getHours() - 1) * 58);
    if (viewMode === "week" && weekTimelineRef.current) {
      weekTimelineRef.current.scrollTop = targetScroll;
    } else if (viewMode === "day" && dayTimelineRef.current) {
      dayTimelineRef.current.scrollTop = targetScroll;
    }
  }, [viewMode, now]);

  // Global drag cleanup to ensure cards never stay stuck in dragging/disabled appearance
  useEffect(() => {
    const handleDragCleanup = () => {
      setDraggedPostId(null);
      setDragOverKey(null);
    };
    window.addEventListener("dragend", handleDragCleanup);
    window.addEventListener("drop", handleDragCleanup);
    return () => {
      window.removeEventListener("dragend", handleDragCleanup);
      window.removeEventListener("drop", handleDragCleanup);
    };
  }, []);

  // Drag and Drop rescheduling handlers
  const handleDropOnMonthDay = async (postId, targetDate) => {
    setDraggedPostId(null);
    setDragOverKey(null);

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const currentScheduled = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
    const newDate = new Date(targetDate);
    newDate.setHours(currentScheduled.getHours(), currentScheduled.getMinutes(), 0, 0);

    // Skip if dropping onto the same day
    if (isSameDay(currentScheduled, targetDate)) return;

    try {
      await onReschedulePost?.(postId, newDate);
      toast.success(
        `Rescheduled to ${newDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${formatTime(newDate)}`,
        { icon: "📅" }
      );
    } catch (err) {
      toast.error("Failed to reschedule post.");
    }
  };

  const handleDropOnWeekSlot = async (postId, targetDate, targetHour) => {
    setDraggedPostId(null);
    setDragOverKey(null);

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const currentScheduled = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
    const newDate = new Date(targetDate);
    newDate.setHours(targetHour, currentScheduled.getMinutes() || 0, 0, 0);

    try {
      await onReschedulePost?.(postId, newDate);
      toast.success(
        `Rescheduled to ${newDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${formatHourLabel(targetHour)}`,
        { icon: "📅" }
      );
    } catch (err) {
      toast.error("Failed to reschedule post.");
    }
  };

  const handleDropOnDaySlot = async (postId, targetHour) => {
    setDraggedPostId(null);
    setDragOverKey(null);

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const currentScheduled = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
    const newDate = new Date(currentDate);
    newDate.setHours(targetHour, currentScheduled.getMinutes() || 0, 0, 0);

    try {
      await onReschedulePost?.(postId, newDate);
      toast.success(
        `Rescheduled to ${formatHourLabel(targetHour)}`,
        { icon: "📅" }
      );
    } catch (err) {
      toast.error("Failed to reschedule post.");
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Date comparison helpers
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d) => isSameDay(d, now);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatHourLabel = (h) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  };

  // Navigation handlers
  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (viewMode === "day") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (viewMode === "day") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Filtered posts based on platform, status, channel, and custom tag
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (platformFilter !== "all" && post.platform !== platformFilter) return false;
      if (tagFilter !== "all" && (post.customTag || "").toLowerCase() !== tagFilter.toLowerCase()) return false;
      if (selectedChannelId && post.channelId && post.channelId !== selectedChannelId) return false;
      if (viewMode === "list" && statusFilter !== "all") {
        if (statusFilter === "scheduled" && post.status !== "scheduled") return false;
        if (statusFilter === "draft" && post.status !== "draft") return false;
        if (statusFilter === "published" && post.status !== "completed") return false;
      }
      return true;
    });
  }, [posts, platformFilter, tagFilter, selectedChannelId, viewMode, statusFilter]);

  // Calendar calculations for Month View (42-day Mon-Sun grid)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  // Week View Days (7 days, Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Helper to get posts for a day
  const getPostsForDay = (date) => {
    return filteredPosts.filter((post) => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return isSameDay(postDate, date);
    });
  };

  // Helper to get posts for an exact hour in a day
  const getPostsForHour = (date, hour) => {
    return filteredPosts.filter((post) => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return isSameDay(postDate, date) && postDate.getHours() === hour;
    });
  };

  // Display text in top toolbar
  const getDisplayText = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (viewMode === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      const sStr = start ? `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}` : "";
      const eStr = end ? `${end.getMonth() + 1}/${end.getDate()}/${end.getFullYear()}` : "";
      return `${sStr} - ${eStr}`;
    }
    if (viewMode === "day") {
      return `${currentDate.toLocaleDateString("en-US", { weekday: "long" })} (${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()})`;
    }
    return `Upcoming Posts (${filteredPosts.length})`;
  };

  // List view posts grouped by date
  const groupedListPosts = useMemo(() => {
    const groups = {};
    const sorted = [...filteredPosts].sort((a, b) => {
      const tA = new Date(a.scheduledAt || 0).getTime();
      const tB = new Date(b.scheduledAt || 0).getTime();
      return tA - tB;
    });

    sorted.forEach((post) => {
      if (!post.scheduledAt) return;
      const d = new Date(post.scheduledAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = { date: d, items: [] };
      groups[key].items.push(post);
    });

    return Object.values(groups);
  }, [filteredPosts]);

  // NowLine calculation for Week View
  const weekTodayIndex = weekDays.findIndex((d) => isToday(d));
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const minuteProgress = (currentMinute / 60) * 100;

  return (
    <div className="flex flex-col lg:flex-row bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] rounded-[14px] overflow-hidden shadow-xs dark:shadow-xl transition-colors">
      
      {/* ============================================================== */}
      {/* 1. LEFT CHANNELS SIDEBAR                                       */}
      {/* ============================================================== */}
      <div
        className={`bg-zinc-50 dark:bg-[#161515] border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-[#252525] p-3.5 sm:p-4 flex flex-col gap-3.5 transition-all select-none shrink-0 ${
          isSidebarCollapsed ? "lg:w-[76px]" : "lg:w-[260px]"
        }`}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide">
              Channels
            </h2>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-6 h-6 rounded-md bg-zinc-200/80 dark:bg-[#201f1f] border border-zinc-300 dark:border-[#2a2929] text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer mx-auto lg:mx-0"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <FaChevronRight className="text-[10px]" />
            ) : (
              <FaChevronLeft className="text-[10px]" />
            )}
          </button>
        </div>

        {/* Action Buttons: Add Channel, New Post, AI Writer */}
        <div className="flex flex-col gap-2">
          {/* Add Channel Button */}
          <Link
            href="/integrations"
            className={`h-10 rounded-lg border border-dashed border-zinc-300 dark:border-[#333333] hover:border-zinc-400 dark:hover:border-[#555555] bg-white dark:bg-[#1a1919] hover:bg-zinc-100 dark:hover:bg-[#201f1f] text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isSidebarCollapsed ? "w-10 mx-auto px-0" : "px-3"
            }`}
            title="Add Connected Channel"
          >
            <FaPlus className="text-[10px] text-[#612bd3] dark:text-[#8c66ff]" />
            {!isSidebarCollapsed && <span>Add Channel</span>}
          </Link>

          {/* New Post and AI Writer Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewPostClick}
              className={`flex-1 h-10 rounded-lg bg-[#612bd3] hover:bg-[#7237e8] text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm shadow-[#612bd3]/30 cursor-pointer active:scale-95 ${
                isSidebarCollapsed ? "w-10 mx-auto px-0 flex-none" : "px-3"
              }`}
              title="Create New Post"
            >
              <FaPlus className="text-[11px]" />
              {!isSidebarCollapsed && <span>New Post</span>}
            </button>

            {onWriteWithAi && !isSidebarCollapsed && (
              <button
                type="button"
                onClick={onWriteWithAi}
                className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all shadow-sm shadow-purple-600/30 cursor-pointer active:scale-95 shrink-0"
                title="Write with AI"
              >
                <FaMagic className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Connected Channels List */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[460px] pr-0.5">
          {/* All Channels Option */}
          <div
            onClick={() => setSelectedChannelId(null)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
              selectedChannelId === null
                ? "bg-white dark:bg-[#201f1f] border-[#612bd3] text-zinc-900 dark:text-white font-semibold shadow-xs"
                : "border-transparent text-zinc-600 dark:text-[#999999] hover:bg-zinc-200/60 dark:hover:bg-[#1a1919]"
            } ${isSidebarCollapsed ? "justify-center px-1" : ""}`}
            title="All Channels"
          >
            <div className="w-6 h-6 rounded-md bg-[#612bd3]/15 text-[#612bd3] dark:text-[#8c66ff] flex items-center justify-center shrink-0 text-xs">
              <FaShareAlt className="text-[11px]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="truncate">All Channels</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-[#282727] text-zinc-500 dark:text-zinc-400">
                  {posts.length}
                </span>
              </div>
            )}
          </div>

          {/* Connected Channels Items */}
          {connectedAccounts.length > 0 ? (
            connectedAccounts.map((acc) => {
              const platKey = (acc.platform_name || "").toLowerCase();
              const plat = PLATFORM_CONFIG[platKey] || PLATFORM_CONFIG.youtube;
              const Icon = plat.Icon;
              const isSelected = selectedChannelId === acc.id;
              const accPostsCount = posts.filter(
                (p) => p.platform === platKey || p.channelId === acc.id
              ).length;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedChannelId(isSelected ? null : acc.id)}
                  className={`p-2 rounded-lg border text-xs flex items-center gap-2.5 transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-white dark:bg-[#201f1f] border-[#612bd3] text-zinc-900 dark:text-white font-semibold shadow-xs"
                      : "border-zinc-200/50 dark:border-[#222222] bg-white/60 dark:bg-[#191919]/60 hover:bg-zinc-100 dark:hover:bg-[#201f1f] text-zinc-700 dark:text-zinc-300"
                  } ${isSidebarCollapsed ? "justify-center px-1" : ""}`}
                  title={`${acc.account_name || plat.name} (${plat.name})`}
                >
                  {/* Platform Avatar Icon */}
                  <div className="relative w-6 h-6 rounded-md bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className={`text-[12px] ${plat.color}`} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#161515]" />
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate leading-tight">
                        {acc.account_name || plat.name}
                      </p>
                      <span className="text-[9px] text-zinc-400 dark:text-[#777777] capitalize block truncate">
                        {plat.name}
                      </span>
                    </div>
                  )}

                  {!isSidebarCollapsed && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-[#282727] text-zinc-500 dark:text-zinc-400">
                      {accPostsCount}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            /* Empty State for Channels */
            !isSidebarCollapsed && (
              <div className="py-6 px-2 text-center rounded-lg border border-dashed border-zinc-200 dark:border-[#252525] bg-white/40 dark:bg-[#141414]/40 mt-1">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#201f1f] text-zinc-400 mx-auto flex items-center justify-center mb-2">
                  <FaShareAlt className="text-xs" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">
                  No channels yet
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2.5">
                  Connect your accounts to schedule
                </p>
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#612bd3] dark:text-[#8c66ff] hover:underline"
                >
                  <span>Connect Channels</span>
                  <FaChevronRight className="text-[8px]" />
                </Link>
              </div>
            )
          )}
        </div>

        {/* Sidebar Footer Indicator */}
        {!isSidebarCollapsed && (
          <div className="pt-2 border-t border-zinc-200 dark:border-[#222222] text-center">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider uppercase">
              Workspace Scheduler
            </span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN CALENDAR CONTAINER                                     */}
      {/* ============================================================== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Toolbar (Filters, Navigation, View Switcher) */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-[#252525] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/70 dark:bg-[#161515] transition-colors">
          
          {/* Left: Date Navigation Segmented Pill & Today */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center bg-white dark:bg-[#201f1f] border border-zinc-200 dark:border-[#2a2929] rounded-lg overflow-hidden h-9 shadow-2xs">
              <button
                type="button"
                onClick={prevPeriod}
                className="px-2.5 h-full text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282727] transition-colors cursor-pointer flex items-center justify-center"
                title="Previous period"
              >
                <FaChevronLeft className="text-[10px]" />
              </button>

              <div className="px-3.5 h-full flex items-center justify-center text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 min-w-[150px] sm:min-w-[180px] text-center border-x border-zinc-200 dark:border-[#2a2929] select-none">
                {getDisplayText()}
              </div>

              <button
                type="button"
                onClick={nextPeriod}
                className="px-2.5 h-full text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282727] transition-colors cursor-pointer flex items-center justify-center"
                title="Next period"
              >
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>

            <button
              type="button"
              onClick={jumpToToday}
              className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-[#2a2929] bg-white dark:bg-[#201f1f] hover:bg-zinc-100 dark:hover:bg-[#282727] text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
            >
              Today
            </button>
          </div>

          {/* Right: Platform Filters & View Modes */}
          <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
            
            {/* Platform Filter Buttons */}
            <div className="hidden xl:flex items-center gap-1 bg-white dark:bg-[#141414] p-1 rounded-lg border border-zinc-200 dark:border-[#252525] text-xs">
              {["all", "youtube", "tiktok", "instagram", "x_twitter", "facebook", "linkedin", "threads"].map((platKey) => {
                const isActive = platformFilter === platKey;
                const plat = PLATFORM_CONFIG[platKey];
                const Icon = plat?.Icon;

                return (
                  <button
                    key={platKey}
                    type="button"
                    onClick={() => setPlatformFilter(platKey)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? platKey === "all"
                          ? "bg-[#612bd3] text-white font-bold shadow-xs"
                          : plat?.activePill || "bg-[#612bd3] text-white font-bold"
                        : "text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#201f1f]"
                    }`}
                  >
                    {Icon && <Icon className={`text-[10px] ${isActive ? "text-current" : plat.color}`} />}
                    <span className="capitalize">{platKey === "x_twitter" ? "X" : plat?.name || platKey}</span>
                  </button>
                );
              })}
            </div>

            {/* Tag Filter Dropdown */}
            {allTagOptions.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#141414] px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-[#252525] text-xs shadow-2xs">
                <FiTag className="text-[#612bd3] dark:text-[#fc69ff] text-[11px] shrink-0" />
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="bg-transparent text-xs text-zinc-700 dark:text-zinc-200 font-medium outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Tags</option>
                  {allTagOptions.map((t) => (
                    <option key={t.name} value={t.name}>#{t.name}</option>
                  ))}
                </select>
                {tagFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setTagFilter("all")}
                    className="text-zinc-400 hover:text-red-500 text-[10px] ml-0.5 cursor-pointer"
                    title="Clear tag filter"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* View Mode Switcher: Day | Week | Month */}
            <div className="flex items-center bg-white dark:bg-[#141414] p-1 rounded-lg border border-zinc-200 dark:border-[#252525] text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  viewMode === "day"
                    ? "bg-zinc-200 dark:bg-[#201f1f] text-[#fc69ff] font-bold shadow-2xs"
                    : "text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  viewMode === "week"
                    ? "bg-zinc-200 dark:bg-[#201f1f] text-[#fc69ff] font-bold shadow-2xs"
                    : "text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                  viewMode === "month"
                    ? "bg-zinc-200 dark:bg-[#201f1f] text-[#fc69ff] font-bold shadow-2xs"
                    : "text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Month
              </button>
            </div>

            {/* List View Toggle Button */}
            <div className="flex items-center bg-white dark:bg-[#141414] p-1 rounded-lg border border-zinc-200 dark:border-[#252525] text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode !== "list"
                    ? "bg-zinc-200 dark:bg-[#201f1f] text-[#fc69ff] shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
                title="Calendar View"
              >
                <FaCalendarAlt className="text-xs" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-zinc-200 dark:bg-[#201f1f] text-[#fc69ff] shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
                title="List View"
              >
                <FaList className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CALENDAR VIEWS: Month, Week, Day, List                      */}
        {/* ============================================================== */}

        {/* ----------------- VIEW A: MONTH VIEW ------------------------- */}
        {viewMode === "month" && (
          <div className="flex flex-col flex-1">
            {/* Sticky 7-Day Header */}
            <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-[#252525] bg-zinc-50 dark:bg-[#161515] text-center py-2.5 text-[11px] font-bold text-zinc-500 dark:text-[#999999] uppercase tracking-wider transition-colors select-none">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>

            {/* 42-Day Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 dark:divide-[#252525] bg-white dark:bg-[#141414] transition-colors flex-1">
              {calendarDays.map((item, idx) => {
                const dayPosts = getPostsForDay(item.date);
                const dayIsToday = isToday(item.date);
                const cellKey = `month-day-${idx}`;
                const isDragOver = dragOverKey === cellKey;

                return (
                  <div
                    key={idx}
                    onClick={() => onDateClick?.(item.date)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverKey !== cellKey) setDragOverKey(cellKey);
                    }}
                    onDragLeave={() => {
                      if (dragOverKey === cellKey) setDragOverKey(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverKey(null);
                      setDraggedPostId(null);
                      const postId = e.dataTransfer.getData("text/plain");
                      if (postId) {
                        handleDropOnMonthDay(postId, item.date);
                      }
                    }}
                    className={`min-h-[96px] sm:min-h-[108px] p-2 flex flex-col justify-between group transition-all cursor-pointer relative ${
                      isDragOver
                        ? "ring-2 ring-inset ring-[#612bd3] bg-[#612bd3]/15 dark:bg-[#612bd3]/25 border-dashed border-[#612bd3] scale-[1.01] z-10 shadow-md"
                        : item.isCurrentMonth
                        ? "bg-white dark:bg-transparent hover:bg-zinc-50/80 dark:hover:bg-[#1a1919]/60"
                        : "bg-zinc-50/60 dark:bg-[#0e0e0e]/80 text-zinc-400 dark:text-[#666666] hover:bg-zinc-100/50 dark:hover:bg-[#161515]/50"
                    } ${
                      dayIsToday && !isDragOver
                        ? "ring-1 ring-inset ring-[#fc69ff]/70 bg-[#fc69ff]/[0.03] dark:bg-[#fc69ff]/[0.05]"
                        : ""
                    }`}
                  >
                    {/* Date Number Header Bar */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs h-6 min-w-6 px-1.5 rounded-[6px] flex items-center justify-center font-medium ${
                          dayIsToday
                            ? "bg-[#fc69ff] text-black font-bold shadow-xs shadow-[#fc69ff]/40"
                            : item.isCurrentMonth
                            ? "text-zinc-800 dark:text-zinc-300"
                            : "text-zinc-400 dark:text-[#666666]"
                        }`}
                      >
                        {item.date.getDate()}
                      </span>

                      {/* Drop hint indicator when dragging over */}
                      {isDragOver ? (
                        <span className="text-[9px] font-bold text-[#612bd3] dark:text-[#8c66ff] uppercase tracking-wider animate-pulse">
                          Drop here
                        </span>
                      ) : (
                        /* Hover Quick Add '+' button */
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDateClick?.(item.date);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-[6px] bg-[#612bd3]/20 hover:bg-[#612bd3] text-[#8c66ff] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Add post on this day"
                        >
                          <FaPlus className="text-[9px]" />
                        </button>
                      )}
                    </div>

                    {/* Posts Cards Container */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[85px] pr-0.5">
                      {dayPosts.map((post) => (
                        <CalendarItemCard
                          key={post.id}
                          post={post}
                          onPostClick={onPostClick}
                          onDuplicatePost={onDuplicatePost}
                          onDeletePost={onDeletePost}
                          formatTime={formatTime}
                          isDragging={draggedPostId === post.id}
                          onDragStart={setDraggedPostId}
                          onDragEnd={() => setDraggedPostId(null)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- VIEW B: WEEK VIEW -------------------------- */}
        {viewMode === "week" && (
          <div className="flex flex-col flex-1 overflow-x-auto">
            {/* Week Days Sticky Header */}
            <div className="grid grid-cols-[84px_repeat(7,_minmax(120px,_1fr))] border-b border-zinc-200 dark:border-[#252525] bg-zinc-50 dark:bg-[#161515] sticky top-0 z-20">
              <div className="p-2.5 text-center flex items-center justify-center text-[11px] font-bold text-zinc-400 dark:text-[#777777] border-r border-zinc-200 dark:border-[#252525]">
                TIME
              </div>

              {weekDays.map((d, i) => {
                const dayIsToday = isToday(d);
                return (
                  <div
                    key={i}
                    className={`p-2.5 text-center border-r border-zinc-200 dark:border-[#252525] last:border-r-0 ${
                      dayIsToday ? "bg-[#fc69ff]/[0.06] dark:bg-[#fc69ff]/[0.08]" : ""
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider block ${
                        dayIsToday ? "text-[#fc69ff]" : "text-zinc-500 dark:text-[#999999]"
                      }`}
                    >
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      {dayIsToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fc69ff] inline-block" />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          dayIsToday
                            ? "text-[#fc69ff]"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {d.getMonth() + 1}/{d.getDate()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 24-Hour Vertical Timeline */}
            <div
              ref={weekTimelineRef}
              className="grid grid-cols-[84px_repeat(7,_minmax(120px,_1fr))] divide-x divide-zinc-200 dark:divide-[#252525] bg-white dark:bg-[#141414] relative max-h-[640px] overflow-y-auto"
            >
              {HOURS_LIST.map((hour) => {
                const isCurrentHour = weekTodayIndex !== -1 && currentHour === hour;

                return (
                  <div key={hour} className="contents relative">
                    {/* Hour Label */}
                    <div className="p-2 text-center text-[11px] font-mono text-zinc-400 dark:text-[#777777] border-b border-zinc-200 dark:border-[#252525] flex items-center justify-center min-h-[58px] bg-zinc-50/50 dark:bg-[#161515]/50 relative">
                      {formatHourLabel(hour)}

                      {/* NowTime Badge in Timeline Column */}
                      {isCurrentHour && (
                        <div
                          className="absolute right-1 -translate-y-1/2 z-30 px-1.5 py-0.5 rounded-[4px] bg-[#fc69ff] text-black text-[10px] font-bold whitespace-nowrap shadow-xs"
                          style={{ top: `${minuteProgress}%` }}
                        >
                          {formatTime(now)}
                        </div>
                      )}
                    </div>

                    {/* 7 Day Slots for this hour */}
                    {weekDays.map((d, dayIdx) => {
                      const hourPosts = getPostsForHour(d, hour);
                      const isTodaySlot = dayIdx === weekTodayIndex;
                      const slotKey = `week-slot-${dayIdx}-${hour}`;
                      const isDragOver = dragOverKey === slotKey;

                      return (
                        <div
                          key={dayIdx}
                          onClick={() => {
                            const target = new Date(d);
                            target.setHours(hour, 0, 0, 0);
                            onDateClick?.(target);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (dragOverKey !== slotKey) setDragOverKey(slotKey);
                          }}
                          onDragLeave={() => {
                            if (dragOverKey === slotKey) setDragOverKey(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverKey(null);
                            setDraggedPostId(null);
                            const postId = e.dataTransfer.getData("text/plain");
                            if (postId) {
                              handleDropOnWeekSlot(postId, d, hour);
                            }
                          }}
                          className={`p-1.5 border-b border-zinc-200 dark:border-[#252525] min-h-[58px] flex flex-col gap-1 relative group cursor-pointer transition-all ${
                            isDragOver
                              ? "ring-2 ring-inset ring-[#612bd3] bg-[#612bd3]/20 dark:bg-[#612bd3]/30 z-20 shadow-md"
                              : isTodaySlot
                              ? "bg-[#fc69ff]/[0.02] dark:bg-[#fc69ff]/[0.04] hover:bg-[#fc69ff]/[0.05]"
                              : "hover:bg-zinc-50 dark:hover:bg-[#1a1919]"
                          }`}
                        >
                          {/* WeekNowLine indicator */}
                          {isCurrentHour && (
                            <div
                              className="absolute inset-x-0 h-0 flex items-center z-25 pointer-events-none"
                              style={{ top: `${minuteProgress}%` }}
                            >
                              {isTodaySlot ? (
                                <>
                                  <div className="w-1.5 h-2 rounded-full bg-[#fc69ff] shadow-sm shadow-[#fc69ff]/60" />
                                  <div className="flex-1 h-[2px] bg-[#fc69ff] shadow-sm shadow-[#fc69ff]/60" />
                                </>
                              ) : (
                                <div className="flex-1 h-[1px] bg-[#fc69ff]/30" />
                              )}
                            </div>
                          )}

                          {/* Hover '+' add button for empty slot */}
                          {hourPosts.length === 0 && (
                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="w-5 h-5 rounded-[6px] bg-[#612bd3]/20 hover:bg-[#612bd3] text-[#8c66ff] hover:text-white flex items-center justify-center shadow-2xs">
                                <FaPlus className="text-[9px]" />
                              </span>
                            </div>
                          )}

                          {/* Hour Posts */}
                          {hourPosts.map((post) => (
                            <CalendarItemCard
                              key={post.id}
                              post={post}
                              onPostClick={onPostClick}
                              onDuplicatePost={onDuplicatePost}
                              onDeletePost={onDeletePost}
                              formatTime={formatTime}
                              isDragging={draggedPostId === post.id}
                              onDragStart={setDraggedPostId}
                              onDragEnd={() => setDraggedPostId(null)}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- VIEW C: DAY VIEW --------------------------- */}
        {viewMode === "day" && (
          <div className="flex flex-col flex-1 p-3 sm:p-4 space-y-3">
            {/* Day Header with Connected Channels Overview */}
            <div className="p-3 bg-zinc-50 dark:bg-[#161515] rounded-xl border border-zinc-200 dark:border-[#252525] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {getPostsForDay(currentDate).length} scheduled items
                </p>
              </div>

              {/* Channels Avatars Bar */}
              <div className="flex items-center -space-x-1.5">
                {connectedAccounts.slice(0, 5).map((acc) => {
                  const plat = PLATFORM_CONFIG[acc.platform_name] || PLATFORM_CONFIG.youtube;
                  const Icon = plat.Icon;
                  return (
                    <div
                      key={acc.id}
                      className="w-7 h-7 rounded-full bg-white dark:bg-[#201f1f] border-2 border-white dark:border-[#161515] flex items-center justify-center shadow-xs"
                      title={acc.account_name || plat.name}
                    >
                      <Icon className={`text-xs ${plat.color}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 24-Hour Slots for Single Day */}
            <div
              ref={dayTimelineRef}
              className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1"
            >
              {HOURS_LIST.map((hour) => {
                const hourPosts = getPostsForHour(currentDate, hour);
                const isSelectedDayToday = isToday(currentDate);
                const isCurrentHour = isSelectedDayToday && currentHour === hour;
                const slotKey = `day-slot-${hour}`;
                const isDragOver = dragOverKey === slotKey;

                return (
                  <div
                    key={hour}
                    onClick={() => {
                      const target = new Date(currentDate);
                      target.setHours(hour, 0, 0, 0);
                      onDateClick?.(target);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverKey !== slotKey) setDragOverKey(slotKey);
                    }}
                    onDragLeave={() => {
                      if (dragOverKey === slotKey) setDragOverKey(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverKey(null);
                      setDraggedPostId(null);
                      const postId = e.dataTransfer.getData("text/plain");
                      if (postId) {
                        handleDropOnDaySlot(postId, hour);
                      }
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer relative group ${
                      isDragOver
                        ? "ring-2 ring-inset ring-[#612bd3] bg-[#612bd3]/20 dark:bg-[#612bd3]/30 z-20 shadow-md"
                        : isCurrentHour
                        ? "border-[#fc69ff]/60 bg-[#fc69ff]/[0.03] dark:bg-[#fc69ff]/[0.05]"
                        : "border-zinc-200/80 dark:border-[#252525] bg-white dark:bg-[#191919] hover:border-zinc-300 dark:hover:border-[#353535]"
                    }`}
                  >
                    {/* Time Label Row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          {formatHourLabel(hour)}
                        </span>
                        {isCurrentHour && (
                          <span className="px-1.5 py-0.5 rounded bg-[#fc69ff] text-black text-[10px] font-bold">
                            Now ({formatTime(now)})
                          </span>
                        )}
                        {isDragOver && (
                          <span className="px-1.5 py-0.5 rounded bg-[#612bd3] text-white text-[10px] font-bold animate-pulse">
                            Drop to schedule at {formatHourLabel(hour)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const target = new Date(currentDate);
                          target.setHours(hour, 0, 0, 0);
                          onDateClick?.(target);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded text-[10px] font-semibold text-[#8c66ff] hover:text-white bg-[#612bd3]/15 hover:bg-[#612bd3] transition-all flex items-center gap-1"
                      >
                        <FaPlus className="text-[8px]" />
                        <span>Schedule</span>
                      </button>
                    </div>

                    {/* Posts in this Hour */}
                    {hourPosts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {hourPosts.map((post) => (
                          <CalendarItemCard
                            key={post.id}
                            post={post}
                            onPostClick={onPostClick}
                            onDuplicatePost={onDuplicatePost}
                            onDeletePost={onDeletePost}
                            formatTime={formatTime}
                            isDragging={draggedPostId === post.id}
                            onDragStart={setDraggedPostId}
                            onDragEnd={() => setDraggedPostId(null)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-1 text-[11px] text-zinc-400 dark:text-zinc-500 italic">
                        Empty time slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- VIEW D: LIST VIEW -------------------------- */}
        {viewMode === "list" && (
          <div className="flex flex-col flex-1 p-3 sm:p-4 space-y-4">
            {/* Status Filter Tabs (All, Scheduled, Draft, Published) */}
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-[#252525] pb-3">
              {[
                { key: "all", label: "All Posts" },
                { key: "scheduled", label: "Scheduled" },
                { key: "draft", label: "Drafts" },
                { key: "published", label: "Published" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? "bg-[#612bd3] text-white shadow-xs"
                      : "text-zinc-600 dark:text-[#999999] hover:bg-zinc-100 dark:hover:bg-[#201f1f]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chronological List Grouped by Date */}
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {groupedListPosts.length > 0 ? (
                groupedListPosts.map((group) => {
                  const dateStr = group.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div key={dateStr} className="space-y-2">
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider sticky top-0 bg-white/90 dark:bg-[#1a1919]/90 py-1 backdrop-blur-xs z-10">
                        {dateStr}
                      </div>

                      <div className="space-y-2">
                        {group.items.map((post) => {
                          const plat = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.youtube;
                          const Icon = plat.Icon;

                          return (
                            <div
                              key={post.id}
                              onClick={() => onPostClick?.(post)}
                              className="p-3 rounded-xl border border-zinc-200 dark:border-[#252525] bg-white dark:bg-[#201f1f] hover:border-zinc-300 dark:hover:border-[#353535] transition-all shadow-xs flex items-center justify-between gap-3 cursor-pointer group"
                            >
                              {/* Left Accent & Details */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-1.5 h-10 rounded-full shrink-0"
                                  style={{ backgroundColor: post.tagColor || plat.bannerBg }}
                                />

                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                                  <Icon className={`text-base ${plat.color}`} />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {post.title || post.description || "Untitled Post"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1 font-mono">
                                      <FaClock className="text-[10px]" />
                                      {formatTime(post.scheduledAt)}
                                    </span>
                                    <span>•</span>
                                    <span className="capitalize">{plat.name}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Status & Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                {post.customTag && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                                    style={{ backgroundColor: post.tagColor || "#612bd3" }}
                                  >
                                    #{post.customTag}
                                  </span>
                                )}

                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                    post.status === "completed"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                      : post.status === "scheduled"
                                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {post.status}
                                </span>

                                <div className="hidden group-hover:flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicatePost?.(post);
                                    }}
                                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-[#282727] hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    title="Duplicate post"
                                  >
                                    <FiCopy className="text-xs" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeletePost?.(post.id);
                                    }}
                                    className="p-1.5 rounded-md hover:bg-red-500/15 text-zinc-500 hover:text-red-500 transition-colors"
                                    title="Delete post"
                                  >
                                    <FiTrash2 className="text-xs" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                  <FaCalendarAlt className="text-2xl mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No posts match this filter</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// CALENDAR ITEM CARD (Matching Reference App Top Banner & Hover Actions)
// =========================================================================
function CalendarItemCard({
  post,
  onPostClick,
  onDuplicatePost,
  onDeletePost,
  formatTime,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) {
  const plat = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.youtube;
  const Icon = plat.Icon;
  const isCompleted = post.status === "completed";
  const isScheduled = post.status === "scheduled";
  const isDraft = post.status === "draft";
  const isError = !!post.error;

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", post.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(post.id);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onPostClick?.(post);
      }}
      className={`rounded-[10px] overflow-hidden border border-zinc-200 dark:border-[#282828] bg-white dark:bg-[#1c1c1c] hover:border-zinc-300 dark:hover:border-[#383838] transition-all shadow-xs group/card relative cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-50 scale-[0.98] ring-2 ring-[#612bd3] shadow-md" : ""
      } ${
        isError
          ? "ring-1 ring-red-500"
          : isCompleted
          ? "ring-1 ring-emerald-500/70"
          : ""
      }`}
    >
      {/* Published Checkmark or Error indicator dot */}
      {isCompleted && (
        <span
          className="absolute -top-1 -left-1 z-20 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-bold shadow-xs"
          title="Published"
        >
          ✓
        </span>
      )}
      {isError && (
        <span
          className="absolute -top-1 -left-1 z-20 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-bold shadow-xs"
          title={post.error}
        >
          !
        </span>
      )}

      {/* Top Banner with Platform or Custom Tag Color & Hover Quick Actions */}
      <div
        className="h-5 px-1.5 flex items-center justify-between text-white text-[10px] font-semibold transition-colors select-none"
        style={{ backgroundColor: post.tagColor || plat.bannerBg }}
      >
        <div className="flex items-center min-w-0">
          {/* Subtle 6-dot drag grip handle */}
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="currentColor"
            className="opacity-60 group-hover/card:opacity-100 shrink-0 mr-1 cursor-grab"
            title="Drag to reschedule"
          >
            <circle cx="1.5" cy="1.5" r="1" />
            <circle cx="4.5" cy="1.5" r="1" />
            <circle cx="1.5" cy="5" r="1" />
            <circle cx="4.5" cy="5" r="1" />
            <circle cx="1.5" cy="8.5" r="1" />
            <circle cx="4.5" cy="8.5" r="1" />
          </svg>
          <span className="truncate group-hover/card:hidden tracking-wider uppercase text-[9px]">
            {post.customTag ? `#${post.customTag}` : plat.name}
          </span>
        </div>

        {/* Hover Quick Actions */}
        <div className="hidden group-hover/card:flex items-center gap-1.5 text-white">
          {post.publishedUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(post.publishedUrl, "_blank");
              }}
              title="Open public link"
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              <FiExternalLink className="text-[10px]" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPostClick?.(post);
            }}
            title="Edit post"
            className="hover:scale-110 transition-transform cursor-pointer"
          >
            <FiEdit2 className="text-[10px]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicatePost?.(post);
            }}
            title="Duplicate post"
            className="hover:scale-110 transition-transform cursor-pointer"
          >
            <FiCopy className="text-[10px]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePost?.(post.id);
            }}
            title="Delete post"
            className="hover:text-red-200 hover:scale-110 transition-transform cursor-pointer"
          >
            <FiTrash2 className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* Bottom Body: Platform Avatar + Content Snippet + Time */}
      <div className="p-1.5 bg-zinc-50 dark:bg-[#201f1f] flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#242323] transition-colors">
        {/* Platform icon avatar */}
        <div className="w-4 h-4 rounded-[4px] bg-white dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
          <Icon className={`text-[10px] ${plat.color}`} />
        </div>

        {/* Snippet text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate leading-none">
            {isDraft && <span className="text-amber-500 font-bold">Draft: </span>}
            {post.title || post.description || "Untitled Post"}
          </p>
        </div>

        {/* Time */}
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
          {formatTime(post.scheduledAt)}
        </span>
      </div>
    </div>
  );
}
