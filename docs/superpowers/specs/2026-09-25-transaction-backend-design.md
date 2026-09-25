# Desain: Database & Transaction Backend (Anggota 2)

- **Proyek**: Moneyhist — Personal Expense Tracker
- **Sumber requirement**: `docs/SRS.md`
- **Tanggal**: 2026-09-25
- **Pemilik scope**: Anggota 2 (Database & Transaction Backend)
- **Status**: Disetujui melalui sesi brainstorming

## 1. Tujuan

Menyediakan fondasi data dan backend transaksi untuk Moneyhist: skema database
Users + Transactions beserta relasinya, fungsi baca/tulis transaksi yang selalu
terikat pada user yang sedang login, dan Server Action tipis yang dikonsumsi
oleh UI transaksi (Anggota 4) dan dashboard (Anggota 3).

## 2. Lingkup

**Termasuk:**

- Setup PostgreSQL development via Docker Compose.
- Konfigurasi Prisma 7, skema `User` dan `Transaction`, migrasi awal.
- Modul data-access murni untuk transaksi (list, recent, summary, create, delete).
- Server Actions untuk tambah dan hapus transaksi, termasuk validasi dan otorisasi.
- Seed data 2 user + script verifikasi acceptance criteria.
- Kontrak seam auth (`getCurrentUserId`) dengan stub sementara.

**Tidak termasuk (milik anggota lain):**

- Implementasi asli register/login/logout/session/cookies (Anggota 1).
- Halaman dashboard dan komponen summary keuangan (Anggota 3).
- Form tambah transaksi, halaman riwayat, tombol hapus, dan UI filter (Anggota 4).
- Preferensi user (tema/filter tersimpan) — hanya kolom `preference` yang disiapkan.

## 3. Keputusan yang Disetujui

| # | Keputusan | Pilihan | Alasan |
|---|---|---|---|
| 1 | Database | PostgreSQL | Dipilih tim; sesuai untuk deployment dan relasi eksplisit |
| 2 | Akses data | Prisma 7 | Satu sumber schema, type-safe, mulus untuk kerja 4 orang |
| 3 | Auth | Custom milik Anggota 1 (Supabase Auth tidak dipakai) | Sesuai SRS: session + cookies + hashing sendiri |
| 4 | Interface ke UI | Modul data-access + Server Actions | Satu sumber kebenaran; Anggota 3 reuse fungsi baca, Anggota 4 pakai action |
| 5 | Sumber `userId` | Parameter eksplisit + stub auth sementara | Bisa dikembangkan & dites tanpa menunggu Anggota 1 |
| 6 | Tipe `amount` | `Decimal(12,2)` sesuai SRS | Tepat untuk uang; sum dilakukan di DB |
| 7 | Tipe `type` | Enum Postgres `income`/`expense` | Integritas ditegakkan database, nilai tetap sama seperti SRS |
| 8 | Validasi input | zod | Schema sekali pakai untuk action + pesan error UI |
| 9 | Postgres lokal | Docker Compose | Konsisten untuk seluruh tim, mudah reset |

## 4. Model Data

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"          // Prisma 7, bukan "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"             // url dibaca dari prisma.config.ts
}

enum TransactionType {
  income
  expense
}

model User {
  id           Int           @id @default(autoincrement())
  name         String
  email        String        @unique
  password     String                    // hash, bukan plaintext (BR-09)
  preference   String?                   // nullable: user baru belum punya preferensi
  transactions Transaction[]

  @@map("users")
}

model Transaction {
  id              Int             @id @default(autoincrement())
  userId          Int             @map("user_id")
  type            TransactionType
  amount          Decimal         @db.Decimal(12, 2)
  description     String
  transactionDate DateTime        @map("transaction_date") @db.Date
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, transactionDate])
  @@map("transactions")
}
```

**Ketentuan:**

- Anggota 2 membuat model `User` lengkap (termasuk `email @unique` dan `password`)
  karena SRS menugaskan pembuatan tabel Users ke Anggota 2.
- Kolom DB memakai `snake_case` via `@map` agar cocok SRS; TypeScript tetap `camelCase`.
- `onDelete: Cascade` mencegah transaksi orphan saat user dihapus.
- Index komposit `[userId, transactionDate]` mempercepat query "transaksi user X, terbaru dulu".
- `transaction_date` bertipe `@db.Date` (tanpa jam). Input `YYYY-MM-DD` di-parse ke
  UTC midnight agar tidak bergeser hari karena timezone.
- Jika Anggota 1 memerlukan tabel Session di database, itu migrasi tambahan terpisah
  di luar scope ini. Rekomendasi desain: session stateless via signed cookie.
- `preference` nullable karena user hasil register belum tentu punya preferensi.

## 5. Struktur Modul & Interface

```
lib/
  db.ts                        # Prisma 7 singleton (@prisma/adapter-pg)
  auth.ts                      # SEAM: getCurrentUserId() — stub sementara
  transactions/
    schema.ts                  # zod schema + tipe bersama
    data.ts                    # fungsi data-access murni — TERIMA userId
    actions.ts                 # "use server" — tipis: resolve userId → validasi → data.ts → revalidate
