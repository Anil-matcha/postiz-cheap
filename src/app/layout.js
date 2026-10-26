import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ 
  variable: "--font-inter", 
  subsets: ["latin"], 
  display: "swap" 
});

export const metadata = {
  title: "AI Social Media Scheduler & Creator Studio",
  description: "Schedule, preview and publish AI-powered content across all your social platforms.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full w-full overflow-hidden">
      <body className={`${inter.variable} ${inter.className} h-full w-full antialiased bg-[#0e0e0e] text-white overflow-hidden`}>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}

