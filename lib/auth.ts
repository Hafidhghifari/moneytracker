import { cookies } from "next/headers";

/** Pengguna yang sedang login — dibaca dari session milik Anggota 1. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Mengambil user yang sedang login dari session (khusus Server Component).
 *
 * ------------------------------------------------------------------
 * TODO (Anggota 1 — auth/session):
 * Ganti badan fungsi ini dengan pembacaan session asli, misalnya
 * cookie `session` berisi JWT lalu diverifikasi dan user diambil
 * dari database. Kembalikan `{ id, name, email }` atau `null` bila
 * belum login. Jangan hardcode user di sini.
 * ------------------------------------------------------------------
 *
 * Pemanggil (`app/dashboard/page.tsx`) me-redirect ke `/login` bila
 * hasilnya `null` (FR-05, BR-02). Seluruh fetch dashboard memakai
 * `user.id` dari fungsi ini — tidak ada user_id hardcode di mana pun.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) {
    return null;
  }

  // TODO (Anggota 1): verifikasi `sessionToken` (decrypt JWT / cek ke
  // database) lalu kembalikan data user aslinya, contoh:
  //   const payload = await verifySession(sessionToken);
  //   return { id: payload.userId, name: payload.name, email: payload.email };
  return null;
}
