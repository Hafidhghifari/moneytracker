"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { MoneyhistLogo } from "@/components/brand/MoneyhistLogo";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}

function navItems(pathname: string): NavItem[] {
  return [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/transactions",
      label: "Transaksi",
      icon: ArrowLeftRight,
      active: pathname.startsWith("/transactions"),
    },
    {
      href: "/settings",
      label: "Pengaturan",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];
}

export function SidebarNav({
  user,
  onNavigate,
}: {
  user: { name: string; email: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems(pathname);
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      onNavigate?.();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <MoneyhistLogo href="/dashboard" />
      </div>
      <nav aria-label="Navigasi utama" className="mt-2 flex flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={[
                "flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon
                className={`size-5 ${item.active ? "text-primary" : ""}`}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
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
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          className="mt-1 flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-expense transition-colors hover:bg-expense/10 disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {pending ? "Keluar…" : "Keluar"}
        </button>
      </div>
    </div>
  );
}