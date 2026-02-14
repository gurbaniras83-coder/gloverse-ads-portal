import { LayoutDashboard, Megaphone, Settings, User } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="border-b border-[#333333] bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Megaphone className="text-black" size={20} />
            </div>
            <span className="font-headline text-xl font-bold gold-gradient-text tracking-tight">
              GloAds <span className="text-white font-normal opacity-50">Portal</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-primary flex items-center gap-2">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link href="#" className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-2">
              <Megaphone size={16} />
              Campaigns
            </Link>
            <Link href="#" className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-2">
              <Settings size={16} />
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#171717] px-3 py-1.5 rounded-full border border-[#333333]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-white/70">Advertiser Account</span>
            </div>
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <User size={20} className="text-white/70" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
