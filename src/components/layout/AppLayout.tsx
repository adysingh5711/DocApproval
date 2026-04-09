"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Search, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // Import useState

// Import Button and Dialog components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function NavItem({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // State for dialog

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true); // Open the dialog
  };

  const confirmLogout = () => {
    window.location.href = "/"; // Perform logout redirection
  };

  // Main layout structure with sidebar and mobile nav
  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      <aside className="w-64 border-r bg-white p-6 flex flex-col gap-8 hidden md:flex shrink-0">
        <div className="flex items-center gap-2 px-2 shrink-0">
          <img src="/images/DocApproval-logo/DocApproval-full-violet.svg" alt="DocApproval Logo" className="h-9" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
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
            label="Settings"
            href="/settings"
            active={pathname.startsWith("/settings")}
          />
        </nav>

        <div className="pt-4 border-t shrink-0">
          <button
            onClick={handleLogoutClick} // Use handler to open dialog
            className="flex items-center gap-3 text-slate-500 hover:text-rose-600 transition-colors px-3 py-2 w-full"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50 shrink-0">
        <Link href="/dashboard" className={`p-2 rounded-full ${pathname === "/dashboard" ? "text-indigo-600 bg-indigo-50" : "text-slate-500"}`}>
          <LayoutDashboard size={24} />
        </Link>
        <Link href="/analyse" className={`p-2 rounded-full ${pathname.startsWith("/analyse") ? "text-indigo-600 bg-indigo-50" : "text-slate-500"}`}>
          <Search size={24} />
        </Link>
        <Link href="/settings" className={`p-2 rounded-full ${pathname.startsWith("/settings") ? "text-indigo-600 bg-indigo-50" : "text-slate-500"}`}>
          <Settings size={24} />
        </Link>
        {/* Logout button for mobile */}
        <button
          onClick={handleLogoutClick} // Use handler to open dialog
          className={`p-2 rounded-full ${pathname.startsWith("/login") ? "text-rose-600 bg-rose-50" : "text-slate-500 hover:text-rose-600"}`}
        >
          <LogOut size={24} />
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {children}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure you want to log out?</DialogTitle>
            <DialogDescription>
              This will end your current session. You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:items-center">
            <DialogClose
              render={(props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
                <Button {...props} variant="outline">
                  Cancel
                </Button>
              )}
            />
            <Button variant="destructive" onClick={confirmLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
