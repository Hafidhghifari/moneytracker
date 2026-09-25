import { prisma } from "./db";

const DEV_USER_EMAIL = "user.a@example.com";

/**
 * KONTRAK untuk Anggota 1 (Authentication):
 * ganti isi fungsi ini dengan pembacaan session yang sebenarnya.
 * Signature `(): Promise<number | null>` tidak boleh berubah.
 */
export async function getCurrentUserId(): Promise<number | null> {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: DEV_USER_EMAIL },
    select: { id: true },
  });

  return user?.id ?? null;
}
