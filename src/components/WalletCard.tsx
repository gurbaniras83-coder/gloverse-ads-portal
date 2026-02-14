"use client";

import { useState } from "react";
import { Wallet, ArrowUpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WalletCard() {
  const [balance, setBalance] = useState(0);

  const handleDeposit = () => {
    // In a real app, this would open a payment gateway
    setBalance(prev => prev + 500);
  };

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
          <span className="text-4xl font-headline font-bold text-white tracking-tighter">
            ₹{balance.toLocaleString()}
          </span>
          <span className="text-white/40 ml-2 text-sm">INR</span>
        </div>

        <Button 
          onClick={handleDeposit}
          className="w-full bg-[#333333] hover:bg-[#444444] text-white border border-primary/20 hover:border-primary/40 transition-all font-semibold py-6"
        >
          <ArrowUpCircle className="mr-2 text-primary" size={20} />
          Deposit Money
        </Button>
      </div>
      
      <div className="bg-[#222222] px-6 py-3 border-t border-[#333333]">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold text-center">
          Secure Payments by GloVerse
        </p>
      </div>
    </div>
  );
}
