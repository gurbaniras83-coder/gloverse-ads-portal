import { DashboardHeader } from "@/components/DashboardHeader";
import { AdCampaignForm } from "@/components/AdCampaignForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-12">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors text-sm mb-4">
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="font-headline text-3xl gold-gradient-text">Create Ad Campaign</h1>
          <p className="text-white/40 mt-1">Set up your advertisement and reach your target audience.</p>
        </div>

        <AdCampaignForm />
      </main>
    </div>
  );
}
