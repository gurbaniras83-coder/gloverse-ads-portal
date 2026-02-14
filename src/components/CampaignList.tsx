"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
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
import { Loader2, ExternalLink, PlayCircle } from "lucide-react";
import { format } from "date-fns";

type Campaign = {
  id: string;
  title: string;
  status: string;
  budget: number;
  placement: string;
  targetLink: string;
  createdAt: any;
};

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "ad_campaigns"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#171717] rounded-xl border border-[#333333]">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-white/40 font-medium">Loading your campaigns...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#171717] rounded-xl border border-[#333333] border-dashed">
        <div className="bg-white/5 p-4 rounded-full mb-4">
          <PlayCircle className="text-white/20" size={40} />
        </div>
        <h3 className="text-white/80 font-headline text-lg mb-1">No campaigns yet</h3>
        <p className="text-white/40 text-sm">Create your first ad campaign to start reaching people.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] rounded-xl border border-[#333333] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#222222]">
          <TableRow className="border-[#333333] hover:bg-transparent">
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Campaign</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Status</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Placement</TableHead>
            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest font-bold text-right">Budget</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="border-[#333333] hover:bg-white/5 transition-colors">
              <TableCell className="font-medium py-5">
                <div className="flex flex-col">
                  <span className="text-white font-semibold">{campaign.title}</span>
                  <span className="text-[10px] text-white/30 flex items-center gap-1 mt-1">
                    {campaign.createdAt ? format(campaign.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}
                    <span className="mx-1">•</span>
                    <a href={campaign.targetLink} target="_blank" className="hover:text-primary flex items-center gap-1">
                      Link <ExternalLink size={10} />
                    </a>
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`
                    font-medium px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider
                    ${campaign.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                    ${campaign.status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}
                  `}
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs text-white/60">{campaign.placement}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-headline font-semibold text-primary">₹{campaign.budget.toLocaleString()}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
