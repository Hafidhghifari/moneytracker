"use client";

import { Menu } from "lucide-react";
import { IconButton } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex w-full items-center gap-3 px-4 md:px-8">
        <IconButton
          label="Buka menu navigasi"
          onClick={onMenuClick}
          className="text-foreground lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </IconButton>
        <h1 className="truncate text-[17px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
    </header>
  );
}