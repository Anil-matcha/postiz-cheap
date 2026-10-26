"use client";

import React, { useState } from "react";
import { 
  FiFilm, 
  FiImage, 
  FiSend, 
  FiCrop, 
  FiDownload, 
  FiTrash2, 
  FiFolder, 
  FiMoreVertical, 
  FiCheck, 
  FiMaximize2,
  FiX,
  FiTag,
  FiExternalLink
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/ui/CustomSelect";

export default function MediaGrid({
  assets = [],
  loading = false,
  folders = [],
  onInsertIntoPost,
  onOpenCropper,
  onAssetUpdated,
  onAssetDeleted,
  onBatchDeleted,
  onBatchMoved,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [lightboxAsset, setLightboxAsset] = useState(null);
  const [movingFolderAsset, setMovingFolderAsset] = useState(null);
  const [batchTargetFolder, setBatchTargetFolder] = useState("Thumbnails");

  const toggleSelect = (id, e) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  };

  const handleDownload = (asset, e) => {
    e?.stopPropagation();
    const a = document.createElement("a");
    a.href = asset.url;
    a.target = "_blank";
    a.download = asset.name || "media-asset";
    a.click();
    toast.success("Download started!");
  };

  const handleDelete = async (asset, e) => {
    e?.stopPropagation();
    if (!confirm(`Delete "${asset.name}" from your media library?`)) return;

    try {
      const res = await fetch(`/api/media/${asset.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Asset removed from library");
        if (onAssetDeleted) onAssetDeleted(asset.id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(asset.id);
          return next;
        });
      } else {
        toast.error("Failed to delete asset");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting asset");
    }
  };

  const handleMoveFolder = async (assetId, newFolder) => {
    try {
      const res = await fetch(`/api/media/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: newFolder }),
      });
      if (res.ok) {
        toast.success(`Moved to "${newFolder}"`);
        if (onAssetUpdated) onAssetUpdated();
        setMovingFolderAsset(null);
        setActiveMenuId(null);
      } else {
        toast.error("Failed to move asset");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error moving folder");
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm(`Permanently delete ${selectedIds.size} selected asset(s)?`)) return;

    let successCount = 0;
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
        if (res.ok) successCount++;
      } catch (_) {}
    }

    toast.success(`Deleted ${successCount} asset(s)`);
    setSelectedIds(new Set());
    if (onBatchDeleted) onBatchDeleted();
  };

  const handleBatchMove = async () => {
    let successCount = 0;
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await fetch(`/api/media/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: batchTargetFolder }),
        });
        if (res.ok) successCount++;
      } catch (_) {}
    }

    toast.success(`Moved ${successCount} asset(s) to "${batchTargetFolder}"`);
    setSelectedIds(new Set());
    if (onBatchMoved) onBatchMoved();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Action Toolbar when items selected */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#612bd3] text-white shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span>{selectedIds.size} asset(s) selected</span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="underline text-violet-200 hover:text-white cursor-pointer"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Batch Move to Folder */}
            <div className="flex items-center gap-1.5">
              <div className="w-36">
                <CustomSelect
                  value={batchTargetFolder}
                  onChange={(val) => setBatchTargetFolder(val)}
                  options={folders
                    .filter((f) => f.name !== "All Media")
                    .map((f) => ({ value: f.name, label: f.name }))}
                  size="sm"
                  buttonClassName="!bg-white/20 !border-white/30 !text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleBatchMove}
                className="px-2.5 py-1.5 rounded-lg bg-white text-[#612bd3] text-xs font-bold hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
              >
                Move
              </button>
            </div>

            {/* Batch Delete */}
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FiTrash2 className="text-xs" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {assets.map((asset) => {
          const isSelected = selectedIds.has(asset.id);
          const isVideo = asset.type === "video";

          return (
            <div
              key={asset.id}
              className={`group relative rounded-xl overflow-hidden border transition-all duration-200 bg-white dark:bg-[#141414] shadow-2xs hover:shadow-md ${
                isSelected
                  ? "border-[#612bd3] ring-2 ring-[#612bd3]/30"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {/* Media Preview Box */}
              <div
                onClick={() => setLightboxAsset(asset)}
                className="aspect-square w-full bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden flex items-center justify-center cursor-pointer"
              >
                {isVideo ? (
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Video Play Badge */}
                {isVideo && (
                  <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-xs shadow-xs pointer-events-none">
                    <FiFilm />
                  </div>
                )}

                {/* Aspect Ratio Badge */}
                {asset.aspectRatio && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xs text-white">
                    {asset.aspectRatio}
                  </div>
                )}

                {/* Selection Checkbox (always visible if selected or on hover) */}
                <div
                  onClick={(e) => toggleSelect(asset.id, e)}
                  className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer z-10 ${
                    isSelected
                      ? "bg-[#612bd3] text-white shadow-xs"
                      : "bg-black/40 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isSelected && <FiCheck className="text-xs font-bold" />}
                </div>

                {/* Hover Quick Action Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 z-10 pointer-events-none">
                  <div className="flex items-center justify-between gap-1 pointer-events-auto">
                    {/* Insert into Post Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onInsertIntoPost) onInsertIntoPost(asset);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Insert into new Post Composer"
                    >
                      <FiSend className="text-[10px]" />
                      <span>Use</span>
                    </button>

                    {/* Crop Button (for images only) */}
                    {!isVideo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenCropper) onOpenCropper(asset);
                        }}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-zinc-900 transition-all cursor-pointer"
                        title="Crop & Resize"
                      >
                        <FiCrop className="text-xs" />
                      </button>
                    )}

                    {/* Download */}
                    <button
                      type="button"
                      onClick={(e) => handleDownload(asset, e)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-zinc-900 transition-all cursor-pointer"
                      title="Download file"
                    >
                      <FiDownload className="text-xs" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(asset, e)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-red-600 text-white transition-all cursor-pointer"
                      title="Delete asset"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate cursor-pointer hover:text-[#612bd3]"
                    title={asset.name}
                    onClick={() => setLightboxAsset(asset)}
                  >
                    {asset.name}
                  </p>
                  {/* More options menu trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(activeMenuId === asset.id ? null : asset.id)
                      }
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <FiMoreVertical className="text-xs" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === asset.id && (
                      <div className="absolute right-0 bottom-full mb-1 z-30 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1 text-xs space-y-0.5 animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            if (onInsertIntoPost) onInsertIntoPost(asset);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <FiSend className="text-xs text-[#612bd3]" />
                          <span>Insert into Post</span>
                        </button>
                        {!isVideo && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenCropper) onOpenCropper(asset);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <FiCrop className="text-xs text-amber-500" />
                            <span>Crop & Resize</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMovingFolderAsset(asset);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <FiFolder className="text-xs text-sky-500" />
                          <span>Move to Folder...</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            handleDownload(asset, e);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <FiDownload className="text-xs text-emerald-500" />
                          <span>Download File</span>
                        </button>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                        <button
                          type="button"
                          onClick={(e) => {
                            handleDelete(asset, e);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <FiTrash2 className="text-xs" />
                          <span>Delete Asset</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="truncate">{asset.folder || "All Media"}</span>
                  {asset.size && <span>{formatFileSize(asset.size)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Move Folder Dialog */}
      {movingFolderAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FiFolder className="text-[#612bd3]" />
              <span>Move &quot;{movingFolderAsset.name}&quot; to:</span>
            </h3>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {folders
                .filter((f) => f.name !== "All Media")
                .map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => handleMoveFolder(movingFolderAsset.id, f.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      movingFolderAsset.folder === f.name
                        ? "bg-[#612bd3]/10 text-[#612bd3]"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span>{f.name}</span>
                    {movingFolderAsset.folder === f.name && <FiCheck className="text-xs" />}
                  </button>
                ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setMovingFolderAsset(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {lightboxAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxAsset(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[85vh] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/60">
              <span className="text-xs font-bold text-white truncate">
                {lightboxAsset.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onInsertIntoPost) onInsertIntoPost(lightboxAsset);
                    setLightboxAsset(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FiSend className="text-xs" />
                  <span>Insert into Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxAsset(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="flex-1 min-h-[300px] flex items-center justify-center p-4 bg-black/50 overflow-hidden">
              {lightboxAsset.type === "video" ? (
                <video
                  src={lightboxAsset.url}
                  controls
                  autoPlay
                  className="max-h-[65vh] max-w-full rounded-lg"
                />
              ) : (
                <img
                  src={lightboxAsset.url}
                  alt={lightboxAsset.name}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
