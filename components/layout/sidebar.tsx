"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, LayoutDashboard } from "lucide-react";
import { MoneyhistLogo } from "@/components/brand/MoneyhistLogo";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}

function navItems(pathname: string): NavItem[] {
  return [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/transactions",
      label: "Transaksi",
      icon: ArrowLeftRight,
      active: pathname.startsWith("/transactions"),
    },
  ];
}

export function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems(pathname);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <MoneyhistLogo href="/" />
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
      <p className="mt-auto px-5 pb-5 text-xs leading-relaxed text-muted-foreground">
        Catatan keuangan pribadi hanya untukmu.
      </p>
    </div>
  );
}