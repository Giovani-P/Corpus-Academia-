"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Dumbbell,
  Users,
  BarChart3,
  Settings,
  Dumbbell as Logo,
  LogOut,
  QrCode,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/conversas", label: "Conversas", icon: MessageSquare },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/dashboard/treinos", label: "Treinos IA", icon: Dumbbell },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/qrcode", label: "QR Code", icon: QrCode },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/automacoes", label: "Automações", icon: Zap },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[#1E293B] border-r border-[#334155] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F97316]/10 border border-[#F97316]/30 rounded-xl flex items-center justify-center shrink-0">
            <Logo className="w-5 h-5 text-[#F97316]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#F1F5F9] leading-none">Corpus</p>
            <p className="text-xs text-[#64748B] mt-0.5">Academia</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-[#F97316]/10 text-[#F97316] font-semibold"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#293548]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#334155]">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
