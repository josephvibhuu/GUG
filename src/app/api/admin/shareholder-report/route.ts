import { NextResponse } from "next/server";
import { getDb, initDb, scheduleBlobPersist } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reportEarningsAndDividend } from "@/lib/dividends";

const GENESIS_MS = Date.parse("2026-10-23T00:00:00.000Z");
const WEEK_MS = 7 * 86400 * 1000;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatUtcLabel(iso: string): string {
  return new Date(iso).toUTCString().replace("GMT", "UTC");
}

async function computeDynamicGugReport(payoutPercentOverride?: number) {
  const db = getDb();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const calendarWeek = Math.max(1, Math.ceil((nowMs - GENESIS_MS) / WEEK_MS));
  const currentWeekStartIso = new Date(GENESIS_MS + (calendarWeek - 1) * WEEK_MS).toISOString();

  // Check past distributed reports for GUG
  const reportsRes = await db.execute({
    sql: `SELECT id, period_title, net_profit, total_distributed, dividend_percent, status, created_at, distributed_at
          FROM earnings_reports
          WHERE company_id = 'cmp_gug_001'
          ORDER BY created_at DESC`,
    args: [],
  });

  const distributedReports = reportsRes.rows.filter((r) => r.status === "DISTRIBUTED");
  const distributedCount = distributedReports.length;
  const weekNumber = Math.max(calendarWeek, distributedCount + 1);

  const existingWeekReport =
    distributedReports.find(
      (r) =>
        String(r.period_title || "").includes(`Week ${weekNumber}`) ||
        String(r.created_at || "") >= currentWeekStartIso
    ) || null;

  const latestReport = distributedReports[0];
  const periodStartIso = latestReport
    ? String(latestReport.distributed_at || latestReport.created_at)
    : new Date(nowMs - WEEK_MS).toISOString();

  // 1. Secondary Market volume in current reporting period
  const tradesRes = await db.execute({
    sql: "SELECT count(*) as count, COALESCE(sum(total), 0) as volume FROM trades WHERE created_at >= ?",
    args: [periodStartIso],
  });
  const tradesVolume = round2(Number(tradesRes.rows[0]?.volume || 0));
  const tradesCount = Number(tradesRes.rows[0]?.count || 0);
  const tradeCommissions = round2(tradesVolume * 0.01);

  // 2. New IPO Charter Fees collected in current reporting period
  const ipoFeesRes = await db.execute({
    sql: "SELECT COALESCE(sum(ipo_fee_collected), 0) as total_charter, count(*) as count FROM companies WHERE created_at >= ? AND ipo_fee_collected > 0",
    args: [periodStartIso],
  });
  const charterFees = round2(Number(ipoFeesRes.rows[0]?.total_charter || 0));
  const charterCompaniesCount = Number(ipoFeesRes.rows[0]?.count || 0);

  // 3. Deposit Rail in current reporting period
  const depositSales = await db.execute({
    sql: "SELECT COALESCE(sum(units), 0) as units, COALESCE(sum(gross), 0) as gross, COALESCE(sum(tax), 0) as tax, COALESCE(sum(gold), 0) as net FROM game_sales WHERE at >= ?",
    args: [periodStartIso],
  });
  const depositGross = round2(Number(depositSales.rows[0]?.gross || 0));
  const depositUnits = Number(depositSales.rows[0]?.units || 0);
  const depositTax = round2(Number(depositSales.rows[0]?.tax || 0));
  const depositNet = round2(Number(depositSales.rows[0]?.net || 0));
  const depositNetMargin = depositTax > 0 ? depositTax : round2(Math.max(0, depositGross - depositNet));

  // 4. Company ledger income & expenses (COGS) in current reporting period
  const ledgerRes = await db.execute({
    sql: `SELECT
            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expenses,
            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income
          FROM company_ledger
          WHERE company_id = 'cmp_gug_001' AND created_at >= ?`,
    args: [periodStartIso],
  });
  const cogsExpenses = round2(Number(ledgerRes.rows[0]?.expenses || 0));
  const ledgerIncome = round2(Number(ledgerRes.rows[0]?.income || 0));

  const grossRevenue = round2(tradeCommissions + charterFees + depositNetMargin + ledgerIncome);
  const operatingExpenses = cogsExpenses;
  const computedNetProfit = round2(Math.max(0, grossRevenue - operatingExpenses));

  const netProfit = existingWeekReport
    ? round2(Number(existingWeekReport.net_profit || computedNetProfit))
    : computedNetProfit;
  const payoutPercent =
    payoutPercentOverride !== undefined
      ? payoutPercentOverride
      : existingWeekReport
      ? Number(existingWeekReport.dividend_percent || 50)
      : 50;
  const totalPayout = round2((netProfit * payoutPercent) / 100);

  // 5. Cap Table breakdown for GUG
  const companyRes = await db.execute({
    sql: "SELECT total_shares FROM companies WHERE id = 'cmp_gug_001'",
    args: [],
  });
  const totalShares = Number(companyRes.rows[0]?.total_shares || 10000);

  const gugPortfolios = await db.execute(`
    SELECT p.user_id, u.username, p.shares
    FROM portfolios p
    JOIN users u ON p.user_id = u.id
    WHERE p.company_id = 'cmp_gug_001' AND p.shares > 0
  `);

  let publicShares = 0;
  for (const row of gugPortfolios.rows) {
    if (row.username !== "JosephArora" && row.user_id !== "usr_josepharora") {
      publicShares += Number(row.shares);
    }
  }
  const perShare = totalShares > 0 ? Math.round((totalPayout / totalShares) * 10000) / 10000 : 0;
  const publicPayout = round2(perShare * publicShares);

  // 6. All-Time stats
  const allTrades = await db.execute("SELECT COALESCE(sum(total), 0) as vol FROM trades");
  const totalAllTimeVolume = round2(Number(allTrades.rows[0]?.vol || 0));

  const pastDivs = await db.execute(
    "SELECT COALESCE(sum(total_distributed), 0) as total_divs, COALESCE(sum(net_profit), 0) as total_profit FROM earnings_reports WHERE company_id = 'cmp_gug_001' AND status = 'DISTRIBUTED'"
  );
  const pastTotalDivs = Number(pastDivs.rows[0]?.total_divs || 0);
  const pastTotalProfit = Number(pastDivs.rows[0]?.total_profit || 0);

  const publicDivsRes = await db.execute(`
    SELECT COALESCE(sum(dp.amount), 0) as public_paid
    FROM dividend_payouts dp
    JOIN earnings_reports er ON dp.report_id = er.id
    WHERE er.company_id = 'cmp_gug_001' AND dp.user_id != 'usr_josepharora'
  `);
  const pastPublicPaid = Number(publicDivsRes.rows[0]?.public_paid || 0);

  const allTimePaidOut = existingWeekReport ? round2(pastTotalDivs) : round2(pastTotalDivs + totalPayout);
  const allTimeNetProfit = existingWeekReport ? round2(pastTotalProfit) : round2(pastTotalProfit + netProfit);
  const allTimePublicFloatPaid = existingWeekReport ? round2(pastPublicPaid) : round2(pastPublicPaid + publicPayout);

  return {
    alreadyFiled: existingWeekReport !== null,
    existingReport: existingWeekReport,
    weekNumber,
    grossRevenue,
    operatingExpenses,
    cardData: {
      ticker: "GUG",
      companyName: "Grow UR Gold",
      weekNumber,
      periodStart: formatUtcLabel(periodStartIso),
      periodEnd: formatUtcLabel(nowIso),
      generatedDate: formatUtcLabel(nowIso),
      payoutDate: formatUtcLabel(nowIso),
      netProfit,
      payoutPercent,
      totalPayout,
      perShare,
      publicShares,
      publicPayout,
      totalShares,
      operations: {
        tradesCount,
        tradesVolume,
        tradeCommissions,
        charterFees,
        charterCompaniesCount,
        depositGross,
        depositUnits,
        depositNetMargin,
        cogsExpenses,
      },
      sinceLaunch: {
        totalVolume: totalAllTimeVolume,
        allTimeNetProfit,
        allTimePaidOut,
        allTimePublicFloatPaid,
      },
    },
  };
}

