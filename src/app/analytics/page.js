"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import MetricsSummaryCards from "@/components/analytics/MetricsSummaryCards";
import GrowthChart from "@/components/analytics/GrowthChart";
import TopPostsTable from "@/components/analytics/TopPostsTable";
import CustomSelect from "@/components/ui/CustomSelect";
import PostComposerModal from "@/components/composer/PostComposerModal";
import { 
  FiBarChart2, 
  FiDownload, 
  FiPlus, 
  FiRefreshCw, 
  FiCalendar,
  FiZap 
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const DATE_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "365d", label: "Past 12 Months" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialPost, setComposerInitialPost] = useState(null);
  const [composerWithAi, setComposerWithAi] = useState(false);

  const fetchAnalytics = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        toast.error("Failed to load analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("Error connecting to analytics service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleExport = () => {
    if (!analyticsData) return;
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${range}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics report exported successfully!");
  };

  const handleRepurposePost = (post) => {
    setComposerInitialPost({
      title: `[Repurposed] ${post.title}`,
      description: post.description,
      platform: post.platform,
      mediaUrl: post.mediaUrl,
    });
    setComposerWithAi(true);
    setComposerOpen(true);
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Range Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#612bd3]/10 dark:bg-[#612bd3]/20 text-[#612bd3] dark:text-[#a78bfa] border border-[#612bd3]/20">
                <FiBarChart2 className="text-base font-bold" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                Analytics & Performance Hub
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Cross-platform engagement trends, audience reach velocity, and top-performing content
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Custom Date Range Select */}
            <div className="w-40 sm:w-44 shrink-0">
              <CustomSelect
                value={range}
                onChange={(val) => setRange(val)}
                options={DATE_RANGE_OPTIONS}
                icon={FiCalendar}
                size="sm"
              />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchAnalytics(range)}
              disabled={loading}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Refresh Analytics"
            >
              <FiRefreshCw className={`text-xs ${loading ? "animate-spin text-[#612bd3]" : ""}`} />
            </button>

            {/* Export Report */}
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
            >
              <FiDownload className="text-xs" />
              <span>Export</span>
            </button>

            {/* New Post / Composer Action */}
            <button
              type="button"
              onClick={() => {
                setComposerInitialPost(null);
                setComposerWithAi(false);
                setComposerOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-[#612bd3]/30 shrink-0"
            >
              <FiPlus className="text-xs font-bold" />
              <span>Schedule Post</span>
            </button>
          </div>
        </div>

        {/* 1. Overview KPI Summary Cards */}
        <MetricsSummaryCards kpis={analyticsData?.kpis} loading={loading} />

        {/* 2. Interactive Growth Curve Chart */}
        <GrowthChart series={analyticsData?.growthSeries} loading={loading} />

        {/* 3. Top-Performing Content Leaderboard */}
        <TopPostsTable
          posts={analyticsData?.topPosts}
          onRepurpose={handleRepurposePost}
          loading={loading}
        />
      </div>

      {/* Composer Modal for Repurposing / Scheduling from Analytics */}
      <PostComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialPost={composerInitialPost}
        initialOpenAiWriter={composerWithAi}
        onPostSaved={() => {
          fetchAnalytics(range);
          toast.success("Post saved!");
        }}
      />
    </AppShell>
  );
}
