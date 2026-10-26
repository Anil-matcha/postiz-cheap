"use client";

import React, { useState } from "react";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin 
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiAward, 
  FiSearch, 
  FiArrowUp, 
  FiArrowDown, 
  FiExternalLink, 
  FiRepeat, 
  FiThumbsUp, 
  FiMessageCircle,
  FiZap
} from "react-icons/fi";

const PLATFORM_ICONS = {
  youtube: { Icon: FaYoutube, color: "text-red-500", bg: "bg-red-500/10 text-red-500 border-red-500/20", label: "YouTube" },
  tiktok: { Icon: SiTiktok, color: "text-cyan-400", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "TikTok" },
  instagram: { Icon: FaInstagram, color: "text-pink-500", bg: "bg-pink-500/10 text-pink-500 border-pink-500/20", label: "Instagram" },
  x_twitter: { Icon: FaXTwitter, color: "text-sky-400", bg: "bg-sky-500/10 text-sky-400 border-sky-500/20", label: "X" },
  facebook: { Icon: FaFacebook, color: "text-blue-600", bg: "bg-blue-600/10 text-blue-600 border-blue-600/20", label: "Facebook" },
  linkedin: { Icon: FaLinkedin, color: "text-blue-500", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "LinkedIn" },
  threads: { Icon: FaThreads, color: "text-purple-400", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Threads" },
};

export default function TopPostsTable({ posts = [], onRepurpose = null, loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("impressions"); // "impressions", "engagementRate", "likes", "comments"
  const [sortAsc, setSortAsc] = useState(false);

  // Filter and sort
  const filteredPosts = posts.filter((p) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = (p.title || "").toLowerCase().includes(term);
    const descMatch = (p.description || "").toLowerCase().includes(term);
    const platMatch = (p.platform || "").toLowerCase().includes(term);
    return titleMatch || descMatch || platMatch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    let aVal = a[sortField] ?? 0;
    let bVal = b[sortField] ?? 0;
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] shadow-xs space-y-4">
      {/* Table Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FiAward className="text-amber-500 text-base" />
            <span>Top-Performing Content Leaderboard</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ranked by engagement velocity, audience reach, and virality score
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search top posts..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-[#612bd3] dark:focus:border-zinc-700 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none font-semibold">
              <th className="py-2.5 px-3 w-12 text-center">Rank</th>
              <th className="py-2.5 px-3">Post Content</th>
              <th className="py-2.5 px-3">Channel</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                onClick={() => handleSortToggle("impressions")}
              >
                <div className="flex items-center gap-1">
                  <span>Impressions</span>
                  {sortField === "impressions" && (
                    sortAsc ? <FiArrowUp className="text-[10px]" /> : <FiArrowDown className="text-[10px]" />
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                onClick={() => handleSortToggle("engagementRate")}
              >
                <div className="flex items-center gap-1">
                  <span>Engagement</span>
                  {sortField === "engagementRate" && (
                    sortAsc ? <FiArrowUp className="text-[10px]" /> : <FiArrowDown className="text-[10px]" />
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                onClick={() => handleSortToggle("likes")}
              >
                <div className="flex items-center gap-1">
                  <span>Interactions</span>
                  {sortField === "likes" && (
                    sortAsc ? <FiArrowUp className="text-[10px]" /> : <FiArrowDown className="text-[10px]" />
                  )}
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {sortedPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <FiSearch className="text-sm" />
                    </div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      No posts found for this period
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Scheduled and published posts will appear here with live impressions, engagement rates, and platform delivery status.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedPosts.map((post, idx) => {
                const platKey = (post.platform || "youtube").toLowerCase();
                const platInfo = PLATFORM_ICONS[platKey] || PLATFORM_ICONS.youtube;
                const Icon = platInfo.Icon;

                return (
                  <tr
                    key={post.id || idx}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group"
                  >
                    {/* Rank Number */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          idx === 0
                            ? "bg-amber-400/20 text-amber-500 border border-amber-400/40 shadow-xs"
                            : idx === 1
                            ? "bg-slate-300/20 text-slate-400 border border-slate-400/40"
                            : idx === 2
                            ? "bg-amber-700/20 text-amber-700 dark:text-amber-500 border border-amber-700/30"
                            : "text-zinc-400 font-mono"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    {/* Content Thumbnail & Title */}
                    <td className="py-3 px-3 min-w-[260px] max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 relative shadow-2xs">
                          {post.mediaUrl ? (
                            <img
                              src={post.mediaUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <Icon className="text-sm opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#612bd3] dark:group-hover:text-[#a78bfa] transition-colors">
                            {post.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {post.description || "No caption provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Channel Badge */}
                    <td className="py-3 px-3 shrink-0 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${platInfo.bg}`}
                      >
                        <Icon className="text-xs" />
                        <span>{platInfo.label}</span>
                      </span>
                    </td>

                    {/* Impressions */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-zinc-900 dark:text-white">
                      {(post.impressions || 0).toLocaleString()}
                    </td>

                    {/* Engagement Rate */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <FiZap className="text-[10px]" />
                        <span>{post.engagementRate || 0}%</span>
                      </span>
                    </td>

                    {/* Likes & Comments */}
                    <td className="py-3 px-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1" title="Likes">
                          <FiThumbsUp className="text-[11px] text-zinc-400" />
                          <span>{(post.likes || 0).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <FiMessageCircle className="text-[11px] text-zinc-400" />
                          <span>{(post.comments || 0).toLocaleString()}</span>
                        </span>
                      </div>
                    </td>

                    {/* Actions: Repurpose with AI */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onRepurpose) {
                              onRepurpose(post);
                            } else {
                              window.location.href = `/?repurpose=${encodeURIComponent(post.id || "")}&title=${encodeURIComponent(post.title || "")}&desc=${encodeURIComponent(post.description || "")}`;
                            }
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#612bd3]/10 dark:bg-[#612bd3]/20 hover:bg-[#612bd3] text-[#612bd3] dark:text-[#c4b5fd] hover:text-white border border-[#612bd3]/30 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Repurpose this winning post with AI"
                        >
                          <FiRepeat className="text-xs" />
                          <span>Repurpose</span>
                        </button>

                        <a
                          href={post.publishedUrl || `https://${platKey === "x_twitter" ? "x" : platKey}.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="View on platform"
                        >
                          <FiExternalLink className="text-xs" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
