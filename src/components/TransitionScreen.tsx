"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, ExternalLink, ServerCog } from "lucide-react";
import { CoinMark } from "./CoinMark";

// Set to the new live URL once confirmed (e.g. "https://new-gug-domain.vercel.app"), or leave null to keep disabled.
const NEW_SITE_URL: string | null = null;

// Legacy deployment hostnames that should show the transition landing screen.
// Any new deployment domain (or localhost) bypasses this screen automatically.
const LEGACY_HOSTS = ["gug-exchange.vercel.app", "growurgold.vercel.app"];

export default function TransitionScreen() {
  const [isLegacyHost, setIsLegacyHost] = useState(false);

  useEffect(() => {
    try {
      const host = window.location.hostname.toLowerCase();
      if (LEGACY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
        setIsLegacyHost(true);
      }
    } catch {}
  }, []);

  if (!isLegacyHost) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Platform Transition Notice"
    >
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6">
        {/* Brand & Status Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <CoinMark />
            <span className="condensed text-2xl font-extrabold tracking-tight text-zinc-50">
              Grow Ur Gold
            </span>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold uppercase tracking-widest text-amber-400">
            <ServerCog className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            Deployment Migrating
          </span>
        </div>

        {/* Main Explanation */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">
            This Exchange Deployment Is Offline for Handover
          </h1>
          <p className="text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
            Grow Ur Gold has officially transitioned to new leadership (<strong className="text-zinc-200">Avemon</strong> &amp; <strong className="text-zinc-200">Dinomite</strong>) and is currently migrating infrastructure and databases to a new dedicated deployment.
          </p>
        </div>

        {/* Safety Guarantee Box */}
        <div className="w-full rounded-lg bg-emerald-950/25 border border-emerald-500/30 p-3.5 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[12px] text-zinc-300 leading-relaxed">
            <strong className="text-emerald-300 block mb-0.5">All Citizen Assets Are 100% Safe</strong>
            Every citizen balance, stock portfolio, and corporate treasury has been backed up and transferred intact to the new operators.
          </div>
        </div>

        {/* Reforward CTA (Greyed out until NEW_SITE_URL is confirmed) */}
        <div className="w-full flex flex-col items-center gap-2.5 pt-1">
          {NEW_SITE_URL ? (
            <a
              href={NEW_SITE_URL}
              className="w-full h-11 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <span>Proceed to New Grow Ur Gold Site</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full h-11 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-500 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-60 select-none"
              title="New site URL is not confirmed yet"
            >
              <span>Proceed to New Site (Link Pending Confirmation)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-[11px] text-zinc-500">
            The redirect button will activate as soon as the new deployment link is confirmed.
          </p>
        </div>

        {/* Discord Secondary Link */}
        <div className="w-full pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[12px] text-zinc-400">
          <span>Follow relaunch updates:</span>
          <a
            href="https://discord.gg/q3QA6WzHQZ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <span>Join Official Discord</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
