import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

interface LeaderboardCache {
  at: number;
  payload: {
    topInvestors: Array<{ username: string; displayName: string; totalNetWorth: number; stockValue: number; cashValue: number }>;
    dividendKings: Array<{ username: string; displayName: string; totalDividends: number; payoutsCount: number }>;
    topPromoters: Array<{ code: string; ownerName: string; totalReferred: number; totalVolume: number; totalEarned: number }>;
  };
}

let cache: LeaderboardCache | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, ...cache.payload, cached: true },
        { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
      );
    }

    await initDb();
    const db = getDb();

    const [usersRes, holdingsRes, divRes, refRes] = await Promise.all([
      db.execute(`
        SELECT id, username, display_name, cash_balance, locked_cash
        FROM users
        WHERE id NOT IN ('usr_treasury', 'usr_house', 'usr_bot')
          AND COALESCE(account_type, 'CITIZEN') != 'MANAGER'
          AND is_admin = 0
      `),
      db.execute(`
        SELECT p.user_id, (p.shares + p.locked_shares) as total_shares, c.current_price, c.creator_id, c.co_founder_id
        FROM portfolios p
        JOIN companies c ON p.company_id = c.id
        WHERE (p.shares + p.locked_shares) > 0
      `),
      db.execute(`
        SELECT u.username, u.display_name,
               COALESCE(SUM(dp.payout_amount), 0) as total_dividends,
               COUNT(*) as payouts_count
        FROM dividend_payouts dp
        JOIN users u ON dp.user_id = u.id
        WHERE u.id NOT IN ('usr_treasury', 'usr_house', 'usr_bot')
          AND u.is_admin = 0
        GROUP BY dp.user_id, u.username, u.display_name
        HAVING total_dividends > 0
        ORDER BY total_dividends DESC
        LIMIT 20
      `),
      db.execute(`
        SELECT code, owner_name, total_referred, total_volume, total_earned
        FROM referral_codes
        WHERE total_referred > 0 OR total_earned > 0
        ORDER BY total_earned DESC, total_volume DESC
        LIMIT 20
      `),
    ]);

    const stockValueByUser = new Map<string, number>();
    for (const r of holdingsRes.rows as any[]) {
      const uid = String(r.user_id);
      // Exclude founder's own company shares so unfloated equity doesn't skew investor rankings
      if (String(r.creator_id) === uid || (r.co_founder_id && String(r.co_founder_id) === uid)) continue;
      const val = Number(r.total_shares || 0) * Number(r.current_price || 0);
      stockValueByUser.set(uid, (stockValueByUser.get(uid) || 0) + val);
    }

    const topInvestors = (usersRes.rows as any[])
      .map((u) => {
        const uid = String(u.id);
        const cashValue = Math.round((Number(u.cash_balance || 0) + Number(u.locked_cash || 0)) * 100) / 100;
        const stockValue = Math.round((stockValueByUser.get(uid) || 0) * 100) / 100;
        const totalNetWorth = Math.round((cashValue + stockValue) * 100) / 100;
        return {
          username: String(u.username),
          displayName: String(u.display_name || u.username),
          totalNetWorth,
          stockValue,
          cashValue,
        };
      })
      .filter((u) => u.totalNetWorth > 0)
      .sort((a, b) => b.totalNetWorth - a.totalNetWorth)
      .slice(0, 20);

    const dividendKings = (divRes.rows as any[]).map((r) => ({
      username: String(r.username),
      displayName: String(r.display_name || r.username),
      totalDividends: Math.round(Number(r.total_dividends || 0) * 100) / 100,
      payoutsCount: Number(r.payouts_count || 0),
    }));

    const topPromoters = (refRes.rows as any[]).map((r) => ({
      code: String(r.code),
      ownerName: String(r.owner_name),
      totalReferred: Number(r.total_referred || 0),
      totalVolume: Math.round(Number(r.total_volume || 0) * 100) / 100,
      totalEarned: Math.round(Number(r.total_earned || 0) * 100) / 100,
    }));

    const payload = { topInvestors, dividendKings, topPromoters };
    cache = { at: Date.now(), payload };

    return NextResponse.json(
      { success: true, ...payload },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (error: any) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to load Hall of Fame" }, { status: 500 });
  }
}
