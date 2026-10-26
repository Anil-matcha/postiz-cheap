import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaStore } from "@/lib/media-store";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { name, folder, tags } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (folder !== undefined) updateData.folder = folder;
    if (tags !== undefined) updateData.tags = typeof tags === "string" ? tags : Array.isArray(tags) ? tags.join(",") : "";

    let updatedAsset = null;

    try {
      const asset = await prisma.mediaAsset.findUnique({ where: { id } });

      if (asset) {
        if (asset.userId !== userId) {
          return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
        }
        updatedAsset = await prisma.mediaAsset.update({
          where: { id },
          data: updateData,
        });
      } else {
        updatedAsset = MediaStore.update(id, updateData);
      }
    } catch (e) {
      console.warn("[MEDIA_PATCH_DB_FALLBACK] Updating MediaStore:", e.message);
      updatedAsset = MediaStore.update(id, updateData);
    }

    if (!updatedAsset) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error("[PATCH_MEDIA_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update media asset" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    try {
      const asset = await prisma.mediaAsset.findUnique({ where: { id } });

      if (asset) {
        if (asset.userId !== userId) {
          return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
        }
        await prisma.mediaAsset.delete({
          where: { id },
        });
      } else {
        MediaStore.delete(id);
      }
    } catch (e) {
      console.warn("[MEDIA_DELETE_DB_FALLBACK] Deleting from MediaStore:", e.message);
      MediaStore.delete(id);
    }

    return NextResponse.json({ success: true, message: "Asset deleted successfully" });
  } catch (error) {
    console.error("[DELETE_MEDIA_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete media asset" }, { status: 500 });
  }
}
