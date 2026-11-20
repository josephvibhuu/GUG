# GUG Bourse — Development Session Notes (2026-11-20)

This file summarizes the bug fixes, security hardening, and feature additions completed during the development session, so future sessions can pick up cleanly from here.

---

## 1. Security Hardening, Race-Condition & Accounting Fixes (`e998454`)
- **Security & Auth**: Hardened endpoints and admin/founder authorization checks to prevent unauthorized access or privilege bypasses.
- **NFT & Trading Race Conditions**: Fixed concurrency/race-condition edge cases in order matching and NFT trading/bidding so balances, share counts, and ownership cannot be double-spent or desynced under simultaneous requests.
- **Accounting & Scheduled Dividends**: Fixed accounting discrepancies in treasury/ledger flows and added support for cancelling scheduled dividends before distribution.

---

## 2. Core Trading, Auction & UX Improvements (`de4e904`)
- **In-Place Order Editing**: Added `/api/orders/edit` and `modifyOrder` in `src/lib/engine.ts` so traders can edit open limit orders directly without cancelling and re-entering.
- **Auto-Settling Auctions**: Added automated auction settlement logic (via `/api/cron/tick-auctions`) so expired NFT auctions settle and transfer assets/gold automatically.
- **Market Pulse & Sorting**: Added `/api/market/pulse` and sorting/filtering controls across the market view.
- **Price Alerts & Auction Filters**: Added price alert notifications and search/filter controls on the NFT auction marketplace (`/auction`).

---

## 3. Growth, Footfall & Engagement Features (`f976d3f`)
- **Dividend Yield Percentage**: Added annualized/trailing Dividend Yield % calculations and display across company cards and market listings.
- **Live Floor Activity Ticker (Tape)**: Added a real-time scrolling floor tape showing recent trades and market activity across the bourse.
- **Cached Hall of Fame (`/leaderboard`)**: Built `/leaderboard` and `/api/leaderboard` with lightweight caching (keeping Vercel function load minimal) to showcase top traders, founders, and dividend earners without any sovereign state system.
- *(Note: Also drafted a Breadcoin donation & patron-badge Discord proposal for the Bread Church lore — intentionally not implemented yet.)*

---

## 4. Dynamic Shareholder Report PDF & Two-Tier IPO System (`68cd2ea`)
- **Dynamic Weekly Shareholder Report PDF**:
  - Replaced hardcoded Week 2 / Week 3 values (`weekNumber: 3`, `680.00` profit, static cutoff date) in `src/app/api/admin/shareholder-report/route.ts` with `computeDynamicGugReport`, which automatically computes the current week (Week 4 as of 2026-11-20) and live financials (`trades` commissions, `ipo_fee_collected`, `game_sales` deposit spread, and `company_ledger` COGS/income).
  - Updated `src/components/CompanyLedger.tsx` and `src/app/admin/AdminDashboard.tsx` to remove hardcoded Week 2/Week 3 text and guard admin-only report actions.
- **Two-Tier IPO Application & Fee System**:
  - Updated `src/lib/db.ts`, `src/lib/market.ts`, `src/lib/engine.ts`, and `src/app/api/ipo/route.ts` to support `listingTier` (`SELF_MANAGED` vs `ASSISTED`), `offeringRound`, and `ipoFeePct`.
  - **Full Manual Control (`SELF_MANAGED`)**: **200 gold** flat base fee deducted from first IPO share sales.
  - **Assisted & Supported IPO (`ASSISTED`)**: **200 gold** base fee **+ 10%** on Round 1, and **+ 5%** on Round 2+ follow-on listings (covering valuation, pricing, and dividend processing support).
  - Updated `src/app/ipo/page.tsx` with the tier selector + live fee preview and `src/app/admin/AdminDashboard.tsx` with tier/round badges on pending IPO applications.
