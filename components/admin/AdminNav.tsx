"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Resumen" },
    { href: "/admin/ordenes", label: "Órdenes" },
    { href: "/admin/usuarios", label: "Usuarios" },
  ];

  return (
    <nav className="flex items-center gap-8 border-b border-border/40 mb-8 overflow-x-auto no-scrollbar">
      {links.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "pb-3 text-[11px] uppercase tracking-[0.15em] font-bold transition-all relative whitespace-nowrap",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
            {isActive && (
              <span className="absolute -bottom-px left-0 w-full h-0.5 bg-accent rounded-t-sm" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
