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
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const businessId = await getBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const sku = typeof body.sku === "string" ? body.sku.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    const cost = Number(body.cost);
    const stock = Number(body.stock ?? 0);
    const threshold = Number(body.threshold ?? 3);

    if (!name || !sku || !Number.isFinite(price) || !Number.isFinite(cost) || price < 0 || cost < 0) {
      return NextResponse.json({ error: "Name, SKU, price and cost are required." }, { status: 400 });
    }

    if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(threshold) || threshold < 0) {
      return NextResponse.json({ error: "Stock and low-stock threshold must be whole numbers of 0 or more." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        businessId,
        name,
        sku,
        category: category || null,
        description: description || null,
        sellingPrice: price,
        costPrice: cost,
        stockQuantity: stock,
        lowStockLevel: threshold,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "That SKU already exists in your business." }, { status: 409 });
    }

    console.error("Product creation failed", error);
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const businessId = await getBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }

  const product = await prisma.product.findFirst({ where: { id, businessId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  try {
    await prisma.product.delete({ where: { id: product.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Product deletion failed", error);
    return NextResponse.json({ error: "This product cannot be deleted because it is used by an order." }, { status: 409 });
  }
}
