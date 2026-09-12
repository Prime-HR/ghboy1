import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export const runtime = "nodejs";

async function getMembership() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;
  if (!userId || !businessId) return null;

  return prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId, userId } },
    include: { business: true },
  });
}

export async function GET() {
  const membership = await getMembership();
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    business: {
      id: membership.business.id,
      name: membership.business.name,
      type: membership.business.type ?? "",
      whatsapp: membership.business.whatsapp ?? "",
      location: membership.business.location ?? "",
      currency: membership.business.currency,
    },
    role: membership.role,
  });
}

export async function PUT(request: Request) {
  const membership = await getMembership();
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an owner or admin can update business settings." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "";

    if (!name) return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    if (!currency || currency.length !== 3) return NextResponse.json({ error: "Enter a valid 3-letter currency code." }, { status: 400 });

    const business = await prisma.business.update({
      where: { id: membership.businessId },
      data: {
        name,
        type: type || null,
        whatsapp: whatsapp || null,
        location: location || null,
        currency,
      },
    });

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        type: business.type ?? "",
        whatsapp: business.whatsapp ?? "",
        location: business.location ?? "",
        currency: business.currency,
      },
    });
  } catch (error) {
    console.error("Business settings update failed", error);
    return NextResponse.json({ error: "Unable to update business settings right now." }, { status: 500 });
  }
}
