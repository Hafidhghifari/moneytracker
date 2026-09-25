"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

export interface UserMenuUser {
  name: string;
  email: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

/**
 * Menu profil di topbar: menampilkan nama akun yang sedang login,
 * tautan ke pengaturan, dan tombol keluar (logout).
 */
export function UserMenu({ user }: { user: UserMenuUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setOpen(false);
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-[140px] flex-col items-start leading-tight sm:flex">
          <span className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg shadow-foreground/5"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              <UserIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              Profil &amp; preferensi
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              <Settings className="size-4 text-muted-foreground" aria-hidden="true" />
              Pengaturan
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={pending}
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-expense transition-colors hover:bg-expense/10 disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {pending ? "Keluar…" : "Keluar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
