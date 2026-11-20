"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sparkline from "@/components/Sparkline";
import { FloorStrip } from "@/components/FloorClock";
import { useMarketFeed } from "@/hooks/useMarketFeed";
import { fmtPrice, fmtPct, fmtCompact, moveColor } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const WATCHLIST_KEY = "gug_watchlist";

function useWatchlist() {
  const [starred, setStarred] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });

  const toggle = (ticker: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  return { starred, toggle };
}

type SortField = "marketCap" | "currentPrice" | "change24h" | "volume24h" | "weeklyRevenue" | "dividendYieldPct";

function timeAgoShort(iso: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { loaded, companies, schedule, clockOffset, sparklines, floorTrades } = useMarketFeed();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("marketCap");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const { starred, toggle } = useWatchlist();

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const pulse = useMemo(() => {
    if (!companies.length) return null;
    const totalVol = companies.reduce((s, c) => s + (c.volume24h || 0), 0);
    const totalMcap = companies.reduce((s, c) => s + (c.marketCap || 0), 0);
    const topGainer = [...companies].sort((a, b) => (b.change24h || 0) - (a.change24h || 0))[0];
    const activeCount = companies.filter((c) => c.status === "ACTIVE").length;
    return { totalVol, totalMcap, topGainer, activeCount };
  }, [companies]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? companies
      : companies.filter((c) => [c.ticker, c.name, c.sector].some((v) => v.toLowerCase().includes(q)));
    const mult = sortDir === "desc" ? -1 : 1;
    // Starred companies float to the top, then sort by selected column
    return [...filtered].sort((a, b) => {
      const aS = starred.has(a.ticker) ? 0 : 1;
      const bS = starred.has(b.ticker) ? 0 : 1;
      if (aS !== bS) return aS - bS;
      const av = Number(a[sortBy] || 0);
      const bv = Number(b[sortBy] || 0);
      return (av - bv) * mult;
    });
  }, [companies, query, starred, sortBy, sortDir]);

  const sortArrow = (field: SortField) => (sortBy === field ? (sortDir === "desc" ? " ↓" : " ↑") : "");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 sm:gap-10">
        <FloorStrip schedule={schedule} clockOffset={clockOffset} />

        {pulse && (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule rounded-[4px] overflow-hidden">
              <div className="bg-floor px-4 py-3">
                <dt className="text-[11px] text-ash">Total Market Cap</dt>
                <dd className="condensed text-[18px] font-bold text-zinc-50 tabular">{fmtCompact(pulse.totalMcap)} gold</dd>
              </div>
              <div className="bg-floor px-4 py-3">
                <dt className="text-[11px] text-ash">24h Floor Volume</dt>
                <dd className="condensed text-[18px] font-bold text-bullion tabular">{fmtCompact(pulse.totalVol)} gold</dd>
              </div>
              <div className="bg-floor px-4 py-3">
                <dt className="text-[11px] text-ash">Top 24h Mover</dt>
                <dd className="condensed text-[18px] font-bold tabular">
                  <Link href={`/trade/${pulse.topGainer.ticker}`} className="hover:underline text-zinc-50">
                    ${pulse.topGainer.ticker}
                  </Link>{" "}
                  <span className={moveColor(pulse.topGainer.change24h)}>{fmtPct(pulse.topGainer.change24h)}</span>
                </dd>
              </div>
              <div className="bg-floor px-4 py-3">
                <dt className="text-[11px] text-ash">Active Listings</dt>
                <dd className="condensed text-[18px] font-bold text-zinc-50 tabular">{pulse.activeCount} / {companies.length}</dd>
              </div>
            </dl>

            {floorTrades.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px] tabular">
                <span className="shrink-0 text-[11px] font-semibold text-ash uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse" />
                  Floor tape
                </span>
                {floorTrades.map((ft) => (
                  <Link
                    key={ft.id}
                    href={`/trade/${ft.ticker}`}
                    className="shrink-0 px-2.5 py-1 rounded-[4px] border border-rule bg-pane hover:border-zinc-500 text-paper flex items-center gap-1.5 transition"
                  >
                    <span className="font-bold text-zinc-50">${ft.ticker}</span>
                    <span>{ft.quantity} sh @ {fmtPrice(ft.price)}g</span>
                    <span className="text-ash text-[11px]">{timeAgoShort(ft.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <section aria-labelledby="listings" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="listings" className="text-[15px] font-semibold text-zinc-50">
              Listed companies <span className="text-ash font-normal tabular">{loaded ? companies.length : ""}</span>
            </h2>
            {companies.length > 3 && (
              <label className="relative w-full sm:w-auto">
                <span className="sr-only">Search companies</span>
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("markets.searchPlaceholder")}
                  className="h-9 sm:h-8 w-full sm:w-64 rounded-[4px] border border-rule bg-floor pl-8 pr-2 text-[13px] text-paper placeholder:text-ash focus:outline-none focus:border-zinc-500"
                />
              </label>
            )}
          </div>

          {loaded && companies.length === 0 ? (
            <div className="border border-rule rounded-[4px] px-6 py-12 flex flex-col items-start gap-3">
              <p className="text-[15px] text-zinc-50 font-semibold">No companies are listed yet.</p>
              <p className="text-sm text-ash max-w-md">
                Apply to list yours: pick a ticker, a share count and a price. The operator reviews it before the first shares go on sale.
              </p>
              <Link href="/ipo" className="mt-1 h-9 px-4 rounded-[4px] bg-bullion hover:bg-amber-300 text-floor text-[13px] font-semibold flex items-center">
                List a company
              </Link>
            </div>
          ) : (
            <div className="border border-rule rounded-[4px] overflow-hidden">
              <table className="w-full text-[13px] tabular">
                <thead>
                  <tr className="text-[12px] text-ash border-b border-rule">
                    <th scope="col" className="w-7 py-2.5 pl-3 sm:pl-4 pr-0 hidden sm:table-cell" aria-label="Watchlist" />
                    <th scope="col" className="text-left font-normal py-2.5 pl-3 sm:pl-2 pr-2">{t("markets.thCompany")}</th>
                    <th scope="col" className="text-right font-normal py-2.5 px-2">
                      <button type="button" onClick={() => toggleSort("currentPrice")} className="hover:text-paper cursor-pointer">
                        {t("markets.thPrice")}{sortArrow("currentPrice")}
                      </button>
                    </th>
                    <th scope="col" className="text-right font-normal py-2.5 pl-2 pr-3 sm:px-2">
                      <button type="button" onClick={() => toggleSort("change24h")} className="hover:text-paper cursor-pointer">
                        {t("markets.th24h")}{sortArrow("change24h")}
                      </button>
                    </th>
                    <th scope="col" className="text-right font-normal py-2.5 px-2 hidden md:table-cell">
                      <button type="button" onClick={() => toggleSort("dividendYieldPct")} className="hover:text-paper cursor-pointer" title="Latest weekly dividend per share / current price">
                        Div Yield{sortArrow("dividendYieldPct")}
                      </button>
                    </th>
                    <th scope="col" className="text-right font-normal py-2.5 px-2 hidden md:table-cell">
                      <button type="button" onClick={() => toggleSort("volume24h")} className="hover:text-paper cursor-pointer">
                        {t("markets.thVolume")}{sortArrow("volume24h")}
                      </button>
                    </th>
                    <th scope="col" className="text-right font-normal py-2.5 px-2 hidden sm:table-cell">
                      <button type="button" onClick={() => toggleSort("marketCap")} className="hover:text-paper cursor-pointer">
                        {t("markets.thMarketCap")}{sortArrow("marketCap")}
                      </button>
                    </th>
                    <th scope="col" className="text-right font-normal py-2.5 px-2 hidden md:table-cell">
                      <button type="button" onClick={() => toggleSort("weeklyRevenue")} className="hover:text-paper cursor-pointer">
                        {t("trade.weeklyRevenue")}{sortArrow("weeklyRevenue")}
                      </button>
                    </th>
                    <th scope="col" className="text-right font-normal py-2.5 pl-2 pr-4 hidden lg:table-cell">14 days</th>
                  </tr>
                </thead>
                <tbody>
                  {!loaded &&
                    [0, 1, 2].map((i) => (
                      <tr key={i} className="border-b border-rule last:border-0">
                        <td colSpan={9} className="h-[57px]">
                          <div className="mx-4 h-3 w-40 rounded bg-pane" />
                        </td>
                      </tr>
                    ))}
                  {rows.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/trade/${c.ticker}`)}
                      className="border-b border-rule last:border-0 hover:bg-pane cursor-pointer"
                    >
                      {/* Star / watchlist toggle */}
                      <td className="py-2.5 pl-3 sm:pl-4 pr-0 w-7 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggle(c.ticker)}
                          aria-label={starred.has(c.ticker) ? `Unstar ${c.ticker}` : `Star ${c.ticker}`}
                          className="flex items-center justify-center w-5 h-5 rounded hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-3.5 h-3.5 transition-colors ${starred.has(c.ticker) ? "fill-amber-400 text-amber-400" : "text-zinc-600 hover:text-amber-400"}`}
                          />
                        </button>
                      </td>
                      <td className="py-2.5 pl-3 sm:pl-2 pr-2">
                        <Link href={`/trade/${c.ticker}`} className="flex items-center gap-3 min-w-0" onClick={(e) => e.stopPropagation()}>
                          <span className="h-8 w-8 shrink-0 rounded-[4px] bg-pane border border-rule flex items-center justify-center text-base" aria-hidden>
                            {c.logoUrl}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="condensed font-bold text-[15px] text-zinc-50 tracking-tight">{c.ticker}</span>
                              {c.status !== "ACTIVE" && (
                                <span className="text-[11px] px-1.5 rounded-[3px] border border-bear/50 text-bear">
                                  {c.status === "HALTED" ? "Halted" : "Defaulted"}
                                </span>
                              )}
                            </span>
                            <span className="block text-[12px] text-ash truncate max-w-[160px] sm:max-w-[320px]">{c.name}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-50 font-medium">{fmtPrice(c.currentPrice)}</td>
                      <td className={`py-2.5 pl-2 pr-3 sm:px-2 text-right ${moveColor(c.change24h)}`}>{fmtPct(c.change24h)}</td>
                      <td className="py-2.5 px-2 text-right text-bullion hidden md:table-cell">
                        {c.dividendYieldPct && c.dividendYieldPct > 0 ? `${c.dividendYieldPct.toFixed(2)}%` : "–"}
                      </td>
                      <td className="py-2.5 px-2 text-right text-paper hidden md:table-cell">{fmtCompact(c.volume24h)}</td>
                      <td className="py-2.5 px-2 text-right text-paper hidden sm:table-cell">{fmtCompact(c.marketCap)}</td>
                      <td className="py-2.5 px-2 text-right text-paper hidden md:table-cell">{c.weeklyRevenue ? fmtCompact(c.weeklyRevenue) : "–"}</td>
                      <td className="py-2.5 pl-2 pr-4 hidden lg:table-cell">
                        <span className="flex justify-end">
                          <Sparkline points={sparklines[c.id]} />
                        </span>
                      </td>
                    </tr>
                  ))}
                  {loaded && companies.length > 0 && rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 px-4 text-ash">No company matches “{query}”.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[12px] text-ash">
            Prices and volumes in gold. 24h compares with the last trade before the previous 24 hours. Revenue is the founder&apos;s estimate.
          </p>
        </section>

        <section aria-labelledby="next" className="border-t border-rule pt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[13px]">
          <h2 id="next" className="text-ash">Coming soon</h2>
          <Link href="/auction" className="text-paper hover:text-zinc-50 underline underline-offset-4 decoration-rule">Auction House</Link>
          <Link href="/crypto" className="text-paper hover:text-zinc-50 underline underline-offset-4 decoration-rule">BREADCOIN</Link>
          <Link href="/funds" className="text-paper hover:text-zinc-50 underline underline-offset-4 decoration-rule">GUG funds</Link>
        </section>
      </main>
    </div>
  );
}
