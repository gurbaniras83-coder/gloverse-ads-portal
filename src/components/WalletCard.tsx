"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("advertiser_session");
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      
      if (parsed.uid === "founder-admin") {
        setBalance(999999);
        return;
      }

      // Live listener for real-time balance updates
      const unsubscribe = onSnapshot(doc(db, "advertisers_accounts", parsed.uid), (doc) => {
        if (doc.exists()) {
          setBalance(doc.data().walletBalance || 0);
        } else {
          setBalance(0);
        }
      }, (error) => {
        console.error("Wallet listener error:", error);
        setBalance(0);
      });
      return () => unsubscribe();
    } else {
      setBalance(0);
    }
  }, []);

  return (
    <div className="bg-[#171717] rounded-xl border border-[#333333] overflow-hidden gold-glow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/60">
            <Wallet size={18} />
            <span className="text-sm font-medium uppercase tracking-wider">Wallet Balance</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info size={16} className="text-white/40" />
              </TooltipTrigger>
              <TooltipContent className="bg-[#171717] border-[#333333] text-white">
                <p>Funds used to run your ad campaigns.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="mb-6">
          {balance === null ? (
            <Loader2 className="animate-spin text-primary" size={24} />
          ) : (
            <>
              <span className="text-4xl font-headline font-bold text-white tracking-tighter">
                ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-white/40 ml-2 text-sm">INR</span>
            </>
          )}
        </div>

        <Link href="/deposit">
          <Button 
            className="w-full bg-[#333333] hover:bg-[#444444] text-white border border-primary/20 hover:border-primary/40 transition-all font-semibold py-6"
          >
            <ArrowUpCircle className="mr-2 text-primary" size={20} />
            Deposit Money
          </Button>
        </Link>
      </div>
      
      <div className="bg-[#222222] px-6 py-3 border-t border-[#333333]">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold text-center">
          Secure Payments by GloVerse
        </p>
      </div>
    </div>
  );
}
