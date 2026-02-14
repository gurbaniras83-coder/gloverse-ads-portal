"use client";

import { useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function ReachEstimator() {
  const [budget, setBudget] = useState(500);

  // Formula: For every ₹1 spent, show an estimated reach of 9 to 11 people.
  const estimatedMin = Math.floor(budget * 9);
  const estimatedMax = Math.floor(budget * 11);

  return (
    <div className="bg-[#171717] p-6 rounded-xl border border-primary/20 gold-glow space-y-6 relative overflow-hidden transition-all hover:border-primary/40">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TrendingUp size={80} />
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Users className="text-primary" size={20} />
        </div>
        <h2 className="font-headline text-lg text-white">Reach Estimator</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm font-medium">Daily Budget</span>
          <span className="text-primary font-bold text-xl tracking-tight">₹{budget.toLocaleString()}</span>
        </div>
        
        <Slider 
          value={[budget]} 
          min={80} 
          max={10000} 
          step={10} 
          onValueChange={(vals) => setBudget(vals[0])}
          className="py-4 cursor-pointer"
        />

        <div className="bg-[#0F0F0F] p-5 rounded-lg border border-[#333333] text-center shadow-inner">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Estimated Total Reach</p>
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-headline font-bold gold-gradient-text drop-shadow-sm animate-in fade-in zoom-in duration-300">
              {estimatedMin.toLocaleString()} - {estimatedMax.toLocaleString()}
            </span>
            <span className="text-white/30 text-xs mt-2 font-medium">Potential Daily Views</span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-white/20 text-center leading-tight">
        * Estimations are based on average GloVerse performance metrics and may vary by placement.
      </p>
    </div>
  );
}
