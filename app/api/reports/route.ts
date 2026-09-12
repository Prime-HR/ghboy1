import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const range = url.searchParams.get("range") === "last-month" ? "last-month" : "this-month";
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + (range === "last-month" ? -1 : 0), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + (range === "last-month" ? 0 : 1), 1);

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { businessId, createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.expense.findMany({
      where: { businessId, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
    }),
  ]);

  const revenue = orders.reduce((sum, order) => sum + toNumber(order.total), 0);
  const productCosts = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + toNumber(item.unitCost) * item.quantity, 0),
    0,
  );
  const deliveryCosts = orders.reduce((sum, order) => sum + toNumber(order.deliveryCost), 0);
  const expensesTotal = expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const netProfit = revenue - productCosts - deliveryCosts - expensesTotal;
  const collected = orders.reduce((sum, order) => sum + toNumber(order.paidAmount), 0);
  const outstanding = Math.max(revenue - collected, 0);

  const productMap = new Map<string, { quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const current = productMap.get(item.product.name) ?? { quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += toNumber(item.unitPrice) * item.quantity;
      productMap.set(item.product.name, current);
    }
  }

  const expenseMap = new Map<string, number>();
  for (const expense of expenses) expenseMap.set(expense.category, (expenseMap.get(expense.category) ?? 0) + toNumber(expense.amount));

  return NextResponse.json({
    range,
    period: { start: start.toISOString(), end: end.toISOString() },
    summary: { revenue, productCosts, deliveryCosts, expenses: expensesTotal, netProfit, orders: orders.length, collected, outstanding },
    topProducts: [...productMap.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    expenseBreakdown: [...expenseMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  });
}
