"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, QrCode, Smartphone, Send, CheckCircle2, Loader2, Info, AlertCircle, LogIn } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { onAuthStateChanged, User } from "firebase/auth";

export default function DepositPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const upiId = "7681917331@fam";
  const upiUrl = `upi://pay?pa=${upiId}&pn=GloAds&cu=INR`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to submit a deposit request.",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const utr = formData.get("utr") as string;

    try {
      // Use email prefix as advertiserName handle
      const advertiserName = user.displayName || user.email?.split('@')[0] || "Advertiser";

      await addDoc(collection(db, "payment_requests"), {
        amount,
        transactionId: utr,
        status: "Pending",
        upiId: upiId,
        advertiserId: user.uid,
        advertiserEmail: user.email,
        advertiserName: advertiserName,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Deposit Submitted",
        description: "Your verification request has been sent for approval.",
      });
      router.push("/");
    } catch (error: any) {
      console.error("Error submitting deposit:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="text-white/40 mb-8">Add money to your advertiser wallet to launch new campaigns.</p>

        {!authLoading && !user && (
          <Alert variant="destructive" className="mb-8 bg-destructive/10 border-destructive/20 text-destructive border-dashed">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Action Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-4 mt-2">
              <p>Please log in to your account to verify payments and update your wallet balance.</p>
              <Button asChild variant="destructive" size="sm" className="w-fit bg-destructive text-white hover:bg-destructive/80 font-bold">
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn size={14} />
                  Login to Portal
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="mb-8 flex items-center justify-between bg-[#171717] p-4 rounded-xl border border-[#333333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Active Advertiser</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded border border-green-500/20 uppercase">
              Authenticated
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Step 1: Payment Info */}
          <Card className="bg-[#171717] border-[#333333] text-white overflow-hidden shadow-xl">
            <CardHeader className="bg-[#222222] border-b border-[#333333]">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="text-primary" size={20} />
                Step 1: Scan & Pay
              </CardTitle>
              <CardDescription className="text-white/40">Pay using any UPI app like GPay, PhonePe, or Paytm.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl mb-6 shadow-2xl shadow-white/5">
                <QRCode value={upiUrl} size={180} />
              </div>
              
              <div className="text-center space-y-2 mb-8">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Merchant UPI ID</p>
                <p className="text-xl font-headline font-bold text-primary">{upiId}</p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-black font-bold w-full h-12 shadow-lg shadow-primary/20"
                >
                  <a href={upiUrl} className="flex items-center justify-center gap-2">
                    <Smartphone size={18} />
                    Open UPI App
                  </a>
                </Button>
                <p className="text-[10px] text-white/30 text-center">Clicking "Open UPI App" works only on mobile devices.</p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Verification */}
          <Card className="bg-[#171717] border-[#333333] text-white shadow-xl">
            <CardHeader className="bg-[#222222] border-b border-[#333333]">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="text-primary" size={20} />
                Step 2: Verify Payment
              </CardTitle>
              <CardDescription className="text-white/40">Enter your transaction details for approval.</CardDescription>
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
                    disabled={!user}
                    className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary disabled:opacity-50 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="utr" className="text-white/60">Transaction ID (UTR)</Label>
                    <div className="group relative">
                      <Info size={14} className="text-white/20 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-[#333333] text-[10px] text-white/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
                        The 12-digit number found in your UPI app's transaction history.
                      </div>
                    </div>
                  </div>
                  <Input 
                    id="utr" 
                    name="utr" 
                    placeholder="12-digit UTR number" 
                    required 
                    disabled={!user}
                    className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary disabled:opacity-50 h-12"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !user}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 shadow-lg shadow-primary/10 disabled:bg-white/5 disabled:text-white/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Submitting for Approval...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Submit Verification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
