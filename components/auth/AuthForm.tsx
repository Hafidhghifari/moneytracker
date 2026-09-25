"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MoneyhistLogo } from "@/components/brand/MoneyhistLogo";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    };
    if (isRegister) payload.name = String(form.get("name") ?? "").trim();

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(result.message ?? "Terjadi kendala. Silakan coba lagi.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Tidak dapat terhubung. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Tentang Moneyhist">
        <div className="story-brand-row">
          <MoneyhistLogo />
        </div>
        <div className="story-content">
          <div className="story-copy">
            <p className="eyebrow">Keuangan lebih tertata</p>
            <h1>Langkah kecil untuk keuangan yang lebih tenang.</h1>
            <p>Catat pemasukan dan pengeluaranmu dalam satu tempat. Mulai dengan cara sederhana, lalu bangun kebiasaan yang baik.</p>
          </div>
        </div>
        <div className="story-note"><span className="story-dot" aria-hidden="true" /> Dibuat untuk membantu mengelola keuangan pribadi.</div>
      </section>

      <section className="auth-panel" aria-labelledby="form-title">
        <div className="auth-card">
          <p className="eyebrow">{isRegister ? "Mulai sekarang" : "Selamat datang kembali"}</p>
          <h2 id="form-title">{isRegister ? "Buat akun" : "Masuk ke akunmu"}</h2>
          <p className="auth-intro">{isRegister ? "Isi data berikut untuk mulai mengatur keuanganmu." : "Masuk untuk melihat dan mengelola keuanganmu."}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="field">
                <label htmlFor="name">Nama</label>
                <input autoComplete="name" id="name" name="name" placeholder="Nama lengkap" minLength={2} maxLength={80} required />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input autoComplete="email" id="email" name="email" type="email" placeholder="nama@email.com" maxLength={254} required />
            </div>
            <div className="field">
              <label htmlFor="password">Kata sandi</label>
              <div className="password-wrap">
                <input autoComplete={isRegister ? "new-password" : "current-password"} id="password" name="password" type={showPassword ? "text" : "password"} placeholder={isRegister ? "Minimal 8 karakter" : "Masukkan kata sandi"} minLength={isRegister ? 8 : undefined} maxLength={128} required />
                <button aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={showPassword} className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? "Sembunyikan" : "Lihat"}</button>
              </div>
              {isRegister && <p className="field-hint">Gunakan setidaknya 8 karakter.</p>}
            </div>
            {message && <p className="form-message error" role="alert">{message}</p>}
            <button className="auth-submit" disabled={pending} type="submit">
              {pending ? "Memproses…" : isRegister ? "Buat akun" : "Masuk"}
              {!pending && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
            <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk" : "Daftar"}</Link>
          </p>
          <p className="auth-legal">Data akunmu hanya digunakan untuk pengalaman Moneyhist.</p>
        </div>
      </section>
    </main>
  );
}
