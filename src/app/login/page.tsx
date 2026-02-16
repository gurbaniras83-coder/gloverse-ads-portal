"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInAnonymously, updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Loader2, ArrowRight, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const [handleInput, setHandleInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem("gloads_advertiser_session");
    if (session && auth.currentUser) {
      router.push("/deposit");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedHandle = handleInput.trim();
      const trimmedPassword = passwordInput.trim();
      
      const cleanHandle = trimmedHandle.startsWith("@") 
        ? trimmedHandle.substring(1).toLowerCase() 
        : trimmedHandle.toLowerCase();
      
      let advertiserData = null;

      // 1. Founder Bypass Check
      if (cleanHandle === "gloverse" && trimmedPassword === "waheguru786") {
        advertiserData = {
          uid: "founder-admin",
          handle: "gloverse",
          displayName: "GloVerse Founder"
        };
      } else {
        // 2. Regular Channel Check
        const q = query(
          collection(db, "channels"), 
          where("handle", "==", cleanHandle)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error(`Handle '${cleanHandle}' not found.`);
        }

        const channelDoc = querySnapshot.docs[0];
        const channelData = channelDoc.data();

        if (channelData.password !== trimmedPassword) {
          throw new Error("Invalid password.");
        }

        advertiserData = {
          uid: channelDoc.id,
          handle: channelData.handle || cleanHandle,
          displayName: channelData.name || channelData.handle || cleanHandle
        };
      }

      // 3. Establish REAL Firebase Auth Session
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, {
        displayName: advertiserData.handle
      });

      // 4. Save Session Metadata
      localStorage.setItem("gloads_advertiser_session", JSON.stringify({
        ...advertiserData,
        firebaseUid: userCredential.user.uid
      }));

      toast({
        title: "Login Successful",
        description: `Logged in as @${advertiserData.handle}`,
      });
      
      router.push("/deposit");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Something went wrong.",
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
          <CardDescription className="text-white/40">Enter your GloVerse handle and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="handle" className="text-white/60">GloVerse Handle</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input
                  id="handle"
                  type="text"
                  placeholder="@yourhandle"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  required
                  className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-12 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/60">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  );
}