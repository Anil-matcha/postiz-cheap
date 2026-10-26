"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook,
  FaLinkedin, 
  FaPinterest, 
  FaChevronDown, 
  FaChevronUp,
  FaCheck,
  FaMagic,
  FaPlus
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiX, 
  FiCalendar, 
  FiClock, 
  FiUploadCloud, 
  FiTrash2, 
  FiSend, 
  FiLink,
  FiCheckCircle,
  FiInfo,
  FiPlus,
  FiExternalLink,
  FiRefreshCw,
  FiTag
} from "react-icons/fi";
import LiveDevicePreview from "./LiveDevicePreview";
import AiPostWriter from "./AiPostWriter";

const TAG_COLOR_PALETTE = [
  "#612bd3", // Studio Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#8b5cf6", // Violet
];

const PLATFORMS = [
  { key: "youtube", name: "YouTube", Icon: FaYoutube, color: "text-red-500", activeStyle: "bg-red-500/15 border-red-500/60 text-white shadow-sm shadow-red-500/20", limit: 5000 },
  { key: "tiktok", name: "TikTok", Icon: SiTiktok, color: "text-cyan-400", activeStyle: "bg-cyan-500/15 border-cyan-400/60 text-white shadow-sm shadow-cyan-500/20", limit: 2200 },
  { key: "instagram", name: "Instagram", Icon: FaInstagram, color: "text-pink-500", activeStyle: "bg-pink-500/15 border-pink-500/60 text-white shadow-sm shadow-pink-500/20", limit: 2200 },
  { key: "x_twitter", name: "X (Twitter)", Icon: FaXTwitter, color: "text-sky-400", activeStyle: "bg-sky-500/15 border-sky-400/60 text-white shadow-sm shadow-sky-500/20", limit: 280 },
  { key: "facebook", name: "Facebook", Icon: FaFacebook, color: "text-blue-600", activeStyle: "bg-blue-600/15 border-blue-600/60 text-white shadow-sm shadow-blue-600/20", limit: 63206 },
  { key: "linkedin", name: "LinkedIn", Icon: FaLinkedin, color: "text-blue-500", activeStyle: "bg-blue-500/15 border-blue-500/60 text-white shadow-sm shadow-blue-500/20", limit: 3000 },
  { key: "threads", name: "Threads", Icon: FaThreads, color: "text-purple-400", activeStyle: "bg-purple-500/15 border-purple-400/60 text-white shadow-sm shadow-purple-500/20", limit: 500 },
  { key: "pinterest", name: "Pinterest", Icon: FaPinterest, color: "text-rose-500", activeStyle: "bg-rose-500/15 border-rose-500/60 text-white shadow-sm shadow-rose-500/20", limit: 500 },
];

const getPlatformKey = (acc) => {
  if (!acc) return "";
  const pName = (acc.platform_name || "").toLowerCase();
  if (pName === "x" || pName === "twitter") return "x_twitter";
  if (pName === "youtube") return "youtube";
  if (pName === "tiktok") return "tiktok";
  if (pName === "instagram") return "instagram";
  if (pName === "facebook") return "facebook";
  if (pName === "linkedin") return "linkedin";
  if (pName === "threads") return "threads";
  if (pName === "pinterest") return "pinterest";
  if (acc.platform === 1) return "youtube";
  if (acc.platform === 2) return "tiktok";
  if (acc.platform === 3) return "instagram";
  if (acc.platform === 4) return "x_twitter";
  if (acc.platform === 5) return "facebook";
  if (acc.platform === 6) return "linkedin";
  if (acc.platform === 7) return "threads";
  if (acc.platform === 8) return "pinterest";
  return pName;
};

const YOUTUBE_CATEGORIES = [
  { label: "People & Blogs", value: "22" },
  { label: "Film & Animation", value: "1" },
  { label: "Autos & Vehicles", value: "2" },
  { label: "Music", value: "10" },
  { label: "Gaming", value: "20" },
  { label: "Comedy", value: "23" },
  { label: "Entertainment", value: "24" },
  { label: "Education", value: "27" },
  { label: "Science & Technology", value: "28" },
];

const POPULAR_HASHTAGS = ["#trending", "#ai", "#tech", "#innovation", "#growth", "#viral", "#creators"];

