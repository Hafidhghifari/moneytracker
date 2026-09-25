"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ToastProvider } from "@/components/ui/toast";
import { IconButton } from "@/components/ui/button";
import { SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

const pageTitles: Record<string, string> = {
  "/transactions": "Riwayat Transaksi",
  "/transactions/new": "Tambah Transaksi",
};

function resolveTitle(pathname: string): string {
  return pageTitles[pathname] ?? "Moneyhist";
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Shell>{children}</Shell>
    </ToastProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pathSnap, setPathSnap] = useState(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathSnap !== pathname) {
    setPathSnap(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (menuOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [menuOpen]);

  return (
    <div className="min-h-dvh lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-surface lg:block">
        <SidebarNav />
      </aside>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-foreground/40 transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-border bg-surface shadow-2xl shadow-foreground/10 transition-transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end pr-3 pt-3 lg:hidden">
            <IconButton
              label="Tutup menu navigasi"
              onClick={() => setMenuOpen(false)}
              className="text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </IconButton>
          </div>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </aside>
      </div>

      <div className="flex min-h-dvh flex-col">
        <Topbar
          title={resolveTitle(pathname)}
          onMenuClick={() => setMenuOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}