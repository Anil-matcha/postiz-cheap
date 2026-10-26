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
    <div className="flex h-screen w-screen bg-[#0e0e0e] text-[#ffffff] p-2 sm:p-2.5 font-sans overflow-hidden select-none">
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
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto flex flex-col justify-between items-center w-[74px] h-full shrink-0 bg-[#1a1919] border border-[#252525] rounded-[14px] py-3.5 transition-transform duration-200 overflow-hidden ${
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
                        ? "bg-[#612bd3]/15 text-[#8c66ff] border border-[#612bd3]/30 font-bold shadow-sm shadow-[#612bd3]/20"
                        : "text-[#999999] hover:text-white hover:bg-[#242323]"
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
          <div className="flex flex-col items-center gap-3 w-full px-2 pt-3 border-t border-[#252525]/60 shrink-0">
            {status === "authenticated" ? (
              <div className="relative flex flex-col items-center">
                <button
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
                    <div className="w-full h-full rounded-full bg-[#1a1919] flex items-center justify-center text-xs font-bold text-white">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute left-16 bottom-0 w-48 bg-[#1a1919] border border-[#252525] rounded-[12px] shadow-2xl p-2 z-50 flex flex-col gap-1">
                    <div className="px-3 py-2 border-b border-[#252525] text-xs">
                      <p className="font-semibold text-white truncate">{session?.user?.name || "Creator"}</p>
                      <p className="text-[#999999] text-[10px] truncate">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#999999] hover:text-white hover:bg-[#242323] rounded-lg transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiCreditCard className="text-amber-400" />
                      <span>{credits} Credits</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer w-full text-left"
                    >
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="w-9 h-9 rounded-full bg-[#252525] hover:bg-[#612bd3] text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Sign in with Google"
              >
                <FaGoogle className="text-xs" />
              </button>
            )}
          </div>
        </aside>

        {/* Right Frame Container */}
        <div className="flex-1 min-w-0 h-full min-h-0 bg-[#212121] rounded-[14px] overflow-hidden flex flex-col">
          {/* Top Header Bar */}
          <header className="shrink-0 flex bg-[#1a1919] h-[64px] sm:h-[68px] px-4 sm:px-6 items-center justify-between gap-4 border-b border-[#252525]">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg bg-[#252525] text-[#999999] hover:text-white"
                aria-label="Open navigation"
              >
                <FiMenu className="w-5 h-5" />
              </button>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-[20px] font-bold tracking-tight text-white capitalize truncate">
                    {getPageTitle()}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#612bd3]/15 border border-[#612bd3]/30 text-[#8c66ff] text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Studio Active
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Connected Platform Status Icons (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-full border border-[#252525]">
              <span className="text-[11px] font-semibold text-[#999999] pr-1">Channels:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { key: "youtube", Icon: FaYoutube, color: "text-red-500" },
                  { key: "tiktok", Icon: SiTiktok, color: "text-zinc-100" },
                  { key: "instagram", Icon: FaInstagram, color: "text-pink-500" },
                  { key: "x_twitter", Icon: FaXTwitter, color: "text-sky-400" },
                  { key: "linkedin", Icon: FaLinkedin, color: "text-blue-500" },
                  { key: "facebook", Icon: FaFacebook, color: "text-blue-600" },
                  { key: "threads", Icon: FaThreads, color: "text-purple-400" },
                  { key: "pinterest", Icon: FaPinterest, color: "text-rose-500" },
                ].map((item) => {
                  const isConnected = connectedAccounts.some((acc) => acc.platform === item.key);
                  return (
                    <Link
                      key={item.key}
                      href="/integrations"
                      className="relative p-1 rounded hover:bg-[#252525] transition-colors"
                      title={`${item.key} ${isConnected ? "(Connected)" : "(Click to connect)"}`}
                    >
                      <item.Icon className={`text-xs ${isConnected ? item.color : "text-zinc-600"}`} />
                      {isConnected && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credits Chip */}
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#201f1f] hover:bg-[#262525] border border-[#2e2d2d] text-xs font-semibold text-white transition-colors shadow-sm"
                title="Credits Balance & Pricing"
              >
                <FiDollarSign className="text-amber-400 text-xs" />
                <span className="font-mono">{credits}</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded">+</span>
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
          <main className="flex-1 min-h-0 bg-[#141414] overflow-y-auto overflow-x-hidden scrollbar-subtle">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
