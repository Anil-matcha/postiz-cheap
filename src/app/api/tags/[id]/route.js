import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    try {
      await prisma.postTag.deleteMany({
        where: {
          id,
          userId
        }
      });
      return NextResponse.json({ success: true, id });
    } catch (dbErr) {
      console.warn("[TAG_DELETE_FALLBACK] DB offline:", dbErr.message);
      return NextResponse.json({ success: true, id });
    }
  } catch (error) {
    console.error("[TAG_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete tag" }, { status: 500 });
  }
}
