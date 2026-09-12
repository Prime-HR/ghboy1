import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId ?? null;
}

function serializeExpense(expense: {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: unknown;
  paymentMethod: string | null;
  notes: string | null;
}) {
  return {
    id: expense.id,
    date: expense.date.toISOString().slice(0, 10),
    category: expense.category,
    description: expense.description,
    amount: Number(expense.amount),
    method: expense.paymentMethod ?? "",
    notes: expense.notes ?? "",
  };
}

export async function GET() {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where: { businessId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(expenses.map(serializeExpense));
}

export async function POST(request: Request) {
  const businessId = await getBusinessId();
  if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const date = typeof body.date === "string" ? body.date : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const paymentMethod = typeof body.method === "string" ? body.method.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const amount = Number(body.amount);

    if (!date || !category || !description || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Date, category, description and an amount greater than zero are required." },
        { status: 400 },
      );
    }

    const expenseDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(expenseDate.getTime())) {
      return NextResponse.json({ error: "Enter a valid expense date." }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        businessId,
        date: expenseDate,
        category,
        description,
        amount,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(serializeExpense(expense), { status: 201 });
  } catch (error) {
    console.error("Expense creation failed", error);
    return NextResponse.json({ error: "Unable to create expense." }, { status: 500 });
  }
}
