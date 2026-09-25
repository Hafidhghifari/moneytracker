import { createSession } from "@/lib/auth/session";
import { createUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Permintaan tidak valid." }, { status: 400 }); }
  const { name, email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) return Response.json({ message: "Nama wajib diisi (2–80 karakter)." }, { status: 400 });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return Response.json({ message: "Masukkan email yang valid." }, { status: 400 });
  if (typeof password !== "string" || password.length < 8 || password.length > 128) return Response.json({ message: "Kata sandi harus terdiri dari 8–128 karakter." }, { status: 400 });
  try {
    const user = await createUser(name.trim(), email.trim().toLowerCase(), password);
    if (!user) return Response.json({ message: "Email sudah terdaftar." }, { status: 409 });
    await createSession(user.id);
    return Response.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch { return Response.json({ message: "Akun tidak dapat dibuat saat ini." }, { status: 500 }); }
}
