"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "bg-white dark:bg-[#201f1f] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-[#2e2d2d] shadow-lg rounded-xl text-xs font-medium",
            duration: 3500,
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
