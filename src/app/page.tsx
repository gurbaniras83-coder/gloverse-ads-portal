import { DashboardHeader } from "@/components/DashboardHeader";
import { WalletCard } from "@/components/WalletCard";
import { CampaignList } from "@/components/CampaignList";
import { ReachEstimator } from "@/components/ReachEstimator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <WalletCard />
            <ReachEstimator />
            <div className="bg-[#171717] p-6 rounded-xl border border-[#333333]">
              <h3 className="font-headline text-lg mb-4 text-primary">Quick Actions</h3>
              <Link href="/campaign/new">
                <Button className="w-full bg-primary hover:bg-primary/90 text-black font-semibold flex items-center justify-center gap-2">
                  <PlusCircle size={18} />
                  New Ad Campaign
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl gold-gradient-text">Recent Campaigns</h2>
              <Link href="/campaign/new" className="text-primary text-sm hover:underline">View All</Link>
            </div>
            <CampaignList />
          </div>
        </div>
      </main>
    </div>
  );
}
