"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, QrCode, Smartphone, Send, CheckCircle2, Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function DepositPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [advertiserHandle, setAdvertiserHandle] = useState<string | null>(null);

  const upiId = "7681917331@fam";
  const upiUrl = `upi://pay?pa=${upiId}&pn=GloAds&cu=INR`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please log in again to continue.",
        });
        router.push("/login");
      } else {
        setAdvertiserHandle(user.displayName || "advertiser");
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Your session has expired. Please log in again.",
      });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const utr = formData.get("utr") as string;

    // Strict validation to prevent 'undefined' values
    const advertiserId = user.uid;
    const advertiserHandleValue = user.displayName || advertiserHandle || "Unknown";

    if (!advertiserId || advertiserId === "undefined") {
      toast({
        variant: "destructive",
        title: "Invalid Session",
        description: "Could not identify advertiser. Please re-login.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "payment_requests"), {
        amount,
        transactionId: utr,
        status: "Pending",
        upiId: upiId,
        advertiserId: advertiserId,
        advertiserHandle: advertiserHandleValue,
        advertiserEmail: user.email || "No Email",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Deposit Submitted",
        description: "Payment verification sent for approval.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-12">
      <DashboardHeader />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors text-sm mb-6">
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="font-headline text-3xl gold-gradient-text mb-2">Deposit Funds</h1>
        <p className="text-white/40 mb-8">Add money to your wallet via UPI and verify below.</p>

        <div className="mb-8 flex items-center justify-between bg-[#171717] p-4 rounded-xl border border-[#333333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              <UserIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Authenticated Advertiser</p>
              <p className="text-sm font-medium">@{advertiserHandle}</p>
            </div>
          </div>
          <div className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-500/20 uppercase">
            Verified session
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-[#171717] border-[#333333] text-white overflow-hidden shadow-xl">
            <CardHeader className="bg-[#222222] border-b border-[#333333]">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="text-primary" size={20} />
                Step 1: Scan & Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl mb-6">
                <QRCode value={upiUrl} size={180} />
              </div>
              <p className="text-xl font-headline font-bold text-primary mb-8">{upiId}</p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-black font-bold w-full h-12">
                <a href={upiUrl} className="flex items-center justify-center gap-2">
                  <Smartphone size={18} />
                  Open UPI App
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#171717] border-[#333333] text-white shadow-xl">
            <CardHeader className="bg-[#222222] border-b border-[#333333]">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="text-primary" size={20} />
                Step 2: Verify Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white/60">Amount Paid (₹)</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    placeholder="e.g. 500" 
                    required 
                    className="bg-[#0F0F0F] border-[#333333] text-white h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utr" className="text-white/60">Transaction ID (UTR)</Label>
                  <Input 
                    id="utr" 
                    name="utr" 
                    placeholder="12-digit UTR number" 
                    required 
                    className="bg-[#0F0F0F] border-[#333333] text-white h-12"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send size={18} className="mr-2" />}
                  Submit Verification
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}