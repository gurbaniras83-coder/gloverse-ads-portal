"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, History, IndianRupee, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
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

    // SIMPLIFIED QUERY: No orderBy used here to avoid Firebase Index requirements
    const q = query(
      collection(db, "payment_requests"), 
      where("advertiserId", "==", advertiserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // MANUAL SORTING & FILTERING: Done in JS to bypass Index errors
      const sortedDocs = docs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setRequests(sortedDocs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [advertiserId]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-12">
      <DashboardHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors text-sm mb-4">
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="font-headline text-3xl gold-gradient-text">Payment History</h1>
          <p className="text-white/40">Track your deposit verifications and wallet top-ups.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="bg-[#171717] rounded-xl border border-[#333333] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#222222]">
                <TableRow className="border-[#333333]">
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Date</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Amount</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Transaction ID</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4 text-white/20">
                        <History size={48} />
                        <p>No payment requests found.</p>
                        <Button asChild variant="outline" className="border-[#333333] text-white hover:bg-white/5">
                          <Link href="/deposit">Make a Deposit</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} className="border-[#333333] hover:bg-white/5 transition-colors">
                      <TableCell className="text-xs text-white/60">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-white/20" />
                          {request.createdAt?.toDate ? format(request.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Processing...'}
                        </div>
                      </TableCell>
                      <TableCell className="font-headline font-bold text-primary">
                        <div className="flex items-center gap-1">
                          <IndianRupee size={14} />
                          {request.amount?.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-white/40">
                        {request.transactionId}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`
                            px-2 py-0.5 rounded text-[10px] uppercase font-bold
                            ${request.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                            ${request.status === 'Approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}
                            ${request.status === 'Rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' : ''}
                          `}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
