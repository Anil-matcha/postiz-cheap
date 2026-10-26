"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  FiCrop, 
  FiX, 
  FiCheck, 
  FiRotateCw, 
  FiZoomIn, 
  FiZoomOut, 
  FiRefreshCw, 
  FiDownload, 
  FiSend, 
  FiSave,
  FiMaximize2
} from "react-icons/fi";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { toast } from "react-hot-toast";

const ASPECT_PRESETS = [
  { id: "1:1", label: "Square (1:1)", ratio: 1 / 1, desc: "Instagram Post", Icon: FaInstagram },
  { id: "9:16", label: "Story / Reel (9:16)", ratio: 9 / 16, desc: "TikTok, Reels, Shorts", Icon: SiTiktok },
  { id: "16:9", label: "Landscape (16:9)", ratio: 16 / 9, desc: "YouTube Thumbnail, X Feed", Icon: FaYoutube },
  { id: "4:5", label: "Portrait (4:5)", ratio: 4 / 5, desc: "Instagram Feed", Icon: FaInstagram },
  { id: "3:1", label: "Header (3:1)", ratio: 3 / 1, desc: "X Banner, LinkedIn Header", Icon: FaXTwitter },
  { id: "free", label: "Freeform", ratio: null, desc: "Original Aspect Ratio", Icon: FiMaximize2 },
];

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageUrl,
  imageName = "image.jpg",
  onSavedToLibrary,
  onApplyToComposer,
}) {
  const [selectedPreset, setSelectedPreset] = useState("1:1");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  if (!isOpen || !imageUrl) return null;

  const currentPreset = ASPECT_PRESETS.find((p) => p.id === selectedPreset) || ASPECT_PRESETS[0];

  // Mouse drag handling for panning
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Generate cropped canvas blob and data URL
  const generateCroppedBlob = async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Target dimensions based on preset ratio
        let targetWidth = 1080;
        let targetHeight = 1080;

        if (currentPreset.ratio) {
          if (currentPreset.ratio >= 1) {
            targetWidth = 1200;
            targetHeight = Math.round(1200 / currentPreset.ratio);
          } else {
            targetHeight = 1200;
            targetWidth = Math.round(1200 * currentPreset.ratio);
          }
        } else {
          targetWidth = img.naturalWidth;
          targetHeight = img.naturalHeight;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Fill background in case of transparent borders
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.save();
        ctx.translate(targetWidth / 2, targetHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Aspect fit image into canvas
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = targetWidth / targetHeight;
        let drawWidth, drawHeight;

        if (imgRatio > canvasRatio) {
          drawHeight = targetHeight;
          drawWidth = targetHeight * imgRatio;
        } else {
          drawWidth = targetWidth;
          drawHeight = targetWidth / imgRatio;
        }

        const drawX = -drawWidth / 2 + offset.x;
        const drawY = -drawHeight / 2 + offset.y;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas export failed"));
            return;
          }
          const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
          resolve({ blob, dataUrl: croppedDataUrl, width: targetWidth, height: targetHeight });
        }, "image/jpeg", 0.92);
      };
      img.onerror = (err) => reject(err);
      img.src = imageUrl;
    });
  };

  const handleDownloadCropped = async () => {
    try {
      const { dataUrl } = await generateCroppedBlob();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `cropped-${selectedPreset.replace(":", "x")}-${imageName || "asset.jpg"}`;
      a.click();
      toast.success("Cropped image downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate cropped image");
    }
  };

  const handleSaveToLibrary = async () => {
    setSaving(true);
    try {
      const { blob, width, height } = await generateCroppedBlob();
      const fileName = `cropped-${selectedPreset.replace(":", "x")}-${imageName || "asset.jpg"}`;

      const formData = new FormData();
      formData.append("file", blob, fileName);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const uploadedUrl = uploadData.url;

      // Register asset
      const mediaRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName,
          url: uploadedUrl,
          type: "image",
          size: blob.size,
          width,
          height,
          aspectRatio: selectedPreset,
          folder: "Thumbnails",
          tags: `cropped,${selectedPreset}`,
        }),
      });

      if (!mediaRes.ok) throw new Error("Catalog registration failed");
      const resJson = await mediaRes.json();

      toast.success("Cropped asset saved to Media Library!");
      if (onSavedToLibrary) onSavedToLibrary(resJson.asset || { url: uploadedUrl });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save cropped image to library");
    } finally {
      setSaving(false);
    }
  };

  const handleInsertIntoPost = async () => {
    setSaving(true);
    try {
      const { blob, dataUrl } = await generateCroppedBlob();
      const fileName = `cropped-${selectedPreset.replace(":", "x")}-${imageName || "asset.jpg"}`;

      const formData = new FormData();
      formData.append("file", blob, fileName);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let finalUrl = dataUrl;
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.url) finalUrl = uploadData.url;
      }

      if (onApplyToComposer) {
        onApplyToComposer(finalUrl);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to attach cropped image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#612bd3]/10 text-[#612bd3] dark:text-[#a78bfa]">
              <FiCrop className="text-lg font-bold" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Image Cropper & Social Aspect Studio
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Optimize image dimensions for Instagram, TikTok Reels, X feed, and YouTube Thumbnails
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

        {/* Preset aspect ratios toolbar */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {ASPECT_PRESETS.map((preset) => {
            const Icon = preset.Icon;
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#612bd3] text-white shadow-xs shadow-[#612bd3]/40"
                    : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
                title={preset.desc}
              >
                <Icon className="text-xs shrink-0" />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cropping Viewport */}
        <div className="flex-1 min-h-[340px] sm:min-h-[420px] bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden select-none">
          {/* Interactive Crop Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative overflow-hidden border-2 border-[#612bd3] shadow-2xl rounded-lg cursor-grab active:cursor-grabbing bg-black/60 flex items-center justify-center"
            style={{
              width: currentPreset.ratio
                ? currentPreset.ratio >= 1
                  ? "min(100%, 480px)"
                  : `min(100%, ${420 * currentPreset.ratio}px)`
                : "min(100%, 480px)",
              height: currentPreset.ratio
                ? currentPreset.ratio >= 1
                  ? `${Math.min(420, 480 / currentPreset.ratio)}px`
                  : "420px"
                : "360px",
            }}
          >
            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Inner Pan/Zoom Image */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop target"
              draggable={false}
              className="max-w-none transition-transform duration-75 origin-center pointer-events-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            />
          </div>

          {/* Quick pan helper watermark */}
          <span className="absolute bottom-3 left-4 text-[11px] text-zinc-500 font-medium pointer-events-none">
            Drag image to pan • Use slider below to zoom
          </span>
        </div>

        {/* Adjustments Bar (Zoom, Rotate, Reset) */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] flex flex-wrap items-center justify-between gap-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <FiZoomOut className="text-sm" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-32 sm:w-44 accent-[#612bd3] cursor-pointer"
            />
            <FiZoomIn className="text-sm" />
            <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold ml-1">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Rotation & Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Rotate 90 degrees"
            >
              <FiRotateCw className="text-xs" />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Reset Zoom & Pan"
            >
              <FiRefreshCw className="text-xs" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex-wrap gap-2">
          {/* Download button */}
          <button
            type="button"
            onClick={handleDownloadCropped}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
          >
            <FiDownload className="text-xs" />
            <span>Download</span>
          </button>

          {/* Primary Save & Apply Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToLibrary}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FiSave className="text-xs" />
              <span>Save to Library</span>
            </button>
            <button
              type="button"
              onClick={handleInsertIntoPost}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#612bd3] hover:bg-[#7237e8] disabled:opacity-50 text-white transition-all shadow-md shadow-[#612bd3]/30 cursor-pointer flex items-center gap-1.5"
            >
              <FiSend className="text-xs font-bold" />
              <span>Use in Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
