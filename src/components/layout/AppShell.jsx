"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin, 
  FaPinterest,
  FaBolt,
  FaGoogle
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiCalendar, 
  FiCpu, 
  FiShare2, 
  FiImage, 
  FiCreditCard, 
  FiPlus, 
  FiLogOut, 
  FiMenu, 
  FiDollarSign
} from "react-icons/fi";
import ThemeToggle from "@/components/ThemeToggle";

// Custom Brand Logo
export const StudioBrandLogo = ({ className = "w-10 h-10" }) => (
  <div
    className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#612bd3] via-[#7c3aed] to-[#d82d7e] p-2 text-white shadow-md shadow-[#612bd3]/35 ${className}`}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full text-white"
    >
      <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  </div>
);

// Active Tab Left Indicator
export const RailActiveIndicator = () => (
  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-gradient-to-b from-[#8c66ff] to-[#612bd3] shadow-sm shadow-[#612bd3]/50" />
);

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch connected channels for top bar indicator
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/social/accounts")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setConnectedAccounts(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [status]);

  const navItems = [
    {
      name: "Calendar",
      path: "/",
      icon: <FiCalendar className="w-5 h-5" />,
      exact: true,
    },
    {
      name: "Agent",
      path: "/agents",
      icon: <FiCpu className="w-5 h-5" />,
    },
    {
      name: "Channels",
      path: "/integrations",
      icon: <FiShare2 className="w-5 h-5" />,
    },
    {
      name: "Media",
      path: "/gallery",
      icon: <FiImage className="w-5 h-5" />,
    },
    {
      name: "Pricing",
      path: "/pricing",
      icon: <FiCreditCard className="w-5 h-5" />,
    },
  ];

  const getPageTitle = () => {
    if (pathname === "/") return "Calendar";
    if (pathname.startsWith("/agents")) return "AI Social Agent";
    if (pathname.startsWith("/integrations")) return "Channels & Integrations";
    if (pathname.startsWith("/gallery")) return "Media Library";
    if (pathname.startsWith("/pricing")) return "Pricing & Credits";
    if (pathname.startsWith("/login")) return "Sign In";
    return "Creator Studio";
  };

  const handleCreatePost = () => {
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("open-composer", { detail: { withAi: false } }));
    } else {
      router.push("/?compose=true");
    }
  };

  const handleWriteWithAi = () => {
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("open-composer", { detail: { withAi: true } }));
    } else {
      router.push("/agents");
    }
  };

  const credits = session?.user?.credits ?? 10;

  return (
    <div className="fixed inset-0 flex bg-[#f1f2f5] dark:bg-[#0e0e0e] text-slate-900 dark:text-white p-2 sm:p-2.5 font-sans overflow-hidden select-none transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex gap-2 sm:gap-2.5 w-full h-full min-h-0 overflow-hidden">
        {/* Left Navigation Rail */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto flex flex-col justify-between items-center w-[74px] h-full shrink-0 bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#252525] rounded-[14px] py-3.5 transition-transform duration-200 shadow-xs dark:shadow-none ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Top Logo & Menu Items */}
          <div className="flex flex-col items-center gap-4 w-full min-h-0 overflow-y-auto scrollbar-none">
            <Link
              href="/"
              className="flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shrink-0"
              title="Social Media Studio"
            >
              <StudioBrandLogo className="w-9 h-9 drop-shadow-[0_4px_12px_rgba(97,43,211,0.35)]" />
            </Link>

            {/* Menu Items */}
            <nav className="flex flex-col gap-1 w-full px-1.5">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.path
                  : pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    title={item.name}
                    className={`relative group w-full py-2 px-1 flex flex-col items-center justify-center rounded-[10px] transition-all ${
                      isActive
                        ? "bg-[#612bd3]/10 dark:bg-[#612bd3]/15 text-[#612bd3] dark:text-[#8c66ff] border border-[#612bd3]/25 dark:border-[#612bd3]/30 font-bold shadow-xs dark:shadow-sm"
                        : "text-zinc-500 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#242323]"
                    }`}
                  >
                    {isActive && <RailActiveIndicator />}
                    <div className="transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <span className="text-[10px] tracking-tight mt-1 font-medium leading-none">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile / Auth */}
          <div className="flex flex-col items-center gap-3 w-full px-2 pt-3 border-t border-zinc-200 dark:border-[#252525]/60 shrink-0">
            {status === "authenticated" ? (
              <div className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#612bd3] to-[#d82d7e] p-0.5 transition-transform hover:scale-105 cursor-pointer shadow-md shadow-[#612bd3]/30"
                  title={session?.user?.name || session?.user?.email}
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="User avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-[#1a1919] flex items-center justify-center text-xs font-bold text-zinc-800 dark:text-white">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google")}
                className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-[#252525] hover:bg-[#612bd3] text-zinc-700 dark:text-white hover:text-white border border-zinc-200 dark:border-transparent flex items-center justify-center transition-colors cursor-pointer"
                title="Sign in with Google"
              >
                <FaGoogle className="text-xs" />
              </button>
            )}
          </div>
        </aside>

        {/* Right Frame Container */}
        <div className="flex-1 min-w-0 h-full min-h-0 bg-zinc-200 dark:bg-[#212121] rounded-[14px] overflow-hidden flex flex-col transition-colors duration-200">
          {/* Top Header Bar */}
          <header className="shrink-0 flex bg-white dark:bg-[#1a1919] h-[64px] sm:h-[68px] px-4 sm:px-6 items-center justify-between gap-4 border-b border-zinc-200 dark:border-[#252525] transition-colors duration-200">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg bg-zinc-100 dark:bg-[#252525] text-zinc-600 dark:text-[#999999] hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Open navigation"
              >
                <FiMenu className="w-5 h-5" />
              </button>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white capitalize truncate">
                    {getPageTitle()}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#612bd3]/10 dark:bg-[#612bd3]/15 border border-[#612bd3]/25 dark:border-[#612bd3]/30 text-[#612bd3] dark:text-[#8c66ff] text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Studio Active
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Connected Platform Status Icons (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 bg-zinc-100 dark:bg-[#141414] px-3 py-1.5 rounded-full border border-zinc-200 dark:border-[#252525] transition-colors">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#999999] pr-1">Channels:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { key: "youtube", Icon: FaYoutube, color: "text-red-500" },
                  { key: "tiktok", Icon: SiTiktok, color: "text-zinc-800 dark:text-zinc-100" },
                  { key: "instagram", Icon: FaInstagram, color: "text-pink-500" },
                  { key: "x_twitter", Icon: FaXTwitter, color: "text-sky-500 dark:text-sky-400" },
                  { key: "linkedin", Icon: FaLinkedin, color: "text-blue-500" },
                  { key: "facebook", Icon: FaFacebook, color: "text-blue-600" },
                  { key: "threads", Icon: FaThreads, color: "text-purple-500 dark:text-purple-400" },
                  { key: "pinterest", Icon: FaPinterest, color: "text-rose-500" },
                ].map((item) => {
                  const isConnected = connectedAccounts.some((acc) => acc.platform === item.key);
                  return (
                    <Link
                      key={item.key}
                      href="/integrations"
                      className="relative p-1 rounded hover:bg-zinc-200 dark:hover:bg-[#252525] transition-colors"
                      title={`${item.key} ${isConnected ? "(Connected)" : "(Click to connect)"}`}
                    >
                      <item.Icon className={`text-xs ${isConnected ? item.color : "text-zinc-400 dark:text-zinc-600"}`} />
                      {isConnected && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions Section */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Theme Mode Toggle Button */}
              <ThemeToggle />

              {/* Credits Chip */}
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#201f1f] hover:bg-zinc-200/80 dark:hover:bg-[#262525] border border-zinc-200 dark:border-[#2e2d2d] text-xs font-semibold text-zinc-800 dark:text-white transition-colors shadow-xs"
                title="Credits Balance & Pricing"
              >
                <FiDollarSign className="text-amber-500 dark:text-amber-400 text-xs" />
                <span className="font-mono">{credits}</span>
                <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded">+</span>
              </Link>

              {/* Write with AI Button */}
              <button
                type="button"
                onClick={handleWriteWithAi}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#d82d7e] to-[#612bd3] hover:from-[#e3378b] hover:to-[#7237e8] transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#612bd3]/30 active:scale-95"
                title="Write with AI Copilot"
              >
                <FaBolt className="text-[10px] text-amber-300" />
                <span className="hidden sm:inline">Write with AI</span>
              </button>

              {/* Create Post Button */}
              <button
                type="button"
                onClick={handleCreatePost}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#612bd3] hover:bg-[#7237e8] transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#612bd3]/40 active:scale-95"
              >
                <FiPlus className="text-xs font-bold" />
                <span>Create Post</span>
              </button>
            </div>
          </header>

          {/* Main Workspace Body */}
          <main className="flex-1 min-h-0 bg-[#f8f9fa] dark:bg-[#141414] overflow-y-auto overflow-x-hidden scrollbar-subtle transition-colors duration-200">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Profile Modal / Popover */}
      {status === "authenticated" && profileDropdownOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Click-outside Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[1px] pointer-events-auto"
            onClick={() => setProfileDropdownOpen(false)}
          />

          {/* Profile Modal Card */}
          <div
            className="fixed left-[84px] sm:left-[88px] bottom-3.5 z-50 pointer-events-auto w-72 bg-white dark:bg-[#1a1919] border border-zinc-200 dark:border-[#2e2d2d] rounded-2xl shadow-2xl p-4 flex flex-col gap-3.5 text-zinc-900 dark:text-white animate-in fade-in zoom-in-95 duration-150 transition-colors"
          >
            {/* User Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-[#282727]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#612bd3] to-[#d82d7e] p-0.5 shrink-0 shadow-md shadow-[#612bd3]/30">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="User avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-[#1a1919] flex items-center justify-center text-xs font-bold text-zinc-800 dark:text-white">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                  {session?.user?.name || "Creator"}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-[#999999] truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Credits Card */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-[#212020] border border-zinc-200 dark:border-[#2d2c2c] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-400 flex items-center justify-center text-xs">
                  <FiDollarSign />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 dark:text-[#999999] uppercase font-bold tracking-wider leading-none">Credits</span>
                  <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white leading-tight">{credits} Available</span>
                </div>
              </div>
              <Link
                href="/pricing"
                onClick={() => setProfileDropdownOpen(false)}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              >
                Top Up
              </Link>
            </div>

            {/* Theme Toggle Row in Modal */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-[#212020] border border-zinc-200 dark:border-[#2d2c2c] transition-colors">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Theme</span>
              <ThemeToggle />
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-col gap-1">
              <Link
                href="/integrations"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#cccccc] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#252424] transition-colors"
              >
                <FiShare2 className="text-[#612bd3] dark:text-[#8c66ff]" />
                <span>Connected Channels</span>
              </Link>
              <Link
                href="/gallery"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#cccccc] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#252424] transition-colors"
              >
                <FiImage className="text-pink-500 dark:text-pink-400" />
                <span>Media Library</span>
              </Link>
              <Link
                href="/pricing"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#cccccc] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#252424] transition-colors"
              >
                <FiCreditCard className="text-amber-500 dark:text-amber-400" />
                <span>Pricing Plans</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-zinc-200 dark:border-[#282727]">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-left"
              >
                <FiLogOut className="text-sm" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
