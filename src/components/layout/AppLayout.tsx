"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Search, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active 
          ? "bg-indigo-50 text-indigo-600 font-medium" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <aside className="w-64 border-r bg-white p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DocApproval</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            href="/dashboard" 
            active={pathname === "/dashboard"} 
          />
          <NavItem 
            icon={<Search size={20} />} 
            label="Analyse" 
            href="/analyse" 
            active={pathname.startsWith("/analyse")} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Categories" 
            href="/settings/categories" 
            active={pathname.startsWith("/settings")} 
          />
        </nav>

        <div className="pt-4 border-t">
          <button className="flex items-center gap-3 text-slate-500 hover:text-rose-600 transition-colors px-3 py-2 w-full">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        <Link href="/dashboard" className={`p-2 rounded-full ${pathname === "/dashboard" ? "text-indigo-600 bg-indigo-50" : "text-slate-500"}`}>
          <LayoutDashboard size={24} />
        </Link>
        <Link href="/analyse" className={`p-2 rounded-full ${pathname.startsWith("/analyse") ? "text-indigo-600 bg-indigo-50" : "text-slate-500"}`}>
          <Search size={24} />
        </Link>
        <Link href="/settings/categories" className={`p-2 rounded-full ${pathname.startsWith("/settings") ? "text-indigo-600 bg-indigo-50" : "text-slate-500"}`}>
          <Settings size={24} />
        </Link>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">{children}</main>
    </div>
  );
}
