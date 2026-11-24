"use client";

import { useState, useEffect } from "react";
import { Building2, ShieldCheck, Users, Coins, ArrowRight, ExternalLink, X, Landmark, Code2, Globe2 } from "lucide-react";

interface AcquisitionNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AcquisitionNoticeModal({ isOpen, onClose }: AcquisitionNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/80 via-zinc-900 to-zinc-950 px-5 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  OFFICIAL EXECUTIVE NOTICE
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  GUG-ACQ-2026-N1
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-50 mt-0.5">
                Grow Ur Gold Seeking Buyer & Operational Successor
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[13px] text-zinc-300 leading-relaxed">
          {/* Executive Summary */}
          <div className="p-4 rounded-md bg-amber-950/20 border border-amber-500/20 text-zinc-200 space-y-2">
            <p className="font-medium text-amber-200 text-[14px]">
              Strategic Ownership & Operator Handover Announcement
            </p>
            <p className="text-zinc-300 text-[12px] leading-normal">
              After establishing Parlamentum&apos;s first sovereign capital market—scaling to <strong>160+ active citizens</strong>, 
              <strong> 10 publicly listed corporations</strong>, over <strong>18,700 Gold</strong> in citizen balance liquidity, 
              and audited weekly Friday dividend distributions—Founder & CEO <strong>JosephArora</strong> is officially seeking an 
              institutional buyer, investment syndicate, or ambitious operator to assume <strong>full platform ownership, maintenance, and hosting</strong>.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Live Exchange Scale & Traction
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Citizens</span>
                </div>
                <div className="text-lg font-bold text-zinc-100 font-mono">160+</div>
                <div className="text-[10px] text-zinc-500">Registered Traders</div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <Building2 className="w-3.5 h-3.5 text-bullion" />
                  <span>Enterprises</span>
                </div>
                <div className="text-lg font-bold text-zinc-100 font-mono">10</div>
                <div className="text-[10px] text-zinc-500">Listed Companies</div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                  <span>Liquidity</span>
                </div>
                <div className="text-lg font-bold text-zinc-100 font-mono">18.7k+</div>
                <div className="text-[10px] text-zinc-500">Gold User Balances</div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Languages</span>
                </div>
                <div className="text-lg font-bold text-zinc-100 font-mono">EN / TR / ID</div>
                <div className="text-[10px] text-zinc-500">Multi-Language UI</div>
              </div>
            </div>
          </div>

          {/* What is Included in the Handover */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              What the Acquisition / Handover Includes
            </h3>
            <ul className="space-y-2 text-zinc-300 text-[12px]">
              <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded border border-zinc-800/80">
                <Code2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Full Proprietary Tech Stack:</strong> Next.js 16 (Turbopack) + TypeScript exchange engine, limit order matching, live candles, PDF dividend reports, and automated deposit/withdrawal rails.</span>
              </li>
              <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded border border-zinc-800/80">
                <Landmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Turnkey Infrastructure & Database:</strong> Turso Cloud SQL database containing all historical trade ledgers, user accounts, and corporate float registries.</span>
              </li>
              <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded border border-zinc-800/80">
                <Globe2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Complete Domain & Hosting Transfer:</strong> GitHub repository, Vercel deployments (<code className="text-amber-300">growurgold.vercel.app</code> / <code className="text-amber-300">gug-exchange.vercel.app</code>), and developer secrets.</span>
              </li>
              <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded border border-zinc-800/80">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ecosystem Integrations:</strong> Active CIVIX Unified Passport SSO connection and Discord automated trade webhook alerts.</span>
              </li>
            </ul>
          </div>

          {/* Citizen Security Guarantee */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-md flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[12px] text-zinc-300 leading-normal">
              <strong className="text-emerald-300 block mb-0.5">100% Citizen Asset Protection Guarantee:</strong>
              All citizen gold purses, stock portfolio shares, and dividend accruals remain fully safeguarded and intact during this transition. Trading operations remain open.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-900/90 px-5 py-3.5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400">
            Interested buyers: Connect via Discord <strong className="text-amber-300">@JosephArora</strong>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://discord.gg/q3QA6WzHQZ"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[12px] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Join Discord</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-[12px] transition-colors"
            >
              Enter Exchange
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
