import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId ?? null;
}

export async function GET() {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    where: { businessId },
    include: {
      orders: {
        select: { total: true, paidAmount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    customers.map((customer) => {
      const spent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);
      const paid = customer.orders.reduce((sum, order) => sum + Number(order.paidAmount), 0);
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        type: customer.type === "RETURNING" ? "Returning" : customer.type === "VIP" ? "VIP" : "New",
        orders: customer.orders.length,
        spent,
        outstanding: Math.max(0, spent - paid),
      };
    }),
  );
}

export async function POST(request: Request) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const type = body.type === "VIP" ? "VIP" : body.type === "Returning" ? "RETURNING" : "NEW";

    if (!name || !phone) {
      return NextResponse.json({ error: "Customer name and phone number are required." }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: { businessId, name, phone, type },
    });

    return NextResponse.json(
      { id: customer.id, name: customer.name, phone: customer.phone, type: body.type || "New", orders: 0, spent: 0, outstanding: 0 },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "That phone number already exists in your business." }, { status: 409 });
    }
    console.error("Customer creation failed", error);
    return NextResponse.json({ error: "Unable to create customer." }, { status: 500 });
  }
}
