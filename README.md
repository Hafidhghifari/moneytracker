# Moneyhist — Personal Expense Tracker

Aplikasi web sederhana untuk mahasiswa mencatat pemasukan dan pengeluaran.
Dibangun dengan Next.js 16 (App Router), PostgreSQL, dan Prisma 7.

## Setup Development

Prasyarat: Node.js 22+, pnpm, dan Docker (atau podman dengan `podman-compose`).

1. Install dependency: `pnpm install`
2. Siapkan environment: `cp .env.example .env`
3. Nyalakan database: `pnpm db:up`
4. Terapkan migrasi: `pnpm db:migrate`
5. Generate Prisma Client: `pnpm db:generate` (wajib di clone baru — folder
   `lib/generated` tidak di-commit)
6. Isi data contoh (User A & User B): `pnpm db:seed`
7. Verifikasi backend transaksi: `pnpm db:verify`
8. Jalankan aplikasi: `pnpm dev`

Buka http://localhost:3000.

PostgreSQL Moneyhist dipublikasikan pada port host `55432` agar tidak bertabrakan dengan database Docker lain. URL koneksi Prisma berada di `.env`.

Pendaftaran dan login yang berhasil mengarahkan pengguna ke `/dashboard`. Halaman dashboard dan pengaturan membutuhkan session aktif. Preferensi filter transaksi dapat diubah pada `/settings` dan disimpan per akun di database.

### Perintah database

| Perintah | Fungsi |
|---|---|
| `pnpm db:up` | Nyalakan Postgres (menunggu sampai healthy) |
| `pnpm db:down` | Hentikan Postgres (data tetap tersimpan di volume) |
| `pnpm db:generate` | Generate Prisma Client ke `lib/generated/prisma` |
| `pnpm db:migrate` | Buat/terapkan migrasi Prisma |
| `pnpm db:seed` | Isi ulang data contoh (idempotent) |
| `pnpm db:verify` | Jalankan 42 assertion acceptance criteria transaksi |
| `pnpm db:verify:budget` | Jalankan assertion integrasi & authorization Monthly Budget |
| `pnpm db:verify:all` | Jalankan kedua suite verifikasi |
| `pnpm db:studio` | Buka Prisma Studio |

Reset total database:

```bash
pnpm db:down
docker compose down -v
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

## Kontrak Backend Transaksi

| Modul | Isi |
|---|---|
| `lib/auth.ts` | `getCurrentUserId(): Promise<number \| null>` — membaca session asli (`lib/auth/session.ts`). |
| `lib/transactions/schema.ts` | Tipe + zod schema (`transactionInputSchema`, `deleteTransactionSchema`, `transactionFilterSchema`). Aman diimpor dari client component. |
| `lib/transactions/data.ts` | Fungsi baca/mutasi. Semuanya menerima `userId` eksplisit; `userId` tidak pernah berasal dari client. |
| `lib/transactions/wire.ts` | `toWireTransaction` — memetakan DTO database ke bentuk yang dikonsumsi UI. |
| `lib/transactions/actions.ts` | `addTransactionAction` / `deleteTransactionAction` untuk form (`useActionState`). |

### API AJAX

Semua endpoint mengambil `userId` dari session di server, bukan body/query
(FR-07, FR-13, FR-20). Tanpa session valid, respons `401`. Transaksi milik akun
lain tidak dapat dibaca/diubah/dihapus.

| Metode & path | Fungsi |
|---|---|
| `GET /api/transactions` | `200 { data: Transaction[] }` — transaksi milik user login. |
| `POST /api/transactions` | `201 { data: Transaction }`. Menerima `type`, `amount`, `description`, dan `date` (atau `transaction_date`). |
| `DELETE /api/transactions/[id]` | `200 { data: { id } }`, `404` bila bukan milik user. |

Bentuk data ke UI: `{ id, user_id, type, amount, description, date }`.

## Kontrak Monthly Budget

| Modul | Isi |
|---|---|
| `lib/budget/schema.ts` | `budgetInputSchema` (`year`, `month` 1–12, `amount`) + helper periode. Aman diimpor dari client component. |
| `lib/budget/data.ts` | `getBudget`, `setBudget` (upsert), `getMonthlyExpenseTotal`, `getBudgetSummary`. Semuanya menerima `userId` eksplisit (FR-20) dan dihitung dari transaksi `expense` user pada bulan terpilih (FR-21). |

Sisa anggaran mengikuti rumus SRS: `remaining = budget - totalExpense`.

### Catatan integrasi

- **Anggota 1 & 3 (dashboard/budget UI)**: `getBudgetSummary` untuk Budget
  Summary, `getSummary`/`getRecentTransactions` di server component.
- **Anggota 3 (bulan)**: pilih periode lalu panggil `getBudgetSummary(userId, { year, month })`.
- **Anggota 4 (Set Budget)**: `setBudget(userId, { year, month, amount })`.
- **Anggota 4 (UI transaksi)**: pakai `addTransactionAction` /
  `deleteTransactionAction`, dan validasi filter dari `searchParams` dengan
  `transactionFilterSchema` sebelum memanggil `getTransactions`.
- Filter dengan nilai tak dikenal otomatis jatuh ke `"all"`.
- Kolom `transaction_date` bertipe `DATE`. Script seed/verify menetapkan `TZ=UTC`
  agar pembacaan tanggal deterministik.

## Catatan Teknis

- Nama file konfigurasi Prisma 7.10 adalah **`prisma7.config.ts`** (bukan
  `prisma.config.ts` yang disebut dokumentasi versi lain). `DATABASE_URL` dibaca
  dari file itu, bukan dari blok `datasource`.
- `prisma migrate dev` tidak otomatis menjalankan `prisma generate`; jalankan
  `pnpm db:generate` (atau `./node_modules/.bin/prisma generate`) setelah mengubah schema
  atau setelah clone baru.
- Image Postgres memakai nama lengkap `docker.io/library/postgres:17-alpine` agar
  kompatibel dengan podman (yang menolak short-name tanpa TTY).
- Bila `pnpm exec prisma ...` gagal dengan pesan `rtk: No such file or directory`,
  pakai `./node_modules/.bin/prisma ...` atau `pnpm run db:*`.
