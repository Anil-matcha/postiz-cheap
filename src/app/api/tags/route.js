import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const DEFAULT_TAGS = [
  { id: "tag-launch", name: "Launch", color: "#612bd3" },
  { id: "tag-promo", name: "Promo", color: "#10b981" },
  { id: "tag-meme", name: "Meme", color: "#f59e0b" },
  { id: "tag-casestudy", name: "Case Study", color: "#06b6d4" },
  { id: "tag-bts", name: "BTS", color: "#ec4899" },
  { id: "tag-announce", name: "Announce", color: "#3b82f6" },
];

let inMemoryTags = [];

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(DEFAULT_TAGS);
    }

    const userId = session.user.id;

    try {
      const userTags = await prisma.postTag.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" }
      });

      if (userTags && userTags.length > 0) {
        return NextResponse.json(userTags);
      }

      // If user has no tags yet, seed default tags
      const seeded = await Promise.all(
        DEFAULT_TAGS.map((t) =>
          prisma.postTag.upsert({
            where: {
              userId_name: {
                userId,
                name: t.name
              }
            },
            create: {
              userId,
              name: t.name,
              color: t.color
            },
            update: {}
          })
        )
      );
      return NextResponse.json(seeded);
    } catch (dbErr) {
      console.warn("[TAGS_GET_FALLBACK] Database unavailable, using in-memory:", dbErr.message);
      const combined = [
        ...DEFAULT_TAGS,
        ...inMemoryTags.filter((t) => t.userId === userId)
      ];
      return NextResponse.json(combined);
    }
  } catch (error) {
    console.error("[TAGS_GET_ERROR]", error);
    return NextResponse.json(DEFAULT_TAGS);
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
    const name = (body.name || "").trim().replace(/^#+/, "");
    const color = (body.color || "#612bd3").trim();

    if (!name) {
      return NextResponse.json({ error: "Tag name is required." }, { status: 400 });
    }

    try {
      const tag = await prisma.postTag.upsert({
        where: {
          userId_name: {
            userId,
            name
          }
        },
        create: {
          userId,
          name,
          color
        },
        update: {
          color
        }
      });

      return NextResponse.json(tag);
    } catch (dbErr) {
      console.warn("[TAGS_POST_FALLBACK] DB offline, saving in-memory:", dbErr.message);
      const existingIdx = inMemoryTags.findIndex(
        (t) => t.userId === userId && t.name.toLowerCase() === name.toLowerCase()
      );
      if (existingIdx !== -1) {
        inMemoryTags[existingIdx].color = color;
        return NextResponse.json(inMemoryTags[existingIdx]);
      }
      const newTag = {
        id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId,
        name,
        color,
        createdAt: new Date().toISOString()
      };
      inMemoryTags.push(newTag);
      return NextResponse.json(newTag);
    }
  } catch (error) {
    console.error("[TAGS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to save tag" }, { status: 500 });
  }
}