export async function GET() {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || (!user.isAdmin && !user.isManager)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const report = await computeDynamicGugReport();

    return NextResponse.json({
      success: true,
      alreadyFiled: report.alreadyFiled,
      existingReport: report.existingReport,
      cardData: report.cardData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("GET /api/admin/shareholder-report error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const user = await getCurrentUser();

    if (!user || (!user.isAdmin && !user.isManager)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, payoutPercent = 50, netProfit: overrideNetProfit } = body;

    if (action === "file_and_distribute") {
      const pct = Number(payoutPercent) || 50;
      const report = await computeDynamicGugReport(pct);

      if (report.alreadyFiled) {
        return NextResponse.json(
          { success: false, message: `Week ${report.weekNumber} has already been filed and distributed.` },
          { status: 400 }
        );
      }

      const finalNetProfit =
        overrideNetProfit !== undefined && !Number.isNaN(Number(overrideNetProfit))
          ? round2(Math.max(0, Number(overrideNetProfit)))
          : report.cardData.netProfit;
      const finalGrossRevenue =
        overrideNetProfit !== undefined
          ? round2(finalNetProfit + report.operatingExpenses)
          : report.grossRevenue;

      const result = await reportEarningsAndDividend({
        companyId: "cmp_gug_001",
        reporterId: "usr_josepharora",
        periodTitle: `Week ${report.weekNumber} — Audited Operating Profit & Dividend Distribution`,
        grossRevenue: finalGrossRevenue,
        operatingExpenses: report.operatingExpenses,
        netProfit: finalNetProfit,
        dividendPercent: pct,
        distributeImmediately: true,
        notes: `Week ${report.weekNumber} operational profits (Trading commissions: ${report.cardData.operations.tradeCommissions.toFixed(2)}g across ${report.cardData.operations.tradesVolume.toFixed(2)}g volume, IPO charter fees: ${report.cardData.operations.charterFees.toFixed(2)}g, Deposit rail spread: ${report.cardData.operations.depositNetMargin.toFixed(2)}g, less ${report.operatingExpenses.toFixed(2)}g COGS). Distributed ${pct}% payout to all shareholders.`,
      });

      scheduleBlobPersist();

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Week ${report.weekNumber} profits successfully filed and dividends distributed to all GUG shareholders!`,
        reportId: result.reportId,
        weekNumber: report.weekNumber,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/admin/shareholder-report error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
