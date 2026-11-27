# Grow Ur Gold (GUG) — Complete Operator & Developer Handover Guide

> **Effective Date:** November 27, 2026  
> **Outgoing Operator / Founder:** JosephArora (`usr_josepharora`)  
> **Incoming Consortium Ownership:** **Avemon** (`2,500g` / `62.5%`) & **Dinomite / Bug** (`1,500g` / `37.5%`)  
> **Lead Technical & Operations Operator:** Dinomite (`github.com/realbluedinomite`)

Welcome to the official technical, financial, and operational handover manual for **Grow Ur Gold (GUG)** — Parlamentum's sovereign stock exchange and capital markets hub.

---

## 1. Executive Summary & Deal Snapshot

As of **November 27, 2026**, the live platform holds:
* **164 Total Accounts** (162 public citizen/state accounts + `JosephArora` + `ExchangeTreasury`)
* **10 Listed Companies** (7 Active, 1 Halted: `$BOK`, 2 Liquidated: `$DC` & `$EI`)
* **489 Historical Matched Trades**
* **1 Pending Deposit Announcement:** `tx_560dc108` (`Canadian_Camo`, `50g`, `MARKET_IRON`, `2026-11-26T04:10:35Z`) — verify in-game before crediting or rejecting.
* **0 Pending Withdrawals** (Queue is 100% clear).

### Verified Cutover Balance Sheet (Nov 27, 2026)

| Ledger Component | Exact Balance | Notes |
| :--- | ---: | :--- |
| **Public Citizen Liquid + Locked Cash** | **`20,117.03g`** | Sum across all 162 public/state citizen accounts |
| **External Company Treasuries** | **`5,839.21g`** | `$BOMF` (`4,538.46g`), `$DC` (`687.00g` liquidated), `$EGW` (`378.04g`), `$LOL` (`94.85g`), `$ZAP` (`80.27g`), `$SILV` (`60.59g`), `$BCKRM` (`0.00g`), `$BOK` (`0.00g`) |
| **`$GUG` Company Treasury** | **`500.00g`** | Reconciled after `CardinalSanjay` 109-share buyback & pre-sale operating expenses |
| **Total Vault Backing Required** | **`26,456.24g`** | Total gold backing owed across citizens, external companies & `$GUG` treasury |
| **Less Agreed Acquisition Price** | **`−4,000.00g`** | Avemon (`2,500g`) + Dinomite (`1,500g`) |
| **Net Vault Transfer from JosephArora** | **`22,456.24g`** | Physical gold transferred in-game to new operator vault |

*(Note: `ExchangeTreasury` `usr_treasury` and `JosephArora` `usr_josepharora` balances represent pre-handover house fee ledgers already settled under the sale agreement).*

---

## 2. Repository & Database Delivery (Important Security Note)

Because this GitHub repository is **public** (`private: false`), **live database dumps and environment secrets are NEVER committed into Git** (to protect citizen password hashes, `SESSION_SECRET`, and Parlamentum authentication tokens).

