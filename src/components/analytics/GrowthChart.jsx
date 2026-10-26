"use client";

import React, { useState } from "react";
import { FaYoutube, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { FiTrendingUp, FiActivity, FiLayers } from "react-icons/fi";

const PLATFORM_FILTERS = [
  { key: "all", name: "All Networks", Icon: FiLayers, color: "text-[#612bd3]" },
  { key: "youtube", name: "YouTube", Icon: FaYoutube, color: "text-red-500" },
  { key: "tiktok", name: "TikTok", Icon: SiTiktok, color: "text-cyan-400" },
  { key: "instagram", name: "Instagram", Icon: FaInstagram, color: "text-pink-500" },
  { key: "x_twitter", name: "X (Twitter)", Icon: FaXTwitter, color: "text-sky-400" },
  { key: "linkedin", name: "LinkedIn", Icon: FaLinkedin, color: "text-blue-500" },
  { key: "facebook", name: "Facebook", Icon: FaFacebook, color: "text-blue-600" },
  { key: "threads", name: "Threads", Icon: FaThreads, color: "text-purple-400" },
];

export default function GrowthChart({ series = [], loading = false }) {
  const [metricMode, setMetricMode] = useState("reach"); // "reach", "engagement", "interactions"
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const dataPoints = Array.isArray(series) ? series : [];

  // Resolve values depending on metricMode & selectedPlatform
  const getPointValue = (item) => {
    if (!item) return 0;
    if (metricMode === "engagement") {
      return Number(item.engagementRate || 0);
    }
    if (metricMode === "interactions") {
      return Number(item.interactions || 0);
    }
    // Reach / Impressions
    if (selectedPlatform === "all") {
      return Number(item.impressions || 0);
    }
    return Number(item[selectedPlatform] || 0);
  };

  const values = dataPoints.map(getPointValue);
  const allZero = values.length === 0 || values.every((v) => v === 0);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const paddingVal = allZero ? 10 : (maxVal - minVal) * 0.15 || maxVal * 0.1 || 1;
  const effectiveMin = 0;
  const effectiveMax = allZero ? (metricMode === "engagement" ? 10 : 100) : Math.ceil(maxVal + paddingVal);
  const valRange = effectiveMax - effectiveMin || 1;

  // Chart dimensions inside SVG
  const width = 800;
  const height = 260;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Calculate coordinates
  const coords = dataPoints.map((item, idx) => {
    const val = getPointValue(item);
    const x = padLeft + (idx / (dataPoints.length - 1)) * plotWidth;
    const y = padTop + plotHeight - ((val - effectiveMin) / valRange) * plotHeight;
    return { x, y, val, item };
  });

  // Construct smooth bezier curve path
  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(coords);
  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x} ${padTop + plotHeight} L ${coords[0].x} ${padTop + plotHeight} Z`
    : "";

  // Y-axis grid levels
  const yLevels = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = effectiveMin + ratio * valRange;
    const y = padTop + plotHeight - ratio * plotHeight;
    const label = metricMode === "engagement"
      ? `${val.toFixed(1)}%`
      : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : Math.round(val);
    return { y, label };
  });

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : null;

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FiTrendingUp className="text-[#612bd3] dark:text-[#a78bfa]" />
            <span>Audience Reach & Performance Velocity</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Cross-platform views, impressions, and engagement trends over time
          </p>
        </div>

        {/* Metric Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode("reach")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              metricMode === "reach"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Reach & Views
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("engagement")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              metricMode === "engagement"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Engagement Rate
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("interactions")}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              metricMode === "interactions"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Interactions
          </button>
        </div>
      </div>

      {/* Platform Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {PLATFORM_FILTERS.map((plat) => {
          const Icon = plat.Icon;
          const isSelected = selectedPlatform === plat.key;
          return (
            <button
              key={plat.key}
              type="button"
              onClick={() => setSelectedPlatform(plat.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                isSelected
                  ? "bg-[#612bd3]/10 dark:bg-[#612bd3]/20 border-[#612bd3] text-[#612bd3] dark:text-[#c4b5fd] font-bold shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
              }`}
            >
              <Icon className={`text-xs ${plat.color}`} />
              <span>{plat.name}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#612bd3" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#8c66ff" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#612bd3" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#612bd3" />
              <stop offset="50%" stopColor="#8c66ff" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-labels */}
          {yLevels.map((lvl, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={lvl.y}
                x2={width - padRight}
                y2={lvl.y}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800/80"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={lvl.y + 4}
                textAnchor="end"
                className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-mono"
              >
                {lvl.label}
              </text>
            </g>
          ))}

          {/* Area under curve */}
          {areaPath && <path d={areaPath} fill="url(#curveGradient)" />}

          {/* Smooth line curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Interaction Circles */}
          {coords.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx}>
                {/* Visual circle dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  className={`transition-all duration-150 ${
                    isHovered
                      ? "fill-white dark:fill-zinc-950 stroke-[#612bd3] stroke-[3]"
                      : "fill-[#612bd3] dark:fill-[#8c66ff] stroke-white dark:stroke-[#141414] stroke-2"
                  }`}
                />

                {/* X-axis date label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered
                      ? "fill-[#612bd3] dark:fill-[#a78bfa] font-bold"
                      : "fill-zinc-500 dark:fill-zinc-400"
                  }`}
                >
                  {pt.item.date}
                </text>

                {/* Invisible hover trigger column */}
                <rect
                  x={pt.x - plotWidth / (coords.length * 2)}
                  y={padTop}
                  width={plotWidth / coords.length}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}

          {/* Active Hover Crosshair Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + plotHeight}
              stroke="#8c66ff"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Floating Tooltip Box */}
        {activePoint && (
          <div
            className="absolute z-30 pointer-events-none bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs space-y-1.5 transition-all duration-75"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: "10%",
              transform: activePoint.x > width * 0.65 ? "translateX(-105%)" : "translateX(10%)",
            }}
          >
            <div className="font-bold text-zinc-900 dark:text-white flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-1">
              <span>{activePoint.item.fullDate || activePoint.item.date}</span>
              <span className="text-[10px] font-mono text-[#612bd3] dark:text-[#a78bfa] font-black">
                {metricMode === "engagement"
                  ? `${activePoint.val.toFixed(2)}% Eng.`
                  : `${activePoint.val.toLocaleString()} ${metricMode === "reach" ? "Views" : "Interactions"}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 pt-0.5">
              <div>
                <span className="text-zinc-400">Total Reach:</span>{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {(activePoint.item.reach || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Eng. Rate:</span>{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activePoint.item.engagementRate || 0}%
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Interactions:</span>{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {(activePoint.item.interactions || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Channel:</span>{" "}
                <span className="font-semibold text-violet-600 dark:text-violet-400 capitalize">
                  {selectedPlatform !== "all"
                    ? selectedPlatform
                    : activePoint.item.youtube > 0
                    ? "YouTube"
                    : activePoint.item.tiktok > 0
                    ? "TikTok"
                    : activePoint.item.x_twitter > 0
                    ? "X"
                    : activePoint.item.postsCount > 0
                    ? "Published"
                    : "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state overlay when all points are zero */}
        {allZero && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-white/40 dark:bg-[#141414]/40 backdrop-blur-[1px]">
            <div className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-md text-center max-w-sm">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                No activity recorded for this period
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Scheduled and published posts will plot real-time views and engagement velocity here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
