import { NextResponse } from "next/server";
import { modifyOrder } from "@/lib/engine";
import { getCurrentUser } from "@/lib/auth";
import { isTradingAllowed } from "@/lib/marketHours";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (user.isManager) {
      return NextResponse.json({ success: false, message: "Manager accounts cannot trade." }, { status: 403 });
    }

    const tradingCheck = await isTradingAllowed();
    if (!tradingCheck.allowed) {
      return NextResponse.json({ success: false, message: tradingCheck.reason }, { status: 403 });
    }

    const { orderId, price, quantity } = await request.json();
    if (!orderId || price === undefined || quantity === undefined) {
      return NextResponse.json({ success: false, message: "Order ID, price, and quantity are required." }, { status: 400 });
    }

    const result = await modifyOrder(user.id, String(orderId), Number(price), Number(quantity));
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error("API /api/orders/edit error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to edit order" }, { status: 500 });
  }
}
