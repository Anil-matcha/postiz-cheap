"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/media");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f1f2f5] dark:bg-[#0e0e0e] text-zinc-500 text-xs">
      Redirecting to Media Asset Library...
    </div>
  );
}
