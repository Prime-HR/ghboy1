import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

const statusLabels = { NEW: "New", CONFIRMED: "Confirmed", PREPARING: "Preparing", READY: "Ready", DISPATCHED: "Dispatched", DELIVERED: "Delivered", CANCELLED: "Cancelled" } as const;
const paymentLabels = { UNPAID: "Unpaid", PARTIALLY_PAID: "Partially Paid", PAID: "Paid" } as const;
const deliveryLabels = { PENDING: "Pending", READY: "Ready", DISPATCHED: "Dispatched", DELIVERED: "Delivered", CANCELLED: "Cancelled" } as const;
const statuses = Object.keys(statusLabels) as Array<keyof typeof statusLabels>;
const deliveries = Object.keys(deliveryLabels) as Array<keyof typeof deliveryLabels>;

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId ?? null;
}

async function getOrder(id: string, businessId: string) {
  return prisma.order.findFirst({ where: { id, businessId }, include: { customer: true, items: { include: { product: true } }, payments: { orderBy: { createdAt: "asc" } } } });
}

function serialize(order: any) {
  const total = Number(order.total), paidAmount = Number(order.paidAmount), subtotal = Number(order.subtotal);
  const productCost = order.items.reduce((sum: number, item: any) => sum + Number(item.unitCost) * item.quantity, 0);
  return {
    id: order.id, orderNumber: order.orderNumber,
    customer: order.customer ? { id: order.customer.id, name: order.customer.name, phone: order.customer.phone, type: order.customer.type } : null,
    items: order.items.map((item: any) => ({ id: item.id, productId: item.productId, productName: item.product.name, quantity: item.quantity, unitPrice: Number(item.unitPrice), unitCost: Number(item.unitCost), lineTotal: Number(item.unitPrice) * item.quantity })),
    subtotal, deliveryFee: Number(order.deliveryFee), deliveryCost: Number(order.deliveryCost), total, paidAmount,
    outstanding: Math.max(total - paidAmount, 0), profit: subtotal - productCost - Number(order.deliveryCost),
    paymentStatus: paymentLabels[order.paymentStatus as keyof typeof paymentLabels], status: statusLabels[order.status as keyof typeof statusLabels], deliveryStatus: deliveryLabels[order.deliveryStatus as keyof typeof deliveryLabels],
    payments: order.payments.map((p: any) => ({ id: p.id, amount: Number(p.amount), method: p.method, reference: p.reference, createdAt: p.createdAt.toISOString() })),
    createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString(),
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await getOrder(id, businessId);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json(serialize(order));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json();
    const status = typeof body.status === "string" ? body.status : undefined;
    const deliveryStatus = typeof body.deliveryStatus === "string" ? body.deliveryStatus : undefined;
    const paymentAmount = body.paymentAmount === undefined ? undefined : Number(body.paymentAmount);
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    if (status && !statuses.includes(status as keyof typeof statusLabels)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    if (deliveryStatus && !deliveries.includes(deliveryStatus as keyof typeof deliveryLabels)) return NextResponse.json({ error: "Invalid delivery status." }, { status: 400 });
    if (paymentAmount !== undefined && (!Number.isFinite(paymentAmount) || paymentAmount <= 0)) return NextResponse.json({ error: "Additional payment must be greater than 0." }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({ where: { id, businessId }, include: { payments: true } });
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status === "CANCELLED" && status && status !== "CANCELLED") throw new Error("CANCELLED_ORDER");
      const data: any = {};
      if (status) data.status = status;
      if (deliveryStatus) data.deliveryStatus = deliveryStatus;
      if (paymentAmount !== undefined) {
        const outstanding = Number(order.total) - Number(order.paidAmount);
        if (paymentAmount > outstanding) throw new Error("PAYMENT_TOO_HIGH");
        data.paidAmount = { increment: paymentAmount };
        const newPaid = Number(order.paidAmount) + paymentAmount;
        data.paymentStatus = newPaid >= Number(order.total) ? "PAID" : "PARTIALLY_PAID";
        await tx.payment.create({ data: { orderId: order.id, amount: paymentAmount, method: paymentMethod || null, reference: reference || null } });
      }
      await tx.order.update({ where: { id: order.id }, data });
      return tx.order.findUnique({ where: { id: order.id }, include: { customer: true, items: { include: { product: true } }, payments: { orderBy: { createdAt: "asc" } } } });
    }, { maxWait: 15000, timeout: 30000 });
    return NextResponse.json(serialize(result));
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : "";
    if (code === "ORDER_NOT_FOUND") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (code === "PAYMENT_TOO_HIGH") return NextResponse.json({ error: "Additional payment cannot be greater than the outstanding balance." }, { status: 400 });
    if (code === "CANCELLED_ORDER") return NextResponse.json({ error: "A cancelled order cannot be reopened." }, { status: 400 });
    console.error("Order update failed", error);
    return NextResponse.json({ error: "Unable to update order." }, { status: 500 });
  }
}