```

### 5.1 `lib/db.ts`

Singleton Prisma dengan driver adapter PostgreSQL, mengikuti pola resmi Prisma 7
untuk Next.js (attach ke `globalThis` saat non-production agar hot reload tidak
membuat banyak instance).

### 5.2 `lib/auth.ts` — seam auth

```ts
// KONTRAK. Implementasi asli milik Anggota 1 — cukup ganti isi body-nya,
// signature tidak boleh berubah.
export async function getCurrentUserId(): Promise<number | null>
```

Stub sementara: saat `NODE_ENV !== "production"`, stub mencari user seed
**berdasarkan email** (mis. `user.a@example.com`) lalu mengembalikan `id`-nya —
bukan hardcode `1`, karena id autoincrement bergantung urutan seed. Saat production
mengembalikan `null`. Tujuannya agar Anggota 2 bisa mengembangkan dan memverifikasi
alur penuh tanpa menunggu Anggota 1.

### 5.3 `lib/transactions/schema.ts`

```ts
import { TransactionType } from "@/lib/generated/prisma/client"; // satu-satunya sumber nilai enum

export type TransactionFilter = "all" | "income" | "expense";

export type TransactionInput = {
  type: TransactionType;
  amount: number;            // hasil transform dari string berdesimal
  description: string;
  transactionDate: string;   // "YYYY-MM-DD"
};

export const transactionInputSchema = /* zod, lihat Bagian 7 */
export const deleteTransactionSchema = /* zod, lihat Bagian 7 */
export const transactionFilterSchema = /* zod, lihat Bagian 7 */
```

`TransactionType` **tidak** dideklarasikan ulang secara manual — diimpor dari Prisma
Client yang digenerate agar tidak ada dua sumber kebenaran yang bisa drift.

### 5.4 `lib/transactions/data.ts` — data-access murni

Semua fungsi menerima `userId` eksplisit dan tidak mengetahui apa pun soal auth.

```ts
export type TransactionDTO = {
  id: number;
  type: TransactionType;
  amount: number;            // Decimal dikonversi di boundary ini
  description: string;
  transactionDate: string;   // "YYYY-MM-DD"
};

