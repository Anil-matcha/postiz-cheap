"use client";

import React from "react";
import { FiEye, FiTrendingUp, FiUsers, FiSend, FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

// Mini SVG Sparkline component
function Sparkline({ points, color = "#612bd3", isPositive = true }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const allZero = points.every((p) => p === 0);
  if (allZero) {
    return (
      <div className="shrink-0 w-20 h-7 overflow-hidden flex items-end pb-1.5 opacity-30">
        <div className="w-full h-[1.5px] border-b border-dashed border-zinc-400 dark:border-zinc-500" />
      </div>
    );
  }

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${coords.join(" L ")}`;

  return (
    <div className="shrink-0 w-20 h-7 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function MetricsSummaryCards({ kpis, loading = false }) {
  const cards = [
    {
      id: "reach",
      title: "Total Reach & Impressions",
      value: kpis?.totalReach?.formatted ?? "0",
      change: kpis?.totalReach?.change ?? "0%",
      isPositive: kpis?.totalReach?.isPositive ?? true,
      description: "Live views & impressions on published posts",
      Icon: FiEye,
      iconColor: "text-violet-600 dark:text-violet-400",
      bgGradient: "from-violet-500/10 to-indigo-500/5",
      sparkColor: "#8b5cf6",
      sparkPoints: kpis?.totalReach?.sparkPoints || [],
    },
    {
      id: "engagement",
      title: "Average Engagement Rate",
      value: kpis?.avgEngagementRate?.formatted ?? "0%",
      change: kpis?.avgEngagementRate?.change ?? "0%",
      isPositive: kpis?.avgEngagementRate?.isPositive ?? true,
      description: "Interactions, shares & comments per view",
      Icon: FiTrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      sparkColor: "#10b981",
      sparkPoints: kpis?.avgEngagementRate?.sparkPoints || [],
    },
    {
      id: "audience",
      title: "Connected Channels & Audience",
      value: kpis?.totalFollowers?.formatted ?? "0 Channels",
      change: kpis?.totalFollowers?.change ?? "0%",
      isPositive: kpis?.totalFollowers?.isPositive ?? true,
      description: "Active channels receiving scheduled broadcasts",
      Icon: FiUsers,
      iconColor: "text-sky-600 dark:text-sky-400",
      bgGradient: "from-sky-500/10 to-blue-500/5",
      sparkColor: "#0284c7",
      sparkPoints: kpis?.totalFollowers?.sparkPoints || [],
    },
    {
      id: "published",
      title: "Published Post Deliveries",
      value: kpis?.publishedPosts?.formatted ?? "0",
      change: kpis?.publishedPosts?.change ?? "0%",
      isPositive: kpis?.publishedPosts?.isPositive ?? true,
      description: "Posts dispatched across social channels",
      Icon: FiSend,
      iconColor: "text-pink-600 dark:text-pink-400",
      bgGradient: "from-pink-500/10 to-rose-500/5",
      sparkColor: "#ec4899",
      sparkPoints: kpis?.publishedPosts?.sparkPoints || [],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.Icon;
        return (
          <div
            key={card.id}
            className="relative p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs group overflow-hidden"
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide truncate">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${card.bgGradient} border border-zinc-200/60 dark:border-zinc-800`}
              >
                <Icon className={`text-sm ${card.iconColor}`} />
              </div>
            </div>

            {/* Middle row: Big Value & Sparkline */}
            <div className="flex items-baseline justify-between gap-2 my-1">
              {loading ? (
                <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
              )}

              <Sparkline points={card.sparkPoints} color={card.sparkColor} isPositive={card.isPositive} />
            </div>

            {/* Bottom row: Trend badge & context */}
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  card.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                }`}
              >
                {card.isPositive ? <FiArrowUpRight className="text-xs" /> : <FiArrowDownRight className="text-xs" />}
                <span>{card.change}</span>
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                vs previous period
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