export default function PostComposerModal({
  isOpen,
  onClose,
  initialDate = null,
  initialPost = null,
  initialOpenAiWriter = false,
  onPostSaved,
}) {
  const [selectedPlatforms, setSelectedPlatforms] = useState(["youtube"]);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState("youtube");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [platformAccountMap, setPlatformAccountMap] = useState({});
  const [accountName, setAccountName] = useState("Creator Studio");
  const [accountId, setAccountId] = useState("101");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [tagColor, setTagColor] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [isCreatingCustomTag, setIsCreatingCustomTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#612bd3");
  const [mediaUrl, setMediaUrl] = useState("");
  const [privacy, setPrivacy] = useState("public");

  // Fetch available tags
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableTags(data);
      })
      .catch(() => {});
  }, []);

  const handleCreateTag = async () => {
    const cleanName = newTagName.trim().replace(/^#+/, "");
    if (!cleanName) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, color: newTagColor }),
      });
      if (res.ok) {
        const created = await res.json();
        setAvailableTags((prev) => {
          const exists = prev.find((t) => t.name.toLowerCase() === created.name.toLowerCase());
          if (exists) return prev.map((t) => (t.id === exists.id ? created : t));
          return [...prev, created];
        });
        setCustomTag(created.name);
        setTagColor(created.color);
        setNewTagName("");
        setIsCreatingCustomTag(false);
      }
    } catch (e) {
      console.error("Failed to create tag:", e);
    }
  };

  const handleDeleteTag = async (e, tagId) => {
    e.stopPropagation();
    try {
      await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
      setAvailableTags((prev) => prev.filter((t) => t.id !== tagId));
      const deleted = availableTags.find((t) => t.id === tagId);
      if (deleted && customTag === deleted.name) {
        setCustomTag("");
        setTagColor("");
      }
    } catch (_) {}
  };

  // Add Channel Modal states
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [accountNameInput, setAccountNameInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  const togglePlatform = (key) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // keep at least 1 selected
        const updated = prev.filter((k) => k !== key);
        if (activePreviewPlatform === key) {
          setActivePreviewPlatform(updated[0]);
        }
        return updated;
      } else {
        setActivePreviewPlatform(key);
        return [...prev, key];
      }
    });
  };

  const selectAllPlatforms = () => {
    const connectedKeys = Array.from(new Set(connectedAccounts.map(getPlatformKey))).filter((k) =>
      PLATFORMS.some((p) => p.key === k)
    );
    if (connectedKeys.length > 0) {
      setSelectedPlatforms(connectedKeys);
    } else {
      setSelectedPlatforms(PLATFORMS.map((p) => p.key));
    }
  };

  const selectSinglePlatform = (key) => {
    setSelectedPlatforms([key]);
    setActivePreviewPlatform(key);
  };

  // YouTube options
  const [categoryId, setCategoryId] = useState("22");
  const [madeForKids, setMadeForKids] = useState(false);

  // TikTok options
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);

  // Instagram / Facebook / Threads options
  const [placement, setPlacement] = useState("reels");
  const [shareToFeed, setShareToFeed] = useState(true);

  // Pinterest options
  const [destinationLink, setDestinationLink] = useState("");
  const [boardId, setBoardId] = useState("");

  // X (Twitter) options
  const [replySettings, setReplySettings] = useState("everyone");

  // Scheduling
  const [isScheduled, setIsScheduled] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");

  // UI state
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiWriterOpen, setAiWriterOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialOpenAiWriter) {
      setAiWriterOpen(true);
    }
  }, [initialOpenAiWriter, isOpen]);

  useEffect(() => {
    if (initialPost) {
      const initPlat = initialPost.platform || "youtube";
      setSelectedPlatforms([initPlat]);
      setActivePreviewPlatform(initPlat);
      setTitle(initialPost.title || "");
      setDescription(initialPost.description || "");
      setTags(initialPost.tags || "");
      setCustomTag(initialPost.customTag || "");
      setTagColor(initialPost.tagColor || "");
      setMediaUrl(initialPost.mediaUrl || "");
      setPrivacy(initialPost.privacy || "public");
      setAccountName(initialPost.accountName || "Creator Studio");
      if (initialPost.scheduledAt) {
        const d = new Date(initialPost.scheduledAt);
        setScheduledDate(d.toISOString().split("T")[0]);
        setScheduledTime(d.toTimeString().slice(0, 5));
        setIsScheduled(true);
      }
    } else if (initialDate) {
      setCustomTag("");
      setTagColor("");
      const d = new Date(initialDate);
      setScheduledDate(d.toISOString().split("T")[0]);
      setScheduledTime("14:00");
      setIsScheduled(true);
    } else {
      setCustomTag("");
      setTagColor("");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split("T")[0]);
      setScheduledTime("12:00");
      setIsScheduled(false); // Default to Post Now for new posts
    }
  }, [initialDate, initialPost, isOpen]);

  // Fetch user's real connected accounts from backend
  const fetchAccounts = () => {
    fetch("/api/social/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConnectedAccounts(data);
          const accMap = {};
          data.forEach((acc) => {
            const key = getPlatformKey(acc);
            if (!accMap[key]) {
              accMap[key] = acc.id;
            }
          });
          setPlatformAccountMap((prev) => ({ ...accMap, ...prev }));

          // Automatically select connected channels if current selection is invalid or new post
          if (!initialPost) {
            const connectedKeys = Array.from(new Set(data.map(getPlatformKey))).filter((k) =>
              PLATFORMS.some((p) => p.key === k)
            );
            if (connectedKeys.length > 0) {
              setSelectedPlatforms((prev) => {
                const valid = prev.filter((k) => connectedKeys.includes(k));
                return valid.length > 0 ? valid : [connectedKeys[0]];
              });
              setActivePreviewPlatform((prev) => (connectedKeys.includes(prev) ? prev : connectedKeys[0]));
            }
          }
        }
      })
      .catch((err) => console.error("Failed to fetch accounts in composer:", err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, initialPost]);

  // Synchronize accountId and accountName for the currently active preview platform
  useEffect(() => {
    const platAccounts = connectedAccounts.filter((a) => {
      const normKey = getPlatformKey(a);
      return normKey === activePreviewPlatform || a.platform === activePreviewPlatform;
    });

    if (platAccounts.length > 0) {
      const selectedId = platformAccountMap[activePreviewPlatform] || platAccounts[0].id;
      const matched = platAccounts.find((a) => a.id === selectedId) || platAccounts[0];
      setAccountId(String(matched.id));
      setAccountName(matched.account_name);
    } else {
      setAccountId("101");
      setAccountName("Creator Studio");
    }
  }, [activePreviewPlatform, connectedAccounts, platformAccountMap]);

  // Connected vs Unconnected platforms
  const connectedPlatformKeys = new Set(connectedAccounts.map(getPlatformKey));
  const connectedPlatforms = PLATFORMS.filter((p) => connectedPlatformKeys.has(p.key));
  const unconnectedPlatforms = PLATFORMS.filter((p) => !connectedPlatformKeys.has(p.key));

  const handleInitiateConnect = (plat) => {
    setConnectingPlatform(plat);
    setAccountNameInput("");
    setConnectError("");
  };

  const handleConfirmConnect = async () => {
    if (!connectingPlatform) return;
    setIsConnecting(true);
    setConnectError("");

    const label = accountNameInput.trim();
    if (connectingPlatform.key === "youtube" && label) {
      localStorage.setItem("pending_youtube_label", label);
    }

    try {
      const res = await fetch("/api/social/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: connectingPlatform.key,
          accountName: label,
          redirectUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setConnectError(data.error || "Failed to initiate connection. Please try again.");
      }
    } catch (err) {
      setConnectError(err.message || "Failed to connect to platform.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApplyAiContent = ({ title: newTitle, description: newDescription, tags: newTags }) => {
    if (newTitle) setTitle(newTitle);
    if (newDescription) setDescription(newDescription);
    if (newTags) setTags(newTags);
    setAiWriterOpen(false);
  };

  if (!isOpen) return null;

  const currentPlatformInfo = PLATFORMS.find(p => p.key === activePreviewPlatform) || PLATFORMS[0];
  const charLimit = currentPlatformInfo.limit;
  const currentChars = (description || "").length;

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Fallback to object URL or demo preview if upload API fails
        const localUrl = URL.createObjectURL(file);
        setMediaUrl(localUrl);
      } else {
        const data = await res.json();
        setMediaUrl(data.url || URL.createObjectURL(file));
      }
    } catch (err) {
      console.warn("Upload fallback used:", err);
      setMediaUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const addHashtag = (tag) => {
    if (!description.includes(tag)) {
      setDescription(prev => prev ? `${prev} ${tag}` : tag);
    }
  };

  const handleSubmit = async (statusOverride = null, forceImmediate = false) => {
    if (!mediaUrl) {
      setErrorMsg("Please upload or provide a media URL for your post.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      let combinedScheduledAt = null;
      const willSchedule = forceImmediate ? false : (statusOverride === "draft" ? false : isScheduled);
      if (willSchedule && scheduledDate && scheduledTime) {
        combinedScheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }

      const payload = {
        platforms: selectedPlatforms,
        platform: activePreviewPlatform,
        accountId: parseInt(accountId) || 101,
        accountName,
        platformAccountMap,
        title,
        description,
        tags,
        customTag: customTag || null,
        tagColor: tagColor || null,
        mediaUrl,
        privacy,
        scheduledAt: statusOverride === "draft" ? null : combinedScheduledAt,
        disableComment,
        disableDuet,
        disableStitch,
        categoryId,
        madeForKids,
        placement,
        shareToFeed,
        destinationLink,
        boardId,
        replySettings,
      };

      const url = initialPost?.id ? `/api/posts/${initialPost.id}` : "/api/posts";
      const method = initialPost?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to schedule post.");
      }

      const savedPost = await res.json();
      if (onPostSaved) onPostSaved(savedPost);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-hidden">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-slate-900 dark:text-white transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#612bd3] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[#612bd3]/30">
              P
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide uppercase">
                {initialPost ? "EDIT SCHEDULED POST" : "COMPOSE & SCHEDULE POST"}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Multi-channel scheduling with real-time feed preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAiWriterOpen(!aiWriterOpen)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                aiWriterOpen
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400/40 shadow-md shadow-violet-500/30"
                  : "bg-gradient-to-r from-violet-600/15 to-indigo-600/15 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:border-violet-500/60 hover:text-[#612bd3] dark:hover:text-white"
              }`}
            >
              <FaMagic className="text-[10px] text-amber-500 dark:text-amber-300" />
              <span>Write with AI</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>

        {/* Modal Main Content - 2 Column Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800 bg-[#f8f9fa] dark:bg-zinc-950">
          {/* LEFT COLUMN: Composer Form (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4 overflow-y-auto overflow-x-hidden max-h-[calc(88vh-110px)]">
            {/* AI Post Writer Assistant (Collapsible) */}
            {aiWriterOpen && (
              <AiPostWriter
                platform={activePreviewPlatform}
                onApply={handleApplyAiContent}
                onClose={() => setAiWriterOpen(false)}
              />
            )}

            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-400 flex items-center gap-2">
                <FiInfo className="text-sm shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Channel Selector with Multi-Select (Connected Channels Only) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 tracking-wider uppercase block">
                    1. SELECT PUBLISHING CHANNELS
                  </label>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {selectedPlatforms.length} {selectedPlatforms.length === 1 ? "channel" : "channels"} selected
                  </span>
                </div>
                {connectedPlatforms.length > 1 && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllPlatforms}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-zinc-400 dark:text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => selectSinglePlatform(activePreviewPlatform)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium transition-colors cursor-pointer"
                    >
                      Only Current
                    </button>
                  </div>
                )}
              </div>

              {connectedPlatforms.length === 0 ? (
                /* Empty state when no channels are connected */
                <div className="p-4 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
                  <div>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">No social channels connected yet</p>
                    <p className="text-[11px] text-zinc-500">Connect your accounts to start scheduling and publishing posts.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddChannelModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 shrink-0 cursor-pointer"
                  >
                    <FiPlus className="text-xs font-bold" />
                    <span>Add Channel</span>
                  </button>
                </div>
              ) : (
                /* Connected channels grid with + Add Channel button */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {connectedPlatforms.map((plat) => {
                    const Icon = plat.Icon;
                    const isSelected = selectedPlatforms.includes(plat.key);
                    const isCurrent = activePreviewPlatform === plat.key;

                    // Match connected account details for label
                    const matchingAccounts = connectedAccounts.filter(a => getPlatformKey(a) === plat.key);
                    const accountLabel = matchingAccounts.length > 0 ? matchingAccounts[0].account_name : plat.name;

                    return (
                      <div
                        key={plat.key}
                        onClick={() => togglePlatform(plat.key)}
                        className={`relative p-2.5 rounded-md border flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                          isSelected
                            ? `${plat.activeStyle} ${isCurrent ? "ring-2 ring-[#612bd3] dark:ring-white/30" : ""}`
                            : "border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isSelected ? "bg-white/10" : "bg-zinc-100 dark:bg-zinc-800/80"}`}>
                              <Icon className={`text-xs ${isSelected ? "text-current" : plat.color}`} />
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-zinc-950" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] truncate font-bold text-zinc-900 dark:text-zinc-100">
                              {plat.name}
                            </div>
                            <div className="text-[10px] truncate text-zinc-500 dark:text-zinc-400">
                              {accountLabel}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center shrink-0">
                          {isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* + Add Channel Button (Reference App Style) */}
                  <button
                    type="button"
                    onClick={() => setAddChannelModalOpen(true)}
                    className="p-2.5 rounded-md border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer group min-h-[50px] shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors">
                      <FiPlus className="text-xs font-bold" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide">
                      Add Channel
                    </span>
                  </button>
                </div>
              )}

              <p className="text-[10px] text-zinc-500">
                Click any connected channel to toggle. Multiple selected channels will be published in a single click.
              </p>
            </div>

            {/* Connected Account Display & Selector */}
            {(() => {
              const activePlatAccounts = connectedAccounts.filter((a) => {
                const pName = (a.platform_name || "").toLowerCase();
                const normKey = pName === "x" || pName === "twitter" ? "x_twitter" : pName;
                return normKey === activePreviewPlatform || a.platform === activePreviewPlatform;
              });

              return (
                <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-medium shrink-0">Posting to {currentPlatformInfo.name} as:</span>
                    {activePlatAccounts.length > 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 animate-pulse" />
                        <span className="truncate">{accountName}</span>
                      </div>
                    ) : (
                      <span className="text-amber-500 dark:text-amber-400/90 text-[11px] font-medium flex items-center gap-1 truncate">
                        ⚠️ No account connected in Integrations
                      </span>
                    )}
                  </div>

                  {activePlatAccounts.length > 1 && (
                    <select
                      value={accountId}
                      onChange={(e) => {
                        const sel = activePlatAccounts.find((a) => String(a.id) === e.target.value);
                        if (sel) {
                          setAccountId(String(sel.id));
                          setAccountName(sel.account_name);
                          setPlatformAccountMap((prev) => ({ ...prev, [activePreviewPlatform]: sel.id }));
                        }
                      }}
                      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-800 dark:text-zinc-200 outline-none shrink-0"
                    >
                      {activePlatAccounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.account_name}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })()}

            {/* 2. Post Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 tracking-wider uppercase block">
                2. POST TITLE / HEADLINE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a strong, clickable title..."
                className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-600 transition-colors shadow-2xs"
              />
            </div>

            {/* 3. Caption & Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 tracking-wider uppercase">
                    3. CAPTION & DETAILS
                  </label>
                  {!aiWriterOpen && (
                    <button
                      type="button"
                      onClick={() => setAiWriterOpen(true)}
                      className="text-[11px] text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Write post with AI"
                    >
                      <FaMagic className="text-[9px] text-amber-500 dark:text-amber-300" />
                      <span>Write with AI</span>
                    </button>
                  )}
                </div>
                <span className={`text-[11px] font-mono ${currentChars > charLimit ? "text-red-500 font-semibold" : "text-zinc-500 dark:text-zinc-400"}`}>
                  {currentChars} / {charLimit}
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Write your caption, hook, call to action, and hashtags..."
                className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-600 transition-colors resize-none leading-relaxed shadow-2xs"
              />

              {/* Hashtag Quick Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1 mr-1 font-medium">
                  <FaMagic className="text-violet-500 dark:text-violet-400 text-[10px]" /> Quick Tags:
                </span>
                {POPULAR_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addHashtag(tag)}
                    className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900/80 hover:bg-violet-50 dark:hover:bg-indigo-500/10 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-indigo-500/40 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-violet-700 dark:hover:text-indigo-300 transition-all cursor-pointer font-mono shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Custom Tag & Category Color Banner */}
            <div className="space-y-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
                  <FiTag className="text-[#612bd3] dark:text-[#fc69ff]" />
                  <span>4. CUSTOM TAG & COLOR BANNER</span>
                </label>
                {customTag && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTag("");
                      setTagColor("");
                    }}
                    className="text-[10px] text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear Tag
                  </button>
                )}
              </div>

              {/* Tag Selection Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Default platform color pill */}
                <button
                  type="button"
                  onClick={() => {
                    setCustomTag("");
                    setTagColor("");
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                    !customTag
                      ? "bg-[#612bd3] text-white border-[#612bd3] shadow-xs font-bold"
                      : "bg-zinc-100 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  Default (Platform Color)
                </button>

                {/* Available Tags */}
                {availableTags.map((t) => {
                  const isSelected = customTag?.toLowerCase() === t.name.toLowerCase();
                  return (
                    <div
                      key={t.id || t.name}
                      onClick={() => {
                        setCustomTag(t.name);
                        setTagColor(t.color);
                      }}
                      className={`group/tag px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? "text-white font-bold ring-2 shadow-sm"
                          : "bg-zinc-100 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                      style={{
                        backgroundColor: isSelected ? t.color : undefined,
                        borderColor: isSelected ? t.color : undefined,
                        boxShadow: isSelected ? `0 0 10px ${t.color}40` : undefined,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>#{t.name}</span>
                      {t.userId && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTag(e, t.id)}
                          className="opacity-0 group-hover/tag:opacity-100 hover:text-red-300 text-zinc-400 transition-opacity ml-0.5"
                          title="Delete tag"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Add Custom Tag Button */}
                {!isCreatingCustomTag && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustomTag(true)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#612bd3] dark:text-[#8c66ff] hover:text-white bg-[#612bd3]/10 hover:bg-[#612bd3] border border-[#612bd3]/30 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <FaPlus className="text-[9px]" />
                    <span>New Tag</span>
                  </button>
                )}
              </div>

              {/* Inline Tag Creator Form */}
              {isCreatingCustomTag && (
                <div className="mt-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Create Custom Tag</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomTag(false)}
                      className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag name (e.g. Launch, Promo, Meme)..."
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#612bd3]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                        title="Pick custom color"
                      />
                      <button
                        type="button"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                        className="px-3 py-1.5 rounded-md bg-[#612bd3] hover:bg-[#7237e8] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 mr-1">Palette:</span>
                    {TAG_COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewTagColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                          newTagColor === c ? "scale-110 border-white ring-2 ring-violet-500" : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Media Attachment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 tracking-wider uppercase block">
                5. MEDIA ATTACHMENT (VIDEO / IMAGE)
              </label>

              {mediaUrl ? (
                <div className="relative rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black aspect-video max-h-44 group shadow-2xs">
                  <img
                    src={mediaUrl}
                    alt="Media preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMediaUrl("")}
                      className="px-3 py-1.5 rounded-md bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-md p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                      <FiUploadCloud className="text-base" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-300">
                        {uploading ? "Uploading..." : "Click or drag & drop video/image"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        MP4, MOV, JPG, PNG up to 100MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs" />
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="Or paste media URL directly (https://...)"
                      className="w-full bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-600 transition-colors shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Platform Specific Settings Accordion */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-white dark:bg-zinc-900/20 shadow-2xs">
              <button
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <span>Settings for {currentPlatformInfo.name}</span>
                {advancedOpen ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
              </button>

              {advancedOpen && (
                <div className="p-3.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  {selectedPlatforms.length > 1 && (
                    <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-200 dark:border-zinc-800/80 overflow-x-auto">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold mr-1 shrink-0">Configure:</span>
                      {selectedPlatforms.map((pKey) => {
                        const plat = PLATFORMS.find(p => p.key === pKey);
                        const isCurrent = activePreviewPlatform === pKey;
                        const Icon = plat?.Icon;
                        return (
                          <button
                            key={pKey}
                            type="button"
                            onClick={() => setActivePreviewPlatform(pKey)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
                              isCurrent
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold border border-zinc-300 dark:border-zinc-700"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/60"
                            }`}
                          >
                            {Icon && <Icon className={`text-[9px] ${plat.color}`} />}
                            <span>{plat?.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activePreviewPlatform === "youtube" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Category
                        </label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        >
                          {YOUTUBE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Privacy
                        </label>
                        <select
                          value={privacy}
                          onChange={(e) => setPrivacy(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        >
                          <option value="public">Public</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="kids"
                          checked={madeForKids}
                          onChange={(e) => setMadeForKids(e.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#612bd3] focus:ring-0"
                        />
                        <label htmlFor="kids" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                          Made for Kids (COPPA compliant)
                        </label>
                      </div>
                    </div>
                  )}

                  {activePreviewPlatform === "tiktok" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                        <span>Disable Comments</span>
                        <input
                          type="checkbox"
                          checked={disableComment}
                          onChange={(e) => setDisableComment(e.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#612bd3]"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                        <span>Disable Duet</span>
                        <input
                          type="checkbox"
                          checked={disableDuet}
                          onChange={(e) => setDisableDuet(e.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#612bd3]"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                        <span>Disable Stitch</span>
                        <input
                          type="checkbox"
                          checked={disableStitch}
                          onChange={(e) => setDisableStitch(e.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#612bd3]"
                        />
                      </div>
                    </div>
                  )}

                  {activePreviewPlatform === "instagram" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Placement
                        </label>
                        <select
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        >
                          <option value="reels">Reels</option>
                          <option value="feed">Feed Post</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                        <span>Share Reels to Main Feed</span>
                        <input
                          type="checkbox"
                          checked={shareToFeed}
                          onChange={(e) => setShareToFeed(e.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-pink-500"
                        />
                      </div>
                    </div>
                  )}

                  {activePreviewPlatform === "facebook" && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Placement
                        </label>
                        <select
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        >
                          <option value="timeline">Timeline Post</option>
                          <option value="reels">Facebook Reels</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activePreviewPlatform === "x_twitter" && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Who can reply
                        </label>
                        <select
                          value={replySettings}
                          onChange={(e) => setReplySettings(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="following">Accounts you follow</option>
                          <option value="mentionedUsers">Only accounts you mention</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activePreviewPlatform === "pinterest" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Destination Link
                        </label>
                        <input
                          type="url"
                          value={destinationLink}
                          onChange={(e) => setDestinationLink(e.target.value)}
                          placeholder="https://yourwebsite.com/pin-link"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 block mb-1">
                          Board ID / Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={boardId}
                          onChange={(e) => setBoardId(e.target.value)}
                          placeholder="Default Board or ID"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  {(activePreviewPlatform === "linkedin" || activePreviewPlatform === "threads") && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Standard optimization and formatting will be automatically applied for {currentPlatformInfo.name}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 6. Scheduling Controls */}
            <div className="p-3.5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="text-zinc-500 dark:text-zinc-400 text-xs" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 tracking-wider uppercase">
                    6. SCHEDULE & PUBLISH OPTIONS
                  </span>
                </div>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsScheduled(false)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      !isScheduled ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    Post Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(true)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      isScheduled ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {isScheduled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-600 shadow-2xs"
                    />
                  </div>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs" />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-600 shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Live Feed Mockup (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-950/40 border-l border-zinc-200 dark:border-zinc-800/80 flex flex-col overflow-y-auto overflow-x-hidden max-h-[calc(88vh-110px)]">
            <LiveDevicePreview
              platform={activePreviewPlatform}
              selectedPlatforms={selectedPlatforms}
              onSelectPlatform={(plat) => setActivePreviewPlatform(plat)}
              title={title}
              description={description}
              tags={tags}
              customTag={customTag}
              tagColor={tagColor}
              mediaUrl={mediaUrl}
              accountName={accountName}
            />
          </div>
        </div>

        {/* Modal Bottom Bar / Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("draft")}
              className="px-3.5 py-1.5 rounded-md text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
            >
              Save as Draft
            </button>

            {isScheduled ? (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(null, true)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <FiSend className="text-xs text-blue-500" />
                  <span>Publish Now Instead</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit()}
                  className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-blue-600/30 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <FiCalendar className="text-xs" />
                      <span>
                        {selectedPlatforms.length > 1
                          ? `Schedule to ${selectedPlatforms.length} Channels`
                          : "Schedule Post"}
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit()}
                className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-blue-600/30 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      Publishing to {selectedPlatforms.length} {selectedPlatforms.length === 1 ? "channel" : "channels"}...
                    </span>
                  </>
                ) : (
                  <>
                    <FiSend className="text-xs" />
                    <span>
                      {selectedPlatforms.length > 1
                        ? `Publish to ${selectedPlatforms.length} Channels Now`
                        : "Publish Now"}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Channel Modal (Reference App UX & Styling) */}
      {addChannelModalOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setAddChannelModalOpen(false);
            setConnectingPlatform(null);
            setConnectError("");
          }}
        >
          <div 
            className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <span>ADD SOCIAL CHANNEL</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    OAuth 2.0
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Connect and authorize platforms to schedule and publish posts
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddChannelModalOpen(false);
                  setConnectingPlatform(null);
                  setConnectError("");
                }}
                className="w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {connectError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <FiInfo className="text-sm shrink-0" />
                  <span>{connectError}</span>
                </div>
              )}

              {connectingPlatform ? (
                /* Connecting Platform Dialog */
                <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shadow-inner">
                      {(() => {
                        const Icon = connectingPlatform.Icon;
                        return <Icon className={`text-xl ${connectingPlatform.color}`} />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Connect {connectingPlatform.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        You will be redirected to authorize access.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                      Account Label / Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={accountNameInput}
                      onChange={(e) => setAccountNameInput(e.target.value)}
                      placeholder={`e.g. My ${connectingPlatform.name} Account`}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Helps identify this account in your workspace dashboard.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setConnectingPlatform(null)}
                      disabled={isConnecting}
                      className="px-3.5 py-1.5 rounded-md border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmConnect}
                      disabled={isConnecting}
                      className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Authorize & Connect</span>
                          <FiExternalLink className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Unconnected Platforms Grid */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Available Channels to Connect
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {unconnectedPlatforms.length} available
                      </span>
                    </div>

                    {unconnectedPlatforms.length === 0 ? (
                      <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400">
                        All supported channels are currently connected!
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {unconnectedPlatforms.map((plat) => {
                          const Icon = plat.Icon;
                          return (
                            <div
                              key={plat.key}
                              onClick={() => handleInitiateConnect(plat)}
                              className="p-3.5 rounded-lg border border-zinc-800/90 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 group shadow-sm"
                            >
                              <div className="w-11 h-11 rounded-full bg-zinc-800/80 group-hover:bg-zinc-800 flex items-center justify-center transition-colors">
                                <Icon className={`text-xl ${plat.color} group-hover:scale-110 transition-transform`} />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-zinc-200 group-hover:text-white">
                                  {plat.name}
                                </div>
                                <span className="text-[10px] text-blue-400 group-hover:text-blue-300 font-medium inline-flex items-center gap-0.5 mt-0.5">
                                  + Connect
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Already Connected Platforms */}
                  {connectedPlatforms.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-zinc-800/80">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Already Connected Channels
                      </span>
                      <div className="space-y-2">
                        {connectedAccounts.map((acc) => {
                          const platKey = getPlatformKey(acc);
                          const platInfo = PLATFORMS.find((p) => p.key === platKey) || { name: acc.platform_name || platKey, Icon: FaCheck, color: "text-zinc-400" };
                          const Icon = platInfo.Icon;

                          return (
                            <div
                              key={acc.id}
                              className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                  <Icon className={`text-xs ${platInfo.color}`} />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-zinc-200 block truncate">
                                    {acc.account_name || `${platInfo.name} Account`}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 block">
                                    {platInfo.name}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Connected
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleInitiateConnect(platInfo)}
                                  className="text-[10px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                                >
                                  + Add another
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
              <span>Need to manage existing accounts?</span>
              <a
                href="/integrations"
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                <span>Open Integrations Manager</span>
                <FiExternalLink className="text-[10px]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
