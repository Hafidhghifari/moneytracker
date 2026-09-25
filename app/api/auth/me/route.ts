import { getCurrentUser } from "@/lib/auth/session";
import { updateUserPreference, type UserPreference } from "@/lib/auth/users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, preference: user.preference } });
}

const validPreferences = new Set<UserPreference>(["all", "income", "expense"]);

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: "Silakan masuk kembali." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Permintaan tidak valid." }, { status: 400 });
  }

  const preference = (body as { preference?: unknown } | null)?.preference;
  if (typeof preference !== "string" || !validPreferences.has(preference as UserPreference)) {
    return Response.json({ message: "Pilihan preferensi tidak valid." }, { status: 400 });
  }

  try {
    await updateUserPreference(user.id, preference as UserPreference);
    return Response.json({ preference });
  } catch {
    return Response.json({ message: "Preferensi belum dapat disimpan. Coba lagi." }, { status: 500 });
  }
}
