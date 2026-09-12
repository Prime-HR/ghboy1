import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

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

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId ?? null;
}

function serializeOrder(order: any) {
  const item = order.items[0];
  const paidAmount = Number(order.paidAmount);
  const total = Number(order.total);
  return {
    id: order.orderNumber,
    orderId: order.id,
    customerId: order.customerId ?? "",
    customerName: order.customer?.name ?? "Walk-in customer",
    productId: item?.productId ?? "",
    productName: item?.product?.name ?? "",
    quantity: item?.quantity ?? 0,
    price: Number(item?.unitPrice ?? 0),
    cost: Number(item?.unitCost ?? 0),
    deliveryFee: Number(order.deliveryFee),
    paymentReceived: paidAmount,
    paymentMethod: order.payments[0]?.method ?? "",
    total,
    outstanding: Math.max(total - paidAmount, 0),
    profit: Number(order.subtotal) - Number(item?.unitCost ?? 0) * Number(item?.quantity ?? 0),
    paymentStatus: paymentLabels[order.paymentStatus as keyof typeof paymentLabels],
    status: statusLabels[order.status as keyof typeof statusLabels],
    createdAt: order.createdAt.toISOString(),
  };
}

export async function GET() {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { businessId },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(request: Request) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const customerId = typeof body.customerId === "string" ? body.customerId : "";
    const productId = typeof body.productId === "string" ? body.productId : "";
    const quantity = Number(body.quantity);
    const deliveryFee = Number(body.deliveryFee ?? 0);
    const paymentReceived = Number(body.paymentReceived ?? 0);
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";

    if (!customerId || !productId) {
      return NextResponse.json({ error: "Select a customer and product first." }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Quantity must be a whole number of 1 or more." }, { status: 400 });
    }
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0 || !Number.isFinite(paymentReceived) || paymentReceived < 0) {
      return NextResponse.json({ error: "Delivery fee and payment received must be 0 or more." }, { status: 400 });
    }

    // Neon/PostgreSQL can briefly take longer to acquire a transaction connection,
    // especially after the database has been idle. Give the transaction a sensible
    // acquisition and execution window while keeping the whole sale atomic.
    const result = await prisma.$transaction(
      async (tx) => {
        const [customer, product] = await Promise.all([
          tx.customer.findFirst({ where: { id: customerId, businessId } }),
          tx.product.findFirst({ where: { id: productId, businessId, status: "ACTIVE" } }),
        ]);

        if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
        if (!product) throw new Error("PRODUCT_NOT_FOUND");
        if (product.stockQuantity < quantity) throw new Error("INSUFFICIENT_STOCK");

        const subtotal = Number(product.sellingPrice) * quantity;
        const total = subtotal + deliveryFee;
        if (paymentReceived > total) throw new Error("PAYMENT_TOO_HIGH");

        const paymentStatus = paymentReceived <= 0 ? "UNPAID" : paymentReceived >= total ? "PAID" : "PARTIALLY_PAID";
        const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

        const stockUpdate = await tx.product.updateMany({
          where: { id: product.id, businessId, stockQuantity: { gte: quantity } },
          data: { stockQuantity: { decrement: quantity } },
        });
        if (stockUpdate.count !== 1) throw new Error("INSUFFICIENT_STOCK");

        const order = await tx.order.create({
          data: {
            businessId,
            customerId: customer.id,
            orderNumber,
            subtotal,
            deliveryFee,
            total,
            paidAmount: paymentReceived,
            paymentStatus,
            status: "NEW",
            deliveryStatus: "PENDING",
            items: {
              create: {
                productId: product.id,
                quantity,
                unitPrice: product.sellingPrice,
                unitCost: product.costPrice,
              },
            },
            payments: paymentReceived > 0 ? { create: { amount: paymentReceived, method: paymentMethod || null } } : undefined,
          },
          include: {
            customer: true,
            items: { include: { product: true } },
            payments: { orderBy: { createdAt: "asc" } },
          },
        });

        const currentOrders = await tx.order.count({ where: { businessId, customerId: customer.id } });
        if (currentOrders === 1 && customer.type === "NEW") {
          await tx.customer.update({ where: { id: customer.id }, data: { type: "RETURNING" } });
        }

        return order;
      },
      { maxWait: 15000, timeout: 30000 },
    );

    return NextResponse.json(serializeOrder(result), { status: 201 });
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : "";
    if (code === "CUSTOMER_NOT_FOUND") return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    if (code === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Product not found or inactive." }, { status: 404 });
    if (code === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "Not enough stock for this sale." }, { status: 409 });
    if (code === "PAYMENT_TOO_HIGH") return NextResponse.json({ error: "Payment received cannot be greater than the order total." }, { status: 400 });
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Unable to create order." }, { status: 500 });
  }
}
