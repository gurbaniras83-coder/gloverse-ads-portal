"use client";

import { LayoutDashboard, Megaphone, Settings, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const router = useRouter();
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
            <Link href="/" className="text-sm font-medium text-primary flex items-center gap-2">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link href="#" className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-2">
              <Megaphone size={16} />
              Campaigns
            </Link>
            <Link href="/revenue" className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-2">
              <Settings size={16} />
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#171717] px-3 py-1.5 rounded-full border border-[#333333]">
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