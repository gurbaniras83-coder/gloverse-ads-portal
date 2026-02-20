"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, ExternalLink, PlayCircle, Eye, IndianRupee, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type Campaign = {
  id: string;
  title: string;
  status: string;
  budget: number;
  placement: string;
  targetUrl: string;
  createdAt: any;
  views?: number;
  advertiserId: string;
};

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [advertiserId, setAdvertiserId] = useState<string | null>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("advertiser_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setAdvertiserId(session.uid);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!advertiserId) return;

    // Filter by the logged-in advertiser
    const q = query(
      collection(db, "ad_campaigns"), 
      where("advertiserId", "==", advertiserId),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [advertiserId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#171717] rounded-xl border border-[#333333]">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-white/40 font-medium">Loading your analytics...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#171717] rounded-xl border border-[#333333] border-dashed">
        <div className="bg-white/5 p-4 rounded-full mb-4">
          <PlayCircle className="text-white/20" size={40} />
        </div>
        <h3 className="text-white/80 font-headline text-lg mb-1">No campaigns found</h3>
        <p className="text-white/40 text-sm">Launch an ad to see performance metrics here.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] rounded-xl border border-[#333333] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#222222]">
          <TableRow className="border-[#333333] hover:bg-transparent">
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Campaign Details</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Analytics</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Status</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold text-right">Spend/Budget</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const views = campaign.views || 0;
            const spent = views * 0.10; // ₹0.10 per view
            const isExhausted = spent >= campaign.budget;
            
            return (
              <TableRow key={campaign.id} className="border-[#333333] hover:bg-white/5 transition-colors">
                <TableCell className="font-medium py-5">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold">{campaign.title}</span>
                    <span className="text-[10px] text-white/30 flex items-center gap-1 mt-1">
                      {campaign.placement}
                      <span className="mx-1">•</span>
                      {campaign.createdAt?.toDate ? format(campaign.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}
                    </span>
                    {campaign.targetUrl && (
                      <a 
                        href={campaign.targetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1 w-fit"
                      >
                        Destination <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Eye size={12} className="text-primary" />
                      <span>{views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <IndianRupee size={12} className="text-green-500" />
                      <span>₹{spent.toFixed(2)} spent</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isExhausted ? (
                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] uppercase font-bold px-2 py-0.5">
                      <AlertCircle size={10} className="mr-1" />
                      Budget Exhausted
                    </Badge>
                  ) : (
                    <Badge 
                      variant="secondary" 
                      className={`
                        font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                        ${campaign.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                        ${campaign.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}
                        ${campaign.status === 'Rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' : ''}
                      `}
                    >
                      {campaign.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-headline font-bold text-white text-sm">₹{spent.toFixed(0)}</span>
                    <span className="text-[10px] text-white/20 uppercase">of ₹{campaign.budget.toLocaleString()}</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
