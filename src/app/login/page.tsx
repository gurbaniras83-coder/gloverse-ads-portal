"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/deposit");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your advertiser portal.",
      });
      router.push("/deposit");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
          <Megaphone className="text-black" size={20} />
        </div>
        <span className="font-headline text-2xl font-bold gold-gradient-text tracking-tight">
          GloAds <span className="text-white font-normal opacity-50">Portal</span>
        </span>
      </Link>

      <Card className="w-full max-w-md bg-[#171717] border-[#333333] text-white shadow-2xl shadow-primary/5">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-headline gold-gradient-text">Advertiser Login</CardTitle>
          <CardDescription className="text-white/40">Enter your GloVerse credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="advertiser@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-12"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" university-hint="password" className="text-white/60">Password</Label>
                <Link href="#" className="text-xs text-primary/60 hover:text-primary">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-base group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[#333333] text-center">
            <p className="text-white/40 text-sm">
              New to GloAds? <Link href="#" className="text-primary hover:underline">Contact sales for an account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-white/20 text-xs">
        &copy; 2024 GloVerse Technologies • Secure Advertiser Access
      </p>
    </div>
  );
}
