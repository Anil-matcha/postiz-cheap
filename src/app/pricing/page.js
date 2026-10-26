"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaCheck, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const PLANS = [
  { id: "basic", name: "Basic Pack", price: "$5", credits: 100, description: "Perfect for testing custom prompts and exploring styles." },
  { id: "standard", name: "Standard Pack", price: "$10", credits: 250, description: "Ideal for regular creators wanting high resolution outputs." },
  { id: "pro", name: "Professional Pack", price: "$20", credits: 600, description: "Designed for power users demanding batch exports and high speed.", popular: true },
  { id: "business", name: "Business Pack", price: "$50", credits: 2000, description: "Maximum value pack for agency workflows and large volume generations." }
];

export default function Pricing() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planId) => {
    if (status !== "authenticated") {
      toast.error("You must sign in with Google to purchase credit packages.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data } = await axios.post("/api/checkout", { planId });
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirection URL returned");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to trigger Stripe checkout session.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 items-center select-none text-slate-900 dark:text-white transition-colors duration-200">
      <Toaster position="top-right" />

      <div className="w-full flex flex-col gap-8 items-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#612bd3]/10 border border-[#612bd3]/20 rounded-full mb-1">
            <FaInfoCircle className="text-[#612bd3] dark:text-[#8c66ff] text-xs" />
            <span className="text-[10px] font-black text-[#612bd3] dark:text-[#8c66ff] uppercase tracking-widest">Pricing Plans</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Buy Credits Packs</h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
            Purchase flexible credit packages to perform high-resolution predictions. Keep all profits — we handle AI infrastructure.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-[#1a1919] border rounded-xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? "border-[#612bd3] dark:border-[#8c66ff] shadow-lg shadow-[#612bd3]/10 scale-105" : "border-zinc-200 dark:border-[#252525] shadow-xs"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#612bd3] text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">{plan.name}</h3>
                  <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{plan.price}</p>
                </div>
                
                <div className="text-xs bg-[#612bd3]/10 dark:bg-[#612bd3]/15 border border-[#612bd3]/20 dark:border-[#612bd3]/30 p-3 rounded-lg text-center font-extrabold text-[#612bd3] dark:text-[#8c66ff]">
                  {plan.credits} Art Credits
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium min-h-[3rem]">{plan.description}</p>
                
                <ul className="space-y-2 border-t border-zinc-200 dark:border-[#252525] pt-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-[#612bd3] dark:text-[#8c66ff] text-[10px]" />
                    <span>Dynamic aspect ratios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-[#612bd3] dark:text-[#8c66ff] text-[10px]" />
                    <span>HD image downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-[#612bd3] dark:text-[#8c66ff] text-[10px]" />
                    <span>No subscription required</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer select-none active:scale-[0.98] ${
                  plan.popular ? "bg-[#612bd3] hover:bg-[#7237e8] text-white shadow-md shadow-[#612bd3]/25" : "bg-zinc-100 hover:bg-zinc-200 dark:bg-[#201f1f] dark:hover:bg-[#262525] text-slate-900 dark:text-white border border-zinc-200 dark:border-[#2e2d2d]"
                }`}
              >
                {loadingPlan === plan.id ? "Loading checkout..." : "Purchase Credits"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
