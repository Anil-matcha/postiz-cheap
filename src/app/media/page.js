"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import MediaGrid from "@/components/media/MediaGrid";
import MediaUploaderModal from "@/components/media/MediaUploaderModal";
import ImageCropperModal from "@/components/media/ImageCropperModal";
import PostComposerModal from "@/components/composer/PostComposerModal";
import CustomSelect from "@/components/ui/CustomSelect";
import { 
  FiImage, 
  FiFilm, 
  FiFolder, 
  FiUploadCloud, 
  FiSearch, 
  FiPlus, 
  FiRefreshCw, 
  FiLayers, 
  FiCheck,
  FiFilter,
  FiHardDrive
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "size_desc", label: "Size (Largest)" },
];

export default function MediaPage() {
  const [assets, setAssets] = useState([]);
  const [folders, setFolders] = useState([
    { name: "All Media", count: 0 },
    { name: "Post Uploads", count: 0 },
    { name: "Thumbnails", count: 0 },
    { name: "Reels & Shorts", count: 0 },
    { name: "Campaigns", count: 0 },
    { name: "Brand Assets", count: 0 },
  ]);
  const [activeFolder, setActiveFolder] = useState("All Media");
  const [activeType, setActiveType] = useState("all"); // "all" | "image" | "video"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperTargetAsset, setCropperTargetAsset] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialPost, setComposerInitialPost] = useState(null);

  // New folder inline creation
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFolder && activeFolder !== "All Media") params.set("folder", activeFolder);
      if (activeType && activeType !== "all") params.set("type", activeType);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/media?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        if (data.folders && Array.isArray(data.folders)) {
          setFolders(data.folders);
        }
      } else {
        toast.error("Failed to load media assets");
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      toast.error("Could not connect to media service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeFolder, activeType, searchQuery]);

  // Sort assets client-side
  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "size_desc") return (b.size || 0) - (a.size || 0);
    return 0;
  });

  // Calculate overview metrics
  const totalAssetsCount = folders.find((f) => f.name === "All Media")?.count || assets.length;
  const imageCount = assets.filter((a) => a.type === "image").length;
  const videoCount = assets.filter((a) => a.type === "video").length;

  // Insert asset into Composer
  const handleInsertIntoPost = (asset) => {
    setComposerInitialPost({
      title: asset.name ? asset.name.replace(/\.[^/.]+$/, "") : "",
      mediaUrl: asset.url,
      description: "",
    });
    setComposerOpen(true);
  };

  // Open Image Cropper
  const handleOpenCropper = (asset) => {
    setCropperTargetAsset(asset);
    setCropperOpen(true);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const trimmed = newFolderName.trim();
    if (!folders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      setFolders((prev) => [...prev, { name: trimmed, count: 0 }]);
      setActiveFolder(trimmed);
      toast.success(`Folder "${trimmed}" created!`);
    }
    setNewFolderName("");
    setCreatingFolder(false);
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#612bd3]/10 dark:bg-[#612bd3]/20 text-[#612bd3] dark:text-[#a78bfa] border border-[#612bd3]/20">
                <FiImage className="text-base font-bold" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                Media Asset Library
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Centralized repository for social images, reels, cropped thumbnails, and campaign assets
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchMedia}
              disabled={loading}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Refresh Media Library"
            >
              <FiRefreshCw className={`text-xs ${loading ? "animate-spin text-[#612bd3]" : ""}`} />
            </button>

            {/* Upload Media Button */}
            <button
              type="button"
              onClick={() => setUploaderOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-[#612bd3]/30 shrink-0"
            >
              <FiUploadCloud className="text-sm font-bold" />
              <span>Upload Media</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] shadow-2xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Total Assets</span>
            <p className="text-xl font-black text-zinc-900 dark:text-white mt-1">{totalAssetsCount}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] shadow-2xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Images</span>
            <p className="text-xl font-black text-violet-600 dark:text-violet-400 mt-1">{imageCount}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] shadow-2xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Video Clips</span>
            <p className="text-xl font-black text-pink-600 dark:text-pink-400 mt-1">{videoCount}</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141414] shadow-2xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Folders</span>
            <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">{folders.length}</p>
          </div>
        </div>

        {/* Folder Tabs & Filters Bar */}
        <div className="space-y-3">
          {/* Folders navigation row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {folders.map((folder) => {
              const isActive = activeFolder === folder.name;
              return (
                <button
                  key={folder.name}
                  type="button"
                  onClick={() => setActiveFolder(folder.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#612bd3] text-white shadow-xs shadow-[#612bd3]/35 font-bold"
                      : "bg-white dark:bg-[#141414] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <FiFolder className={`text-xs ${isActive ? "text-white" : "text-zinc-400"}`} />
                  <span>{folder.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {folder.count}
                  </span>
                </button>
              );
            })}

            {/* Inline Add Folder Button */}
            {creatingFolder ? (
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1 shrink-0">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  placeholder="Folder name..."
                  className="w-28 text-xs bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="p-1 rounded bg-[#612bd3] text-white text-[10px] font-bold"
                >
                  <FiCheck />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingFolder(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-[#612bd3] dark:hover:text-[#a78bfa] border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#612bd3] transition-all cursor-pointer shrink-0"
              >
                <FiPlus className="text-xs" />
                <span>New Folder</span>
              </button>
            )}
          </div>

          {/* Search, Type Filter & Sort Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by name or tag..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-[#612bd3] shadow-2xs"
              />
            </div>

            {/* Type Filter & Sort Dropdown */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Type Switcher Pills */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveType("all")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeType === "all"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveType("image")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeType === "image"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <FiImage className="text-xs" />
                  <span>Images</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveType("video")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeType === "video"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <FiFilm className="text-xs" />
                  <span>Videos</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="w-36 shrink-0">
                <CustomSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  options={SORT_OPTIONS}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid or Empty State */}
        {sortedAssets.length === 0 && !loading ? (
          <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/40 dark:bg-[#141414]/40 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[#612bd3]">
              <FiImage className="text-2xl" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No media assets in {activeFolder}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
              Upload images or short videos to build your reusable social media creative library.
            </p>
            <button
              type="button"
              onClick={() => setUploaderOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-bold transition-all shadow-md shadow-[#612bd3]/30 cursor-pointer flex items-center gap-2"
            >
              <FiUploadCloud className="text-sm" />
              <span>Upload First Asset</span>
            </button>
          </div>
        ) : (
          <MediaGrid
            assets={sortedAssets}
            loading={loading}
            folders={folders}
            onInsertIntoPost={handleInsertIntoPost}
            onOpenCropper={handleOpenCropper}
            onAssetUpdated={fetchMedia}
            onAssetDeleted={fetchMedia}
            onBatchDeleted={fetchMedia}
            onBatchMoved={fetchMedia}
          />
        )}
      </div>

      {/* Multi-File Uploader Modal */}
      <MediaUploaderModal
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        existingFolders={folders.map((f) => f.name)}
        currentFolder={activeFolder}
        onUploadComplete={fetchMedia}
      />

      {/* Image Cropper Modal */}
      {cropperTargetAsset && (
        <ImageCropperModal
          isOpen={cropperOpen}
          onClose={() => {
            setCropperOpen(false);
            setCropperTargetAsset(null);
          }}
          imageUrl={cropperTargetAsset.url}
          imageName={cropperTargetAsset.name}
          onSavedToLibrary={() => {
            fetchMedia();
            toast.success("Cropped asset added to library!");
          }}
          onApplyToComposer={(croppedUrl) => {
            handleInsertIntoPost({
              name: `Cropped_${cropperTargetAsset.name}`,
              url: croppedUrl,
            });
          }}
        />
      )}

      {/* Post Composer Modal for immediate scheduling from Media Library */}
      <PostComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialPost={composerInitialPost}
        onPostSaved={() => {
          fetchMedia();
          toast.success("Post scheduled!");
        }}
      />
    </AppShell>
  );
}
