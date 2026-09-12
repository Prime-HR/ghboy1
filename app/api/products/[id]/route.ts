import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId ?? null;
}

const serialize = (product: {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  sellingPrice: unknown;
  costPrice: unknown;
  stockQuantity: number;
  lowStockLevel: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...product,
  sellingPrice: Number(product.sellingPrice),
  costPrice: Number(product.costPrice),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const product = await prisma.product.findFirst({ where: { id, businessId } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json(serialize(product));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await prisma.product.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  try {
    const body = await request.json();
    const data: {
      name?: string;
      sku?: string;
      category?: string | null;
      description?: string | null;
      sellingPrice?: number;
      costPrice?: number;
      stockQuantity?: number;
      lowStockLevel?: number;
      status?: "ACTIVE" | "INACTIVE";
    } = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
      data.name = name;
    }

    if (body.sku !== undefined) {
      const sku = typeof body.sku === "string" ? body.sku.trim() : "";
      if (!sku) return NextResponse.json({ error: "SKU is required." }, { status: 400 });
      data.sku = sku;
    }

    if (body.category !== undefined) data.category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : null;
    if (body.description !== undefined) data.description = typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Selling price must be 0 or more." }, { status: 400 });
      data.sellingPrice = price;
    }

    if (body.cost !== undefined) {
      const cost = Number(body.cost);
      if (!Number.isFinite(cost) || cost < 0) return NextResponse.json({ error: "Cost price must be 0 or more." }, { status: 400 });
      data.costPrice = cost;
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) return NextResponse.json({ error: "Stock must be a whole number of 0 or more." }, { status: 400 });
      data.stockQuantity = stock;
    }

    if (body.stockDelta !== undefined) {
      const delta = Number(body.stockDelta);
      if (!Number.isInteger(delta) || delta === 0) return NextResponse.json({ error: "Stock adjustment must be a non-zero whole number." }, { status: 400 });
      const nextStock = existing.stockQuantity + delta;
      if (nextStock < 0) return NextResponse.json({ error: "Stock cannot go below 0." }, { status: 400 });
      data.stockQuantity = nextStock;
    }

    if (body.threshold !== undefined) {
      const threshold = Number(body.threshold);
      if (!Number.isInteger(threshold) || threshold < 0) return NextResponse.json({ error: "Low-stock threshold must be a whole number of 0 or more." }, { status: 400 });
      data.lowStockLevel = threshold;
    }

    if (body.status !== undefined) {
      if (body.status !== "ACTIVE" && body.status !== "INACTIVE") return NextResponse.json({ error: "Invalid product status." }, { status: 400 });
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) return NextResponse.json({ error: "No product changes supplied." }, { status: 400 });

    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json(serialize(product));
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "That SKU already exists in your business." }, { status: 409 });
    }

    console.error("Product update failed", error);
    return NextResponse.json({ error: "Unable to update product." }, { status: 500 });
  }
}
