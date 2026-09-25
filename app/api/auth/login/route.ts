import { createSession } from "@/lib/auth/session";
import { verifyUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Permintaan tidak valid." }, { status: 400 }); }
  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) return Response.json({ message: "Email dan kata sandi wajib diisi." }, { status: 400 });
  const user = await verifyUser(email.trim().toLowerCase(), password);
  if (!user) return Response.json({ message: "Email atau kata sandi salah." }, { status: 401 });
  await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}
