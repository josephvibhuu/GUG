import { NextResponse, after } from "next/server";
import { getAllCompanies, getSparklines, getRecentFloorTrades } from "@/lib/market";
import { seedMarketData } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { getMarketSchedule } from "@/lib/marketHours";
import { maybeWatch } from "@/lib/watcher";

export async function GET() {
  try {
    await seedMarketData();
    // Page loads are when the watcher looks at the game for new Raw Iron deposits (at most once a minute)
    after(() => maybeWatch());
    const [companies, user, marketSchedule, sparklines, floorTrades] = await Promise.all([
      getAllCompanies(),
      getCurrentUser(),
      getMarketSchedule(),
      getSparklines(),
      getRecentFloorTrades(8),
    ]);

    return NextResponse.json({
      success: true,
      companies,
      user,
      marketSchedule,
      sparklines,
      floorTrades,
      serverNow: Date.now(),
    });
  } catch (error) {
    console.error("API /api/market error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
