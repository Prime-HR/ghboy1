import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

const statusLabels = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

const paymentLabels = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
} as const;

const deliveryLabels = {
  PENDING: "Pending",
  READY: "Ready",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, businessId },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const total = Number(order.total);
  const paidAmount = Number(order.paidAmount);
  const subtotal = Number(order.subtotal);
  const productCost = order.items.reduce((sum, item) => sum + Number(item.unitCost) * item.quantity, 0);
  const deliveryCost = Number(order.deliveryCost);

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.customer
      ? { id: order.customer.id, name: order.customer.name, phone: order.customer.phone, type: order.customer.type }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      unitCost: Number(item.unitCost),
      lineTotal: Number(item.unitPrice) * item.quantity,
    })),
    subtotal,
    deliveryFee: Number(order.deliveryFee),
    deliveryCost,
    total,
    paidAmount,
    outstanding: Math.max(total - paidAmount, 0),
    profit: subtotal - productCost - deliveryCost,
    paymentStatus: paymentLabels[order.paymentStatus as keyof typeof paymentLabels],
    status: statusLabels[order.status as keyof typeof statusLabels],
    deliveryStatus: deliveryLabels[order.deliveryStatus as keyof typeof deliveryLabels],
    payments: order.payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      method: payment.method,
      reference: payment.reference,
      createdAt: payment.createdAt.toISOString(),
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
}