You should receive the database snapshot privately (via Discord DM from JosephArora):
1. `gug-full-db-2026-11-27.sql` (~1.05 MB full SQL dump of all 29 GUG tables, `2,654` rows — with Joseph's personal `watcher_token` wiped for security).
2. `parlamentum_market.db` (~1.23 MB ready-to-use SQLite database file).

---

## 3. Tech Stack & Project Structure

* **Framework:** Next.js `16.4.6` (App Router + Turbopack), React `19.3.0`, TypeScript `5`
* **Styling:** Tailwind CSS v4 + Lucide Icons
* **Database:** Turso Cloud LibSQL (`@libsql/client`) with local SQLite fallback (`parlamentum_market.db`)
* **Charts & PDF:** `lightweight-charts` v5.2.1 (candlesticks), `jspdf` + `jspdf-autotable` (Audit Ledger PDF)
* **Localization:** Built-in `I18nProvider` (`EN`, `TR`, `ID`) in `src/lib/i18n.tsx`

### Key File Map
```text
src/
├── app/
│   ├── page.tsx                    # Market homepage (listings table, search, watchlist, floor clock)
│   ├── admin/
│   │   ├── page.tsx                # Operator Desk wrapper
│   │   └── AdminDashboard.tsx      # Full admin panel (Deposits, Withdrawals, IPOs, Watcher, Dividends, Audit PDF)
│   ├── trade/[ticker]/page.tsx     # Stock terminal (order book, candlestick chart, company ledger, buy/sell)
│   ├── portfolio/page.tsx          # Citizen holdings, unrealized P&L, dividends, stock gifting
│   ├── news/page.tsx               # Corporate announcements & regulatory decrees
│   ├── ipo/page.tsx                # IPO listing charter application portal
│   ├── funds/page.tsx              # Investment funds & treasuries overview
│   ├── auction/                    # Sovereign NFT license auctions
│   ├── referrals/page.tsx          # 20% trade-fee referral dashboard
│   └── api/
│       ├── admin/                  # Admin actions, watcher trigger, audit-ledger JSON, shareholder-report
│       ├── auth/                   # Session login, register, password reset
│       ├── cron/                   # Daily cron endpoints (sync-ledger, tick-auctions)
│       ├── trade/ & orders/        # Order placement & cancellation
│       ├── wallet/                 # Deposit announcement & Friday withdrawal requests
│       ├── buyback/                # Corporate share buyback engine
│       └── dividends/              # Dividend scheduling & distribution
└── lib/
    ├── db.ts                       # Turso client, schema migrations & initialization
    ├── engine.ts                   # Limit/Market order matching engine, Self-Trade Prevention, IPO fees
    ├── watcher.ts                  # Parlamentum automated deposit & contract scanner
    ├── wallet.ts                   # Deposit recipes (Raw Iron/Cotton/Copper) & withdrawal calculator
    ├── dividends.ts                # Weekly earnings reports & Friday UTC payout processor
    ├── companyTreasury.ts          # Founder treasury deposits/withdrawals & profile edits
    ├── companyLedger.ts            # Corporate P&L and treasury movement tracking
    ├── market.ts                   # Market queries, order book aggregation, buybacks, IPO approval
    ├── marketHours.ts              # Floor open/close schedule & emergency overrides
    ├── auth.ts                     # Password hashing, HMAC session cookies, CIVIX SSO user linking
    ├── discord.ts                  # Automated trade, deposit, and IPO Discord webhooks
    └── i18n.tsx                    # Multi-language dictionary (EN, TR, ID)
```

---

## 4. Step-by-Step Deployment Guide (Turso + Vercel)

### Step A: Create & Import Your Own Turso Database
1. Install the Turso CLI (Windows/Mac/Linux) and log in:
   ```bash
   turso auth login
   ```
2. Create a brand new database:
   ```bash
   turso db create gug-exchange
   ```
3. Import the database snapshot file provided privately to you:
   ```bash
   turso db shell gug-exchange < gug-full-db-2026-11-27.sql
   ```
4. Get your new database URL and create an auth token:
   ```bash
   turso db show gug-exchange --url
   turso db tokens create gug-exchange
   ```

### Step B: Configure Environment Variables in Vercel (and `.env.local` for local dev)
Deploy the GitHub repo to your Vercel account and configure these exact environment variables:

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `TURSO_DATABASE_URL` | **Yes** | `libsql://...turso.io` URL from Step A |
| `TURSO_AUTH_TOKEN` | **Yes** | Turso auth token from Step A |
| `SESSION_SECRET` | **Yes** | Strong random 64-char hex string for HMAC cookie signing (`openssl rand -hex 32`) |
| `ADMIN_SIGNUP_CODE` | Optional | Secret promo/admin registration code (leave empty or change to a new secret) |
| `CRON_SECRET` | **Yes** | Random secret string to authorize Vercel Cron requests to `/api/cron/*` |
| `DISCORD_WEBHOOK_URL` | Optional | Discord channel webhook for real-time Whale Trade, Deposit & IPO alerts |
| `DISCORD_PUBLIC_KEY` | Optional | Discord interactions public key (if using `/api/discord/interactions` slash commands) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob token (if using NFT image uploads or blob persistence) |
| `GAME_URL` | Optional | Defaults to `https://parlamentum.org` |

### Step C: Verify Cron Jobs (`vercel.json`)
`vercel.json` automatically configures two daily Vercel cron endpoints (requires `CRON_SECRET` env var):
* `/api/cron/sync-ledger` — runs at `00:00 UTC` daily (also executes scheduled Friday dividends)
* `/api/cron/tick-auctions` — runs at `12:00 UTC` daily

---

## 5. Post-Import Cutover Checklist (SQL & Admin Setup)

Once you import the database into your new Turso instance, run these SQL commands in `turso db shell gug-exchange` to switch admin control, `$GUG` equity, and the house operator name over to **Avemon** and **Dinomite (`Bug`)**:

### 1. Switch Admin Permissions
```sql
-- Grant Exchange Admin privileges to Bug (usr_ed4c52bb) and Avemon (usr_8e9f8fdf)
UPDATE users SET is_admin = 1 WHERE id IN ('usr_ed4c52bb', 'usr_8e9f8fdf');

-- Remove Admin privileges from outgoing operator JosephArora
UPDATE users SET is_admin = 0 WHERE id = 'usr_josepharora';
```

### 2. Set the New In-Game House Operator Name
Replace `NEW_HOUSE_INGAME_NAME` with whichever Parlamentum character (e.g., `Bug` or `Avemon`) will receive in-game gold deposits and fulfill Friday withdrawals:
```sql
UPDATE settings SET value = 'NEW_HOUSE_INGAME_NAME' WHERE key = 'house_name';
```

### 3. Transfer `$GUG` Founding Control & Shares
JosephArora currently holds **`7,912` shares** of `$GUG` (`381` shares locked in open sell order `ord_ipo_cmp_gug_001` @ `Ᵽ7.50`, `7,531` unlocked). Below is the `62.5%` / `37.5%` proportional split matching the purchase bid (`4,945` shares to Avemon, `2,967` shares to Bug):

```sql
-- 1. Cancel JosephArora's open $GUG sell order so all 7,912 shares are unlocked
UPDATE orders SET remaining_quantity = 0, status = 'CANCELLED' WHERE id = 'ord_ipo_cmp_gug_001';

-- 2. Transfer corporate founder ownership of $GUG to Avemon & co-founder Bug (or vice versa)
UPDATE companies SET creator_id = 'usr_8e9f8fdf', co_founder_id = 'usr_ed4c52bb' WHERE id = 'cmp_gug_001';

-- 3. Zero out JosephArora's $GUG shares
UPDATE portfolios SET shares = 0, locked_shares = 0 WHERE user_id = 'usr_josepharora' AND company_id = 'cmp_gug_001';

-- 4. Add 4,945 $GUG shares to Avemon's existing GUG portfolio row (62.5%, bringing his total to 4,955 shares)
UPDATE portfolios SET shares = shares + 4945 WHERE user_id = 'usr_8e9f8fdf' AND company_id = 'cmp_gug_001';

-- 5. Add 2,967 $GUG shares to Bug / Dinomite's existing GUG portfolio row (37.5%, bringing his total to 2,987 shares)
UPDATE portfolios SET shares = shares + 2967 WHERE user_id = 'usr_ed4c52bb' AND company_id = 'cmp_gug_001';
```

### 4. Reconnect the Automated Deposit Watcher (`/admin`)
The deposit watcher (`src/lib/watcher.ts`) polls Parlamentum's API on behalf of the house operator character to auto-credit deposits when players buy your Raw Iron/Cotton/Copper listings or send gold Contracts.
1. Log into your account on `https://your-new-domain.vercel.app/admin`.
2. Open the **Watcher** panel in the Admin Dashboard.
3. Log into the house Parlamentum account in your browser, grab your Parlamentum auth cookie/token and your Parlamentum user ID (`watcher_house_id`), and paste them into the Admin Watcher setup form.
4. Click **Save & Test Watcher** — verify `watcher_ok_at` updates with no errors.

---

## 6. Operational FAQ (Common Questions Answered)

* **How do players deposit gold?**
  Players either:
  1. Buy Raw Iron (`10g`), Raw Cotton (`100g`), or Raw Copper (`1,000g`) listed by `settings.house_name` on the in-game market, OR
  2. Send a direct in-game **Contract** to `settings.house_name` (used to bypass regional trade embargoes or market price limits).
  The Watcher detects both Market purchases and accepted Contracts and auto-credits the exact net gold to the citizen's GUG wallet. Players only click "Announce Deposit" as an optional ping.

* **Why are withdrawals restricted to Fridays?**
  By exchange policy (`src/app/api/wallet/route.ts` & `WalletModal.tsx`), withdrawal requests open only on **Fridays (00:00 – 23:59 UTC)** with a **200 Gold minimum** (`settings.min_withdraw = '200'`). Admins fulfill pending withdrawals in-game within 48h and mark them `COMPLETED` in `/admin`.

* **How do weekly dividends work?**
  Company founders fund their corporate treasury (`companies.treasury_balance`) and schedule/distribute earnings in `/admin` (or company management). When a report runs (`src/lib/dividends.ts`), the dividend pool is split across all shareholders proportional to `(shares / total_shares)` and credited directly to citizen wallets.

* **How does the Audit PDF work?**
  Inside `/admin`, click **Export Ledger PDF**. It queries `/api/admin/audit-ledger` and produces an institutional snapshot showing exact citizen cash liabilities, company treasuries, trades, and reserve requirements.

* **Can I change the `1%` trading fee or `200g` minimum withdrawal?**
  Yes! Both are stored in the `settings` table (`trade_fee_percent`, `min_withdraw`, `ipo_listing_fee`, `tax_rate`) and can be edited live directly inside `/admin` -> **Settings**.

* **What happened to `$DC` and `$EI`?**
  Both companies were previously liquidated for regulatory non-compliance (`status = 'LIQUIDATED'`). Their public shareholders received pro-rata restitution payouts. Note: `$DC` still holds `687.00g` in its frozen liquidated treasury deposited post-liquidation by founder `Kedah` (`usr_47e96db5`).

* **What about CIVIX SSO login (`Sign in with Civix ID`)?**
  In `src/app/login/page.tsx`, there is a "Sign in with Civix ID" link pointing to `civix-plum.vercel.app`. Remember the `redirect_uri` query parameter points to `growurgold.vercel.app/api/auth/callback/civix`. When moving to a new domain, either ask the CIVIX admin to whitelist your new callback URL in `civix_apps`, or remove the Civix SSO button in `src/app/login/page.tsx` so users use standard username/password auth.

---

*Built with care by JosephArora. Wishing Avemon & Dinomite huge success taking Grow Ur Gold to the next level!* 🚀
