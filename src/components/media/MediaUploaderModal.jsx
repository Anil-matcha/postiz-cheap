"use client";

import React, { useState, useRef } from "react";
import { 
  FiUploadCloud, 
  FiX, 
  FiCheck, 
  FiFile, 
  FiImage, 
  FiFilm, 
  FiFolder, 
  FiTag, 
  FiAlertCircle, 
  FiLoader 
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/ui/CustomSelect";

export default function MediaUploaderModal({
  isOpen,
  onClose,
  existingFolders = ["All Media", "Thumbnails", "Reels & Shorts", "Campaigns", "Brand Assets"],
  currentFolder = "All Media",
  onUploadComplete,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFolder, setTargetFolder] = useState(
    currentFolder && currentFolder !== "All Media" ? currentFolder : "Thumbnails"
  );
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      appendFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      appendFiles(Array.from(e.target.files));
    }
  };

  const appendFiles = (files) => {
    const validFiles = files.filter((f) => {
      const isImg = f.type.startsWith("image/");
      const isVid = f.type.startsWith("video/");
      return isImg || isVid;
    });

    if (validFiles.length < files.length) {
      toast.error("Some files were skipped. Only images and videos are supported.");
    }

    const fileObjects = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).slice(2, 9),
      name: file.name,
      size: file.size,
      type: file.type.startsWith("video/") ? "video" : "image",
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "idle", // "idle" | "uploading" | "completed" | "error"
      errorMessage: "",
    }));

    setSelectedFiles((prev) => [...prev, ...fileObjects]);
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const finalFolder = isCreatingFolder && newFolderName.trim() ? newFolderName.trim() : targetFolder;
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      if (item.status === "completed") continue;

      // Mark file as uploading
      setSelectedFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading", progress: 25 } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);

        // Progress simulation tick
        setSelectedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 60 } : f))
        );

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Upload failed");
        }

        const uploadData = await uploadRes.json();
        const uploadedUrl = uploadData.url;

        // Register in Media Asset database
        setSelectedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 85 } : f))
        );

        const mediaRes = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            url: uploadedUrl,
            type: item.type,
            size: item.size,
            folder: finalFolder,
            tags: tagsInput,
          }),
        });

        if (!mediaRes.ok) {
          throw new Error("Failed to register media asset in catalog");
        }

        setSelectedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "completed", progress: 100 } : f))
        );
        successCount++;
      } catch (err) {
        console.error("Upload error for file:", item.name, err);
        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", progress: 0, errorMessage: err.message } : f
          )
        );
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} asset${successCount > 1 ? "s" : ""}!`);
      if (onUploadComplete) onUploadComplete();
      setTimeout(() => {
        onClose();
        setSelectedFiles([]);
      }, 700);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#612bd3]/10 text-[#612bd3] dark:text-[#a78bfa]">
              <FiUploadCloud className="text-lg font-bold" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Upload Media Assets
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Drag and drop high-resolution images or short video clips into your studio library
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto min-h-0 flex-1">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              dragActive
                ? "border-[#612bd3] bg-[#612bd3]/5 dark:bg-[#612bd3]/10 scale-[0.99]"
                : "border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-[#612bd3]/60 hover:bg-[#612bd3]/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-3 shadow-inner">
              <FiUploadCloud className="text-2xl text-[#612bd3]" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 text-center">
              Click to browse or drag and drop files here
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">
              PNG, JPG, WebP, GIF, MP4, WebM (up to 50MB per file)
            </p>
          </div>

          {/* Target Folder & Tags Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Folder selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FiFolder className="text-[#612bd3]" />
                <span>Destination Folder</span>
              </label>

              {isCreatingFolder ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="New folder name..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <CustomSelect
                    value={targetFolder}
                    onChange={(val) => {
                      if (val === "__NEW__") {
                        setIsCreatingFolder(true);
                      } else {
                        setTargetFolder(val);
                      }
                    }}
                    options={[
                      ...existingFolders
                        .filter((f) => f !== "All Media")
                        .map((folder) => ({ value: folder, label: folder })),
                      { value: "__NEW__", label: "+ Create New Folder..." },
                    ]}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FiTag className="text-[#612bd3]" />
                <span>Asset Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. launch, summer, promo, podcast"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#612bd3] placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Selected Files Queue with Progress */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
                <span>Selected Files ({selectedFiles.length})</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {selectedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="pt-2 flex items-center justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Thumbnail or Icon */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 relative flex items-center justify-center">
                        {item.type === "image" ? (
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiFilm className="text-zinc-400 text-base" />
                        )}
                      </div>

                      {/* File Details & Progress bar */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {item.name}
                          </p>
                          <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                            {formatFileSize(item.size)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.status === "completed"
                                ? "bg-emerald-500"
                                : item.status === "error"
                                ? "bg-red-500"
                                : "bg-[#612bd3]"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status / Remove button */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {item.status === "completed" && (
                        <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <FiCheck className="text-xs font-bold" />
                        </span>
                      )}
                      {item.status === "uploading" && (
                        <FiLoader className="text-[#612bd3] animate-spin text-xs" />
                      )}
                      {item.status === "error" && (
                        <span
                          className="p-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400"
                          title={item.errorMessage}
                        >
                          <FiAlertCircle className="text-xs" />
                        </span>
                      )}
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                          <FiX className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} ready
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#612bd3] hover:bg-[#7237e8] disabled:opacity-50 text-white transition-all shadow-md shadow-[#612bd3]/30 cursor-pointer flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <FiLoader className="animate-spin text-xs" />
                  <span>Uploading Files...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud className="text-sm font-bold" />
                  <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
