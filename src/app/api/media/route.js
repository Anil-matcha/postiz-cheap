import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaStore } from "@/lib/media-store";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const folderFilter = searchParams.get("folder") || "All Media";
    const typeFilter = searchParams.get("type") || "all"; // "all" | "image" | "video"
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    let assets = [];

    try {
      assets = await prisma.mediaAsset.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      // Auto-index media from scheduled posts if not already indexed
      try {
        const posts = await prisma.scheduledPost.findMany({
          where: { userId },
          select: { id: true, title: true, mediaUrl: true, createdAt: true },
        });

        const existingUrls = new Set(assets.map((a) => a.url));
        const newPostAssets = [];

        for (const p of posts) {
          if (p.mediaUrl && !existingUrls.has(p.mediaUrl)) {
            existingUrls.add(p.mediaUrl);
            const isVideo = p.mediaUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i);
            const autoAsset = {
              id: "post-media-" + p.id,
              userId,
              name: p.title ? `${p.title.slice(0, 30)} Media` : "Post Media",
              url: p.mediaUrl,
              type: isVideo ? "video" : "image",
              folder: "Post Uploads",
              tags: "post,social",
              createdAt: p.createdAt || new Date(),
              updatedAt: new Date(),
            };
            newPostAssets.push(autoAsset);

            // Save to DB in background
            prisma.mediaAsset.create({ data: autoAsset }).catch(() => {});
          }
        }

        if (newPostAssets.length > 0) {
          assets = [...assets, ...newPostAssets];
        }
      } catch (_) {}
    } catch (e) {
      console.warn("[MEDIA_DB_FALLBACK] Using MediaStore:", e.message);
      assets = MediaStore.getAll(userId);
    }

    // Default system folders
    const systemFolders = ["All Media", "Post Uploads", "Thumbnails", "Reels & Shorts", "Campaigns", "Brand Assets"];
    const folderSet = new Set(systemFolders);

    assets.forEach((a) => {
      if (a.folder) folderSet.add(a.folder);
    });

    // Compute counts per folder
    const folderCounts = {};
    folderSet.forEach((f) => {
      if (f === "All Media") {
        folderCounts[f] = assets.length;
      } else {
        folderCounts[f] = assets.filter((a) => a.folder === f).length;
      }
    });

    const folders = Array.from(folderSet).map((f) => ({
      name: f,
      count: folderCounts[f] || 0,
    }));

    // Apply filters
    let filtered = [...assets];

    if (folderFilter && folderFilter !== "All Media") {
      filtered = filtered.filter((a) => a.folder === folderFilter);
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((a) => {
        const nameMatch = (a.name || "").toLowerCase().includes(searchQuery);
        const tagsMatch = (a.tags || "").toLowerCase().includes(searchQuery);
        return nameMatch || tagsMatch;
      });
    }

    return NextResponse.json({
      assets: filtered,
      folders,
      totalCount: assets.length,
      filteredCount: filtered.length,
    });
  } catch (error) {
    console.error("[GET_MEDIA_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { name, url, type = "image", mimeType, size, width, height, aspectRatio, folder = "All Media", tags = "" } = body;

    if (!url) {
      return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
    }

    const assetData = {
      id: "media-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      userId,
      name: name || `Asset_${Date.now()}`,
      url,
      type: type || (url.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? "video" : "image"),
      mimeType: mimeType || (type === "video" ? "video/mp4" : "image/jpeg"),
      size: typeof size === "number" ? size : null,
      width: typeof width === "number" ? width : null,
      height: typeof height === "number" ? height : null,
      aspectRatio: aspectRatio || null,
      folder: folder || "All Media",
      tags: typeof tags === "string" ? tags : Array.isArray(tags) ? tags.join(",") : "",
    };

    let createdAsset = null;

    try {
      createdAsset = await prisma.mediaAsset.create({
        data: assetData,
      });
    } catch (e) {
      console.warn("[MEDIA_POST_DB_FALLBACK] Saving to MediaStore:", e.message);
      createdAsset = MediaStore.add(assetData);
    }

    return NextResponse.json({ success: true, asset: createdAsset }, { status: 201 });
  } catch (error) {
    console.error("[POST_MEDIA_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create media asset" }, { status: 500 });
  }
}
