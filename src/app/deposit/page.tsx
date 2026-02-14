
"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, QrCode, Smartphone, Send, CheckCircle2, Loader2, Info } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const upiId = "7681917331@fam";
  const upiUrl = `upi://pay?pa=${upiId}&pn=GloAds&cu=INR`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const utr = formData.get("utr") as string;

    try {
      await addDoc(collection(db, "payment_requests"), {
        amount,
        transactionId: utr,
        status: "Pending",
        upiId: upiId,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Deposit Submitted",
        description: "Your verification request has been sent for approval.",
      });
      router.push("/");
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not submit your request. Please try again.",
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

        <div className="grid grid-cols-1 gap-8">
          {/* Step 1: Payment Info */}
          <Card className="bg-[#171717] border-[#333333] text-white overflow-hidden">
            <CardHeader className="bg-[#222222] border-b border-[#333333]">
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="text-primary" size={20} />
                Step 1: Scan & Pay
              </CardTitle>
              <CardDescription className="text-white/40">Pay using any UPI app like GPay, PhonePe, or Paytm.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl mb-6">
                <QRCode value={upiUrl} size={180} />
              </div>
              
              <div className="text-center space-y-2 mb-8">
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">UPI ID</p>
                <p className="text-xl font-headline font-bold text-primary">{upiId}</p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-black font-bold w-full h-12"
                >
                  <a href={upiUrl} className="flex items-center justify-center gap-2">
                    <Smartphone size={18} />
                    Open UPI App
                  </a>
                </Button>
                <p className="text-[10px] text-white/30 text-center">Clicking "Open UPI App" only works on mobile devices.</p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Verification */}
          <Card className="bg-[#171717] border-[#333333] text-white">
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
                    className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="utr" className="text-white/60">Transaction ID (UTR)</Label>
                    <div className="group relative">
                      <Info size={14} className="text-white/20 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-[#333333] text-[10px] text-white/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        The 12-digit number found in your UPI app's transaction history.
                      </div>
                    </div>
                  </div>
                  <Input 
                    id="utr" 
                    name="utr" 
                    placeholder="12-digit UTR number" 
                    required 
                    className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 shadow-lg shadow-primary/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Submitting...
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
