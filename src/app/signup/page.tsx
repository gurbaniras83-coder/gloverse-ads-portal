"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Loader2, ArrowRight, User as UserIcon, Mail, Phone, Lock, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    handle: "",
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedHandle = formData.handle.trim();
      const cleanHandle = trimmedHandle.startsWith("@") 
        ? trimmedHandle.substring(1).toLowerCase() 
        : trimmedHandle.toLowerCase();

      // 1. Check for unique handle in advertisers_accounts
      const q = query(
        collection(db, "advertisers_accounts"), 
        where("handle", "==", cleanHandle)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("This handle is already taken. Please choose another.");
      }

      // 2. Create advertiser account document
      await addDoc(collection(db, "advertisers_accounts"), {
        handle: cleanHandle,
        fullName: formData.fullName,
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        walletBalance: 0,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Registration Successful",
        description: "Your GloAds account has been created. Please log in.",
      });
      
      router.push("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4 py-12">
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
          <CardTitle className="text-2xl font-headline gold-gradient-text">Create Advertiser Account</CardTitle>
          <CardDescription className="text-white/40">Launch your brand on GloVerse today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle" className="text-white/60">GloVerse Handle</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input
                  id="handle"
                  type="text"
                  placeholder="@yourbrand"
                  value={formData.handle}
                  onChange={handleInputChange}
                  required
                  className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-11 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-white/60">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input
                  id="businessName"
                  type="text"
                  placeholder="GloVerse Media Group"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-11 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/60">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60">Business Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input
                  id="email"
                  type="email"
                  placeholder="ads@gloverse.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-11 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/60">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-11 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary h-11 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-base group mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">
                  Register Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log In here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}