"use client";

import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Loader2, ArrowLeft, Key, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [handleInput, setHandleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecoveredPassword(null);

    try {
      const trimmedHandle = handleInput.trim();
      const cleanHandle = trimmedHandle.startsWith("@") 
        ? trimmedHandle.substring(1).toLowerCase() 
        : trimmedHandle.toLowerCase();

      const q = query(
        collection(db, "advertisers_accounts"), 
        where("handle", "==", cleanHandle)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Handle '@${cleanHandle}' not found.`);
      }

      const adData = querySnapshot.docs[0].data();
      setRecoveredPassword(adData.password);
      
      toast({
        title: "Account Found",
        description: "Your password has been retrieved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Recovery Failed",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4">
      <Link href="/login" className="mb-8 flex items-center gap-2 group">
        <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
          <Megaphone className="text-black" size={20} />
        </div>
        <span className="font-headline text-2xl font-bold gold-gradient-text tracking-tight">
          GloAds <span className="text-white font-normal opacity-50">Portal</span>
        </span>
      </Link>

      <Card className="w-full max-w-md bg-[#171717] border-[#333333] text-white shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-headline gold-gradient-text">Recover Password</CardTitle>
          <CardDescription className="text-white/40">Enter your handle to retrieve your password.</CardDescription>
        </CardHeader>
        <CardContent>
          {!recoveredPassword ? (
            <form onSubmit={handleRecover} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="handle" className="text-white/60">GloVerse Handle</Label>
                <div className="relative">
                  <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <Input
                    id="handle"
                    type="text"
                    placeholder="@yourbrand"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    required
                    className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-12 pl-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-base"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Recover Password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                <p className="text-white/60 text-sm mb-2 uppercase tracking-widest font-bold">Your Password</p>
                <p className="text-3xl font-headline font-bold text-primary tracking-wider">{recoveredPassword}</p>
              </div>
              <Button
                asChild
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <ArrowLeft size={18} />
                  Back to Login
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-white/40 hover:text-primary transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
