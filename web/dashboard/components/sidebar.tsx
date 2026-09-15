"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Gauge } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/strength", label: "Performance", icon: Gauge, shortcut: "S" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--line)] bg-[var(--bg-elev-1)] flex flex-col">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] grid place-items-center">
          <Dumbbell size={18} strokeWidth={2.4} className="text-[var(--accent-ink)]" />
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Train</div>
          <div className="text-[11px] text-[var(--ink-muted)] -mt-0.5">athlete OS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
                  : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--bg-elev-2)]"
              )}
            >
              <Icon size={16} strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              <kbd className="text-[10px] font-mono opacity-60">{item.shortcut}</kbd>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
