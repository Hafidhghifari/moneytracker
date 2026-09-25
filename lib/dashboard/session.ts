import { cookies } from "next/headers";
import { USE_DASHBOARD_MOCK } from "@/lib/dashboard/config";
import { MOCK_USER } from "@/lib/dashboard/mock";
import type { SessionUser } from "@/lib/dashboard/types";

/**
 * Mengambil data user yang sedang login dari session (Server-only).
 *
 * ------------------------------------------------------------------
 * INTEGRATION POINT (milik Anggota 1 — auth/session):
 * - Fungsi ini HANYA dipanggil dari Server Component
 *   (`app/dashboard/page.tsx`). Jangan import ke Client Component
 *   (modul ini memakai `next/headers` yang tidak tersedia di browser).
 * - Implementasi final: ganti bagian bertanda TODO di bawah agar membaca
 *   session asli (mis. cookie `session` berisi JWT → verifikasi →
 *   ambil user dari database), lalu kembalikan `{ id, name, email }`
 *   atau `null` bila belum login.
 * - Selama auth asli belum ada dan `USE_DASHBOARD_MOCK = true`
 *   (lihat `config.ts`), fungsi mengembalikan user demo supaya halaman
 *   bisa didemo. Set flag ke `false` untuk menguji perilaku
 *   "belum login -> redirect ke /login".
 * ------------------------------------------------------------------
 *
 * Tidak ada hardcode user_id di pemanggil — semua data hilir mengikuti
 * `user.id` yang dikembalikan fungsi ini.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // MOCK SEMENTARA: hapus blok ini setelah session asli tersedia.
  if (USE_DASHBOARD_MOCK) {
    // Simulasi latency agar skeleton/loading state terlihat saat demo.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_USER;
  }

  // ---- TODO (Anggota 1): ganti dengan pembacaan session asli. ----
  // Contoh asumsi: cookie bernama "session" menyimpan token/JWT.
  // Sesuaikan nama cookie & cara verifikasi dengan implementasi auth.
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) {
    return null;
  }

  // TODO (Anggota 1): verifikasi `sessionToken` (decrypt JWT / cek ke
  // database) lalu kembalikan data user. Contoh bentuk return:
  //   return { id: payload.userId, name: payload.name, email: payload.email };
  return null;
}
