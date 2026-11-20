"use client";

import { emitToast } from "@/components/Toast";

export interface PriceAlert {
  id: string;
  ticker: string;
  direction: "ABOVE" | "BELOW";
  targetPrice: number;
  createdAt: string;
}

const STORAGE_KEY = "gug_price_alerts";

export function getPriceAlerts(ticker?: string): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    const alerts = raw as PriceAlert[];
    return ticker ? alerts.filter((a) => a.ticker === ticker.toUpperCase()) : alerts;
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event("price_alerts_updated"));
}

export function addPriceAlert(ticker: string, direction: "ABOVE" | "BELOW", targetPrice: number): PriceAlert {
  const alerts = getPriceAlerts();
  const alert: PriceAlert = {
    id: `alt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ticker: ticker.toUpperCase(),
    direction,
    targetPrice: Math.round(targetPrice * 100) / 100,
    createdAt: new Date().toISOString(),
  };
  saveAlerts([...alerts, alert]);
  return alert;
}

export function removePriceAlert(id: string) {
  const alerts = getPriceAlerts().filter((a) => a.id !== id);
  saveAlerts(alerts);
}

export function checkPriceAlerts(companies: Array<{ ticker: string; currentPrice: number }>) {
  if (typeof window === "undefined" || !companies.length) return;
  const alerts = getPriceAlerts();
  if (alerts.length === 0) return;

  const priceMap = new Map(companies.map((c) => [c.ticker.toUpperCase(), c.currentPrice]));
  const remaining: PriceAlert[] = [];
  let changed = false;

  for (const a of alerts) {
    const cur = priceMap.get(a.ticker);
    if (cur === undefined) {
      remaining.push(a);
      continue;
    }
    const hit = a.direction === "ABOVE" ? cur >= a.targetPrice : cur <= a.targetPrice;
    if (hit) {
      changed = true;
      emitToast({
        type: "fill",
        title: `🔔 Price Alert: $${a.ticker}`,
        body: `$${a.ticker} reached ${cur.toFixed(2)}g (target ${a.direction === "ABOVE" ? "≥" : "≤"} ${a.targetPrice.toFixed(2)}g).`,
      });
    } else {
      remaining.push(a);
    }
  }

  if (changed) {
    saveAlerts(remaining);
  }
}
