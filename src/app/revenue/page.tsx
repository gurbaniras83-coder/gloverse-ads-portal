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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  setDoc, 
  increment 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2, IndianRupee, History } from "lucide-react";
import { format } from "date-fns";

export default function RevenuePage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "payment_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleApprove(request: any) {
    if (!request.advertiserId || request.advertiserId === "undefined") {
      toast({
        variant: "destructive",
        title: "Cannot Approve",
        description: "Missing Advertiser ID. Please delete this request.",
      });
      return;
    }

    setProcessingId(request.id);
    try {
      // 1. Update request status
      await updateDoc(doc(db, "payment_requests", request.id), {
        status: "Approved",
        approvedAt: new Date(),
      });

      // 2. Update advertiser balance
      const statsRef = doc(db, "advertiser_stats", request.advertiserId);
      const statsSnap = await getDoc(statsRef);

      if (statsSnap.exists()) {
        await updateDoc(statsRef, {
          balance: increment(request.amount),
          totalDeposited: increment(request.amount),
          updatedAt: new Date()
        });
      } else {
        await setDoc(statsRef, {
          balance: request.amount,
          totalDeposited: request.amount,
          updatedAt: new Date()
        });
      }

      toast({
        title: "Payment Approved",
        description: `₹${request.amount} has been added to @${request.advertiserHandle}'s wallet.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message,
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(requestId: string) {
    if (!confirm("Are you sure you want to delete this payment request?")) return;
    
    try {
      await deleteDoc(doc(db, "payment_requests", requestId));
      toast({
        title: "Request Deleted",
        description: "The payment request has been removed from records.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-12">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl gold-gradient-text">Revenue & Verifications</h1>
            <p className="text-white/40">Manage advertiser deposits and approve wallet top-ups.</p>
          </div>
          <div className="bg-[#171717] px-4 py-2 rounded-lg border border-primary/20 flex items-center gap-3">
            <History className="text-primary" size={20} />
            <span className="text-sm font-medium">History Log</span>
          </div>
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
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Advertiser</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Amount</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">UTR / Transaction</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Date</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px]">Status</TableHead>
                  <TableHead className="text-white/40 font-bold uppercase text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-white/20">No payment requests found.</TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} className="border-[#333333] hover:bg-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">@{request.advertiserHandle || 'Unknown'}</span>
                          <span className="text-[10px] text-white/30">{request.advertiserId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-headline font-bold text-primary text-lg">
                        ₹{request.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white/60">
                        {request.transactionId}
                      </TableCell>
                      <TableCell className="text-xs text-white/40">
                        {request.createdAt?.toDate ? format(request.createdAt.toDate(), 'MMM dd, HH:mm') : 'Now'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`
                            px-2 py-0.5 rounded text-[10px] uppercase font-bold
                            ${request.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}
                          `}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'Pending' && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              disabled={processingId === request.id}
                              onClick={() => handleApprove(request)}
                              className="h-8 w-8 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black"
                            >
                              <Check size={16} />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleDelete(request.id)}
                            className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                          >
                            <X size={16} />
                          </Button>
                        </div>
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
