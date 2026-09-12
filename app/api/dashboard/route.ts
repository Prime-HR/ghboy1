import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);

export async function GET() {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const [orders, monthOrders, monthExpenses, customerCount, lowStockProducts] = await Promise.all([
    prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { customer: true, items: { include: { product: true } } },
    }),
    prisma.order.findMany({
      where: { businessId, createdAt: { gte: startOfMonth } },
      include: { items: true },
    }),
    prisma.expense.findMany({ where: { businessId, date: { gte: startOfMonth } } }),
    prisma.customer.count({ where: { businessId } }),
    prisma.product.findMany({
      where: { businessId, status: "ACTIVE", stockQuantity: { lte: 3 } },
      orderBy: { stockQuantity: "asc" },
      take: 5,
    }),
  ]);

  const todayOrders = monthOrders.filter((order) => order.createdAt >= startOfDay);
  const sales = todayOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
  const orderCount = monthOrders.length;
  const todayExpenses = monthExpenses.filter((expense) => expense.date >= startOfDay);
  const expenses = todayExpenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const salesCost = todayOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + toNumber(item.unitCost) * item.quantity, 0) + toNumber(order.deliveryCost),
    0,
  );
  const profit = sales - salesCost - expenses;
  const outstanding = await prisma.order.aggregate({
    where: { businessId, paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } },
    _sum: { total: true, paidAmount: true },
  });
  const outstandingAmount = Math.max(toNumber(outstanding._sum.total) - toNumber(outstanding._sum.paidAmount), 0);

  return NextResponse.json({
    today: { sales, expenses, profit, orders: todayOrders.length },
    totals: { orders: orderCount, customers: customerCount, outstanding: outstandingAmount },
    lowStock: lowStockProducts.map((product) => ({ id: product.id, name: product.name, stock: product.stockQuantity, threshold: product.lowStockLevel })),
    recentOrders: orders.map((order) => ({
      id: order.orderNumber,
      customerName: order.customer?.name ?? "Walk-in customer",
      total: toNumber(order.total),
      status: order.status,
      createdAt: order.createdAt,
    })),
  });
}
