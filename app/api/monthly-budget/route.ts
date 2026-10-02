import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const noStore = { "Cache-Control": "no-store" };
const maxAmount = 9_999_999_999.99;

function parsePeriod(yearValue: string | null, monthValue: string | null) {
  if (!yearValue || !/^\d{1,4}$/.test(yearValue) || !monthValue || !/^\d{1,2}$/.test(monthValue)) {
    return null;
  }
  const year = Number(yearValue);
  const month = Number(monthValue);
  if (year < 1 || month < 1 || month > 12) return null;
  return { year, month };
}

function responseBudget(budget: { year: number; month: number; amount: { toString(): string } } | null) {
  return budget
    ? { year: budget.year, month: budget.month, amount: budget.amount.toString() }
    : null;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ message: "Silakan masuk kembali." }, { status: 401, headers: noStore });
  }

  const url = new URL(request.url);
  const period = parsePeriod(url.searchParams.get("year"), url.searchParams.get("month"));
  if (!period) {
    return Response.json({ message: "Bulan atau tahun tidak valid." }, { status: 400, headers: noStore });
  }

  try {
    const budget = await prisma.monthlyBudget.findUnique({
      where: { userId_year_month: { userId: Number(user.id), ...period } },
      select: { year: true, month: true, amount: true },
    });
    return Response.json({ budget: responseBudget(budget) }, { headers: noStore });
  } catch {
    return Response.json({ message: "Anggaran tidak dapat dimuat saat ini." }, { status: 500, headers: noStore });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ message: "Silakan masuk kembali." }, { status: 401, headers: noStore });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Permintaan tidak valid." }, { status: 400, headers: noStore });
  }

  const yearValue = typeof body.year === "number" ? String(body.year) : typeof body.year === "string" ? body.year : null;
  const monthValue = typeof body.month === "number" ? String(body.month) : typeof body.month === "string" ? body.month : null;
  const period = parsePeriod(yearValue, monthValue);
  const amountValue = typeof body.amount === "number" || typeof body.amount === "string" ? String(body.amount) : "";
  if (!period) {
    return Response.json({ message: "Bulan atau tahun tidak valid." }, { status: 400, headers: noStore });
  }
  if (!/^\d+(\.\d{1,2})?$/.test(amountValue)) {
    return Response.json({ message: "Masukkan anggaran dalam angka dengan maksimal dua angka desimal." }, { status: 400, headers: noStore });
  }
  const amount = Number(amountValue);
  if (!Number.isFinite(amount) || amount <= 0 || amount > maxAmount) {
    return Response.json({ message: "Anggaran harus lebih dari Rp0 dan maksimal Rp9.999.999.999,99." }, { status: 400, headers: noStore });
  }

  try {
    const budget = await prisma.monthlyBudget.upsert({
      where: { userId_year_month: { userId: Number(user.id), ...period } },
      create: { userId: Number(user.id), ...period, amount: amountValue },
      update: { amount: amountValue },
      select: { year: true, month: true, amount: true },
    });
    return Response.json({ budget: responseBudget(budget) }, { headers: noStore });
  } catch {
    return Response.json({ message: "Anggaran belum dapat disimpan saat ini." }, { status: 500, headers: noStore });
  }
}
