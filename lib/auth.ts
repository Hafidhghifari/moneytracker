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
  // ---------------------------------------------------------------
  // MOCK SEMENTARA KHUSUS DEVELOPMENT — WAJIB DIHAPUS begitu
  // session asli Anggota 1 selesai.
  //
  // Aktif HANYA bila BOTH kondisi terpenuhi:
  //   1. `NEXT_PUBLIC_USE_MOCK_AUTH=true` di `.env.local`, DAN
  //   2. `NODE_ENV !== "production"` (jadi tidak mungkin aktif di
  //      production build / `next start`, walau env var-nya bocor).
  //
  // Cara mematikan: hapus baris flag dari `.env.local` (atau set
  // `false`), lalu blok di bawah ini hapus seluruhnya dan biarkan
  // pembacaan session asli Anggota 1 yang bekerja.
  // ---------------------------------------------------------------
  if (
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return {
      // id string (bukan number) mengikuti tipe SessionUser yang
      // dipakai seluruh query transaksi (`user_id`).
      id: "user-dev-001",
      name: "Mahasiswa Demo",
      email: "demo@test.com",
    };
  }

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
