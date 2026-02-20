"use client";

import { LayoutDashboard, Megaphone, Settings, LogOut, History } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("advertiser_session");
    if (session) {
      setHandle(JSON.parse(session).handle);
    }
  }, []);

  async function handleLogout() {
    localStorage.removeItem("advertiser_session");
    toast({
      title: "Logged Out",
      description: "You have been successfully signed out.",
    });
    router.push("/login");
  }

  const navLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Campaigns", href: "#", icon: Megaphone },
    { name: "Payments", href: "/requests", icon: History },
    { name: "Admin", href: "/revenue", icon: Settings },
  ];

  return (
    <header className="border-b border-[#333333] bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Megaphone className="text-black" size={20} />
            </div>
            <span className="font-headline text-xl font-bold gold-gradient-text tracking-tight">
              GloAds <span className="text-white font-normal opacity-50">Portal</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-2",
                    isActive ? "text-primary" : "text-white/70 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#171717] px-3 py-1.5 rounded-full border border-[#333333]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-white/70">
                {handle ? `@${handle}` : 'Advertiser Account'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-destructive/10 text-white/60 hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
