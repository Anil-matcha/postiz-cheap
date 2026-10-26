"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-lg bg-zinc-200/50 dark:bg-[#252525] animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
        isDark
          ? "bg-[#201f1f] hover:bg-[#262525] border-[#2e2d2d] text-amber-300"
          : "bg-white hover:bg-zinc-100 border-zinc-200 text-amber-500 shadow-xs"
      } ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FiSun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <FiMoon className="w-4 h-4 transition-transform hover:-rotate-12 text-slate-700" />
      )}
    </button>
  );
}