getTransactions(userId: number, filter: TransactionFilter): Promise<TransactionDTO[]>
getRecentTransactions(userId: number, limit = 5): Promise<TransactionDTO[]>
getSummary(userId: number): Promise<{ income: number; expense: number; balance: number }>
createTransaction(userId: number, input: TransactionInput): Promise<TransactionDTO>
deleteTransaction(userId: number, transactionId: number): Promise<boolean>  // false = bukan miliknya / tidak ada
```

**Aturan implementasi:**

1. Urutan list: `orderBy: [{ transactionDate: "desc" }, { id: "desc" }]`.
2. Filter: `where: { userId, ...(filter !== "all" && { type: filter }) }`.
   `"all"` berarti tanpa filter tipe.
3. `getSummary` memakai Prisma `groupBy` + `_sum.amount` atas kolom `Decimal`,
   sehingga `balance = income - expense` (BR-06) dihitung eksak oleh Postgres.
   Bila belum ada transaksi, hasilnya `{ income: 0, expense: 0, balance: 0 }`.
4. Konversi `Decimal` → `number` dan `Date` → `"YYYY-MM-DD"` HANYA di `data.ts`.
   Tujuannya: DTO aman di-pass ke client component (Decimal.js bukan plain object)
   dan UI tidak terkena masalah timezone.
5. Semua pembacaan memakai `where: { userId }` tanpa kecuali.
6. Setiap fungsi diawali guard: `userId` harus integer positif
   (`Number.isInteger(userId) && userId > 0`), jika tidak → throw. Ini pertahanan
   berlapis: di Prisma, `userId: undefined` menghapus kondisi filter sehingga query
   bisa berubah menjadi tidak ter-scope.
7. Konversi `transactionDate` `"YYYY-MM-DD"` → `new Date(\`${s}T00:00:00.000Z\`)`
   dilakukan di sini (satu tempat), setelah schema memvalidasi format dan
   keberadaan tanggal kalender.

### 5.5 `lib/transactions/actions.ts` — Server Action

```ts
"use server";

export type ActionState =
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string[]>> };

export async function addTransactionAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState>

export async function deleteTransactionAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState>
```

**Alur setiap action (urutan wajib):**

1. `const userId = await getCurrentUserId()`; bila `userId == null` (perbandingan
   longgar, menangkap `null` **maupun** `undefined`) → `redirect("/login")`.
   **`redirect()` harus dipanggil di luar blok try/catch**, karena `redirect()`
   bekerja dengan melempar `NEXT_REDIRECT`; bila berada di dalam try/catch, redirect
   akan tertelan dan berubah menjadi pesan error generik.
2. Parse `FormData` (hanya field transaksi; **tidak pernah** membaca `userId` dari form).
3. Validasi: `addTransactionAction` memakai `transactionInputSchema`;
   `deleteTransactionAction` memakai `deleteTransactionSchema` (id transaksi).
   Gagal → `{ status: "error", message, fieldErrors }`.
4. Panggil fungsi `data.ts` di dalam try/catch; error Prisma di-log server-side.
5. Sukses → `revalidatePath(TRANSACTIONS_PATH)` dan `revalidatePath(DASHBOARD_PATH)`.
6. Kembalikan `ActionState`.

`revalidatePath(DASHBOARD_PATH)` disertakan agar dashboard Anggota 3 ikut ter-refresh
setelah mutasi tanpa komunikasi tambahan antar-anggota.

`TRANSACTIONS_PATH = "/transactions"` dan `DASHBOARD_PATH = "/dashboard"` dinyatakan
sebagai konstanta di `actions.ts`, dan harus disamakan dengan route final yang dipilih
Anggota 3/4. `revalidatePath` ke route yang salah tidak melempar error — hanya tidak
melakukan apa-apa — jadi kesepakatan route perlu eksplisit.

## 6. Otorisasi & Keamanan

Mengacu panduan resmi Next.js Data Security: otorisasi level halaman **tidak**
melindungi Server Action, karena action dapat dipanggil via POST langsung.
Karena itu otorisasi diulang di dalam action.

| Risiko | Mitigasi |
|---|---|
| IDOR hapus transaksi user lain | `deleteMany({ where: { id, userId } })` — atomik, `count === 0` berarti gagal |
| Memalsukan `userId` dari client | `userId` hanya berasal dari `getCurrentUserId()`, tidak pernah dari `FormData`/argumen |
| `userId` bernilai `undefined` | Guard `userId == null` di action + guard integer positif di setiap fungsi `data.ts`; aktifkan `strictUndefinedChecks` Prisma bila tersedia |
| Membaca data user lain | Semua query baca memakai `where: { userId }` |
| Kebocoran info keberadaan data | Pesan delete generik: "Transaksi tidak ditemukan atau bukan milikmu" |
| Race condition cek-lalu-hapus | Tidak ada query cek terpisah; hapus dan verifikasi kepemilikan dalam satu operasi |
| Error DB bocor ke UI | try/catch di action; detail di-log server-side, UI menerima pesan generik |
| Password plaintext | Tidak relevan di scope ini; kolom `password` disiapkan untuk hash Anggota 1 (BR-09) |
| Sesi berakhir | `getCurrentUserId()` null → `redirect("/login")` |

## 7. Validasi

File: `lib/transactions/schema.ts`

```ts
export const transactionInputSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Nominal tidak valid")
    .transform(Number)
    .refine((v) => v > 0, "Nominal harus lebih dari 0")
    .refine((v) => v <= 9_999_999_999.99, "Nominal terlalu besar"),
  description: z.string().trim().min(1, "Deskripsi wajib diisi").max(255),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "Tanggal tidak valid"),
});

// Hapus: validasi id transaksi (dipakai deleteTransactionAction)
export const deleteTransactionSchema = z.object({
  transactionId: z.coerce.number().int().positive("Transaksi tidak valid"),
});

// Filter: dipakai saat membaca searchParams sebelum memanggil getTransactions
export const transactionFilterSchema = z
  .enum(["all", "income", "expense"])
  .catch("all");
```

- `amount` divalidasi sebagai string berdesimal maksimal 2 angka, lalu ditransform ke
  `number`. Ini menghindari galat floating-point yang muncul bila memakai
  `z.coerce.number().multipleOf(0.01)`.
- `transactionDate` divalidasi dua tahap: format `YYYY-MM-DD` dan keberadaan tanggal
  kalender (`.refine` + `Date.parse`), sehingga `2026-02-31` ditolak. Konversi
  string → `Date` dilakukan di `data.ts` (satu tempat, lihat 5.4 aturan 7).
- `transactionFilterSchema` **wajib** dipakai saat membaca `searchParams`
  (`transactionFilterSchema.parse(searchParams.filter)`); tanpa ini
  `?filter=<sembarang>` diteruskan ke filter enum Prisma dan menimbulkan error query.
- `fieldErrors` bertipe `Partial<Record<string, string[]>>` karena
  `zod.flatten().fieldErrors` menghasilkan nilai `string[] | undefined`; buang entri
  `undefined` sebelum dikembalikan.
- Pesan validasi berbahasa Indonesia karena UI berbahasa Indonesia.
- Batas atas `9_999_999_999.99` mengikuti presisi `Decimal(12,2)`.

## 8. Verifikasi

Tanpa menambah framework test penuh. Dua alat:

**`prisma/seed.ts`** — membuat User A dan User B (password hash placeholder) beserta
beberapa transaksi `income`/`expense` untuk masing-masing, agar seed bersifat
idempotent (hapus data lama lalu buat ulang).

**`scripts/verify-transactions.ts`** (dijalankan `pnpm db:verify` via `tsx`) —
meng-assert langsung acceptance criteria kunci:

1. `getTransactions(A, "all")` tidak memuat satu pun transaksi milik B.
2. `deleteTransaction(A, idMilikB)` mengembalikan `false`, dan transaksi tersebut
   masih ada di DB setelah operasi.
3. `getSummary(A)` hanya menjumlah transaksi A dan memenuhi `balance = income - expense`.
4. `createTransaction(A, input)` menyimpan `user_id = A` meskipun input tidak
   menyertakan `userId`.
5. Filter `"income"` / `"expense"` hanya mengembalikan tipe yang diminta.

Script keluar dengan exit code non-zero bila ada assert yang gagal.

## 9. Serahan & Dependensi

**File yang dibuat:**

| File | Isi |
|---|---|
| `docker-compose.yml` | Postgres 17, port 5432, volume persisten, healthcheck |
| `.env.example` | `DATABASE_URL` contoh untuk Docker Compose |
| `prisma.config.ts` | `defineConfig` + `env("DATABASE_URL")`, schema path |
| `prisma/schema.prisma` | Model User + Transaction, enum, index |
| `prisma/migrations/**` | Migrasi awal `init` |
| `lib/db.ts` | Prisma singleton + adapter pg |
| `lib/auth.ts` | Kontrak `getCurrentUserId()` + stub sementara |
| `lib/transactions/schema.ts` | zod schema + tipe |
| `lib/transactions/data.ts` | Fungsi data-access |
| `lib/transactions/actions.ts` | Server Action |
| `prisma/seed.ts` | Seed 2 user + transaksi |
| `scripts/verify-transactions.ts` | Script verifikasi acceptance criteria |
| `.gitignore` | Tambah `lib/generated/prisma` dan `!.env.example`. File `.gitignore` yang ada sudah memuat `.env*`, sehingga `.env.example` **wajib** di-whitelist agar ikut ter-commit |
| `tsconfig.json` | Tambah `lib/generated/prisma` ke `exclude` agar folder generated tidak ikut type-check (`include` sudah memuat `**/*.ts`) |
| `eslint.config.mjs` | Tambah `lib/generated/prisma` ke `ignores` |

**Script `package.json`:** `db:up`, `db:down`, `db:migrate`, `db:seed`, `db:verify`, `db:studio`.

**Dependency baru:** `@prisma/client`, `@prisma/adapter-pg`, `zod`.
**Dev dependency:** `prisma`, `tsx`, `dotenv`, `@types/pg`.

## 10. Integrasi Antar Anggota

| Anggota | Yang perlu dilakukan | Titik sambung |
|---|---|---|
| 1 (Auth) | Isi body `getCurrentUserId()`; jangan ubah signature. Bila butuh tabel Session, buat migrasi terpisah. | `lib/auth.ts` |
| 2 (Backend) | Membuat schema, data-access, actions, seed, verify. | Semua file pada Bagian 9 |
| 3 (Dashboard) | Import `getSummary` + `getRecentTransactions`; panggil `getCurrentUserId()` di page dan redirect bila null. | `lib/transactions/data.ts` |
| 4 (UI Transaksi) | Pakai `addTransactionAction` / `deleteTransactionAction` dengan `useActionState`; validasi filter dari `searchParams` dengan `transactionFilterSchema` lalu panggil `getTransactions(userId, filter)`. | `lib/transactions/actions.ts`, `lib/transactions/schema.ts` |

**Langkah pertama implementasi:** `pnpm install`, jalankan `next dev` sekali agar
`node_modules/next/dist/docs/` tergenerate, lalu baca panduan Server Actions versi
Next.js ini (wajib menurut `AGENTS.md`) sebelum menulis kode.

## 11. Pemetaan Acceptance Criteria (bagian Anggota 2)

| Acceptance criteria SRS | Ditangani oleh |
|---|---|
| Setiap transaksi terhubung dengan user yang membuatnya | `user_id` NOT NULL + FK + `createTransaction(userId, ...)` |
| User A tidak dapat melihat transaksi User B | `where: { userId }` di semua fungsi baca |
| User A tidak dapat menghapus transaksi User B | `deleteMany({ where: { id, userId } })` |
| User dapat menambahkan transaksi | `addTransactionAction` + `createTransaction` |
| User dapat menghapus transaksi | `deleteTransactionAction` + `deleteTransaction` |
| User dapat memfilter transaksi | `getTransactions(userId, filter)` + `transactionFilterSchema` memvalidasi `searchParams` sebelum query |
| Saldo dapat dihitung | `getSummary` (BR-06) |
| Total pemasukan/pengeluaran tampil | `getSummary` disediakan untuk Anggota 3 |

## 12. Risiko & Hal yang Wajib Diverifikasi Saat Implementasi

1. **Prisma 7**: pastikan bentuk final `prisma.config.ts`, generator `prisma-client`
   dengan `output`, dan pemakaian `@prisma/adapter-pg` sesuai versi yang ter-install.
   Cek juga apakah `@prisma/client` masih diperlukan sebagai runtime dependency atau
   tidak pada versi ini.
2. **Next.js 16**: `node_modules/next/dist/docs/` baru tergenerate setelah `next dev`
   dijalankan. Baca panduan Server Actions sebelum menulis kode.
3. **`@prisma/adapter-pg`**: verifikasi kebutuhan peer dependency `pg` dan `@types/pg`
   pada versi ter-install.
4. **`Decimal @db.Decimal(12,2)`**: verifikasi mapping dan bentuk nilai yang
   dikembalikan Prisma Client saat runtime (dikonversi di boundary `data.ts`).
5. **Timezone `@db.Date`**: pastikan `new Date(\`${d}T00:00:00.000Z\`)` tidak
   menghasilkan pergeseran hari saat dibaca ulang.
6. **`strictUndefinedChecks`**: cek apakah tersedia di Prisma versi ter-install; bila
   ya, aktifkan agar `undefined` pada `where` tidak menghapus kondisi filter.
7. **Sumber enum**: pastikan bentuk export `TransactionType` dari Prisma Client versi
   ini bisa dipakai langsung oleh zod (`z.enum(...)`); bila tidak, sesuaikan cara
   impornya tanpa mendeklarasikan ulang nilainya secara manual.
8. **Route final**: `TRANSACTIONS_PATH` dan `DASHBOARD_PATH` harus disepakati dengan
   Anggota 3/4 sebelum implementasi.

## 13. Langkah Implementasi Berikutnya

Lihat implementation plan yang dibuat dari spec ini. Urutan kasar:

1. Setup Postgres (Docker Compose, `.env`) + install dependency.
2. Prisma init, schema, migrasi `init`.
3. `lib/db.ts`, `lib/auth.ts` (stub), `lib/transactions/schema.ts`, `data.ts`.
4. `lib/transactions/actions.ts`.
5. Seed + script verifikasi; jalankan `pnpm db:verify` sampai hijau.
