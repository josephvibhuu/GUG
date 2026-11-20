"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Trophy, Coins, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { fmtGold } from "@/lib/format";

interface InvestorRow {
  username: string;
  displayName: string;
  totalNetWorth: number;
  stockValue: number;
  cashValue: number;
}

interface DividendKingRow {
  username: string;
  displayName: string;
  totalDividends: number;
  payoutsCount: number;
}

interface PromoterRow {
  code: string;
  ownerName: string;
  totalReferred: number;
  totalVolume: number;
  totalEarned: number;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"investors" | "dividends" | "promoters">("investors");
  const [loading, setLoading] = useState(true);
  const [topInvestors, setTopInvestors] = useState<InvestorRow[]>([]);
  const [dividendKings, setDividendKings] = useState<DividendKingRow[]>([]);
  const [topPromoters, setTopPromoters] = useState<PromoterRow[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d.success) return;
        setTopInvestors(d.topInvestors || []);
        setDividendKings(d.dividendKings || []);
        setTopPromoters(d.topPromoters || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const medal = (idx: number) => (idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
        <Link href="/" className="self-start text-[13px] text-ash hover:text-paper flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Markets
        </Link>

        <header className="flex flex-col gap-1.5">
          <h1 className="condensed text-[28px] font-extrabold text-zinc-50 tracking-tight flex items-center gap-2.5 leading-none">
            <Trophy className="h-6 w-6 text-bullion" />
            Exchange Hall of Fame
          </h1>
          <p className="text-[13px] text-ash">
            Top citizens ranked by secondary market capital, passive dividend income, and referral volume. Updated every minute.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-rule pb-3">
          <button
            type="button"
            onClick={() => setTab("investors")}
            className={`h-9 px-3.5 rounded-[4px] border text-[13px] flex items-center gap-2 cursor-pointer transition ${
              tab === "investors" ? "bg-rule border-zinc-500 text-zinc-50 font-semibold" : "bg-floor border-rule text-ash hover:text-paper"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-bullion" />
            Top Investors
          </button>
          <button
            type="button"
            onClick={() => setTab("dividends")}
            className={`h-9 px-3.5 rounded-[4px] border text-[13px] flex items-center gap-2 cursor-pointer transition ${
              tab === "dividends" ? "bg-rule border-zinc-500 text-zinc-50 font-semibold" : "bg-floor border-rule text-ash hover:text-paper"
            }`}
          >
            <Coins className="h-4 w-4 text-bull" />
            Dividend Kings
          </button>
          <button
            type="button"
            onClick={() => setTab("promoters")}
            className={`h-9 px-3.5 rounded-[4px] border text-[13px] flex items-center gap-2 cursor-pointer transition ${
              tab === "promoters" ? "bg-rule border-zinc-500 text-zinc-50 font-semibold" : "bg-floor border-rule text-ash hover:text-paper"
            }`}
          >
            <Users className="h-4 w-4 text-sky-400" />
            Top Promoters
          </button>
        </div>

        <div className="border border-rule rounded-[4px] overflow-hidden bg-floor">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-ash">Loading Hall of Fame…</div>
          ) : tab === "investors" ? (
            <table className="w-full text-[13px] tabular">
              <thead>
                <tr className="text-[12px] text-ash border-b border-rule bg-pane">
                  <th className="py-2.5 pl-4 pr-2 text-left font-normal w-14">Rank</th>
                  <th className="py-2.5 px-2 text-left font-normal">Citizen</th>
                  <th className="py-2.5 px-2 text-right font-normal hidden sm:table-cell">Market Holdings</th>
                  <th className="py-2.5 px-2 text-right font-normal hidden sm:table-cell">Purse</th>
                  <th className="py-2.5 pl-2 pr-4 text-right font-normal">Total Capital</th>
                </tr>
              </thead>
              <tbody>
                {topInvestors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-ash">No active investors yet.</td>
                  </tr>
                ) : (
                  topInvestors.map((row, idx) => (
                    <tr key={row.username} className="border-b border-rule last:border-0 hover:bg-pane/50">
                      <td className="py-2.5 pl-4 pr-2 font-bold text-zinc-50">{medal(idx)}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-zinc-50">{row.displayName}</div>
                        <div className="text-[11px] text-ash">@{row.username}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right text-paper hidden sm:table-cell">{fmtGold(row.stockValue)} g</td>
                      <td className="py-2.5 px-2 text-right text-ash hidden sm:table-cell">{fmtGold(row.cashValue)} g</td>
                      <td className="py-2.5 pl-2 pr-4 text-right font-bold text-bullion">{fmtGold(row.totalNetWorth)} g</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : tab === "dividends" ? (
            <table className="w-full text-[13px] tabular">
              <thead>
                <tr className="text-[12px] text-ash border-b border-rule bg-pane">
                  <th className="py-2.5 pl-4 pr-2 text-left font-normal w-14">Rank</th>
                  <th className="py-2.5 px-2 text-left font-normal">Citizen</th>
                  <th className="py-2.5 px-2 text-right font-normal hidden sm:table-cell">Payouts</th>
                  <th className="py-2.5 pl-2 pr-4 text-right font-normal">Dividends Earned</th>
                </tr>
              </thead>
              <tbody>
                {dividendKings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-ash">No dividends distributed yet.</td>
                  </tr>
                ) : (
                  dividendKings.map((row, idx) => (
                    <tr key={row.username} className="border-b border-rule last:border-0 hover:bg-pane/50">
                      <td className="py-2.5 pl-4 pr-2 font-bold text-zinc-50">{medal(idx)}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-zinc-50">{row.displayName}</div>
                        <div className="text-[11px] text-ash">@{row.username}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right text-ash hidden sm:table-cell">{row.payoutsCount}</td>
                      <td className="py-2.5 pl-2 pr-4 text-right font-bold text-bull">{fmtGold(row.totalDividends)} g</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-[13px] tabular">
              <thead>
                <tr className="text-[12px] text-ash border-b border-rule bg-pane">
                  <th className="py-2.5 pl-4 pr-2 text-left font-normal w-14">Rank</th>
                  <th className="py-2.5 px-2 text-left font-normal">Promoter</th>
                  <th className="py-2.5 px-2 text-right font-normal">Invited</th>
                  <th className="py-2.5 px-2 text-right font-normal hidden sm:table-cell">Volume Driven</th>
                  <th className="py-2.5 pl-2 pr-4 text-right font-normal">Earned</th>
                </tr>
              </thead>
              <tbody>
                {topPromoters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-ash">No referral activity yet.</td>
                  </tr>
                ) : (
                  topPromoters.map((row, idx) => (
                    <tr key={row.code} className="border-b border-rule last:border-0 hover:bg-pane/50">
                      <td className="py-2.5 pl-4 pr-2 font-bold text-zinc-50">{medal(idx)}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-zinc-50">@{row.ownerName}</div>
                        <div className="text-[11px] text-ash">Code: {row.code}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right text-paper">{row.totalReferred}</td>
                      <td className="py-2.5 px-2 text-right text-ash hidden sm:table-cell">{fmtGold(row.totalVolume)} g</td>
                      <td className="py-2.5 pl-2 pr-4 text-right font-bold text-bullion">{fmtGold(row.totalEarned)} g</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
