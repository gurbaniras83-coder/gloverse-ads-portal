"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Script from "next/script";
import { 
  Megaphone, 
  Link as LinkIcon, 
  Layout, 
  Users, 
  Loader2, 
  CheckCircle2,
  Upload,
  PartyPopper,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

declare global {
  interface Window {
    cloudinary: any;
  }
}

export function AdCampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budget, setBudget] = useState(80);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Wallet Balance State
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [advertiserId, setAdvertiserId] = useState<string | null>(null);

  // Cloudinary States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Reach Formula: 9 to 11 people per ₹1
  const estimatedMin = Math.floor(budget * 9);
  const estimatedMax = Math.floor(budget * 11);

  // Fetch Session & Wallet Balance
  useEffect(() => {
    const sessionStr = localStorage.getItem("gloads_advertiser_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setAdvertiserId(session.uid);

      const unsubscribe = onSnapshot(doc(db, "advertisers_data", session.uid), (doc) => {
        if (doc.exists()) {
          setWalletBalance(doc.data().walletBalance || 0);
        } else {
          setWalletBalance(0);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleOpenWidget = useCallback(() => {
    if (!window.cloudinary) return;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "doabiexyv",
        uploadPreset: "gloverse_upload",
        resourceType: "video",
        clientAllowedFormats: ["mp4"],
        maxFileSize: 50000000, // 50MB
        multiple: false,
      },
      (error: any, result: any) => {
        if (error) {
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Failed to initialize the upload widget.",
          });
          setIsUploading(false);
          return;
        }

        if (result.event === "upload-progress") {
          setIsUploading(true);
          setUploadProgress(result.info.progress);
        }

        if (result.event === "success") {
          setVideoUrl(result.info.secure_url);
          setPublicId(result.info.public_id);
          setIsUploading(false);
          setUploadProgress(100);
          toast({
            title: "Video Uploaded",
            description: "Your ad video has been processed successfully.",
          });
        }
      }
    );

    widget.open();
  }, [toast]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (walletBalance !== null && walletBalance < budget) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Please deposit funds to your wallet to launch this campaign.",
      });
      return;
    }

    if (!advertiserId) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Could not identify advertiser. Please re-login.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const title = formData.get("title") as string;
      const targetUrl = formData.get("targetUrl") as string;
      const placement = formData.get("placement") as string;

      if (!videoUrl) {
        toast({
          variant: "destructive",
          title: "Ad Video Required",
          description: "Please upload a video for your ad campaign.",
        });
        setIsSubmitting(false);
        return;
      }

      // Save to Firestore
      await addDoc(collection(db, "ad_campaigns"), {
        title,
        targetUrl,
        videoUrl,
        publicId,
        placement,
        budget,
        advertiserId,
        estimatedReach: { min: estimatedMin, max: estimatedMax },
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Something went wrong while creating your campaign.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isInsufficientFunds = walletBalance !== null && walletBalance < budget;

  return (
    <>
      <Script 
        src="https://upload-widget.cloudinary.com/global/all.js" 
        strategy="afterInteractive"
      />
      
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Ad Details Section */}
        <div className="bg-[#171717] p-8 rounded-xl border border-[#333333] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="text-primary" size={20} />
            <h2 className="font-headline text-xl">Ad Content</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white/60">Ad Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Summer Sale 2024" 
                required 
                className="bg-[#0F0F0F] border-[#333333] text-white focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUrl" className="text-white/60">Target URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <Input 
                  id="targetUrl" 
                  name="targetUrl" 
                  placeholder="https://gloverse.com/sale" 
                  type="url" 
                  required 
                  className="pl-10 bg-[#0F0F0F] border-[#333333] text-white focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-white/60">Ad Video</Label>
            
            {!videoUrl && !isUploading && (
              <div 
                onClick={handleOpenWidget}
                className="flex flex-col items-center justify-center border-2 border-dashed border-[#333333] rounded-xl p-12 bg-[#0F0F0F] hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-primary" size={32} />
                </div>
                <p className="text-white font-medium">Click to upload ad video</p>
                <p className="text-white/30 text-xs mt-2">MP4 format required • Max 50MB</p>
              </div>
            )}

            {isUploading && (
              <div className="bg-[#0F0F0F] p-8 rounded-xl border border-[#333333] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 flex items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={16} />
                    Uploading to GloVerse servers...
                  </span>
                  <span className="text-primary font-bold">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-[#171717]" />
              </div>
            )}

            {videoUrl && (
              <div className="space-y-4">
                <div className="relative group rounded-xl overflow-hidden border border-[#333333] bg-black aspect-video flex items-center justify-center">
                  <video 
                    src={videoUrl} 
                    className="max-h-[400px] w-full object-contain"
                    controls
                  />
                  <div className="absolute top-4 right-4">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      onClick={handleOpenWidget}
                      className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border-white/10"
                    >
                      Replace Video
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-500 text-xs font-medium bg-green-500/10 w-fit px-3 py-1.5 rounded-full border border-green-500/20">
                  <CheckCircle2 size={14} />
                  Video Ready for Launch
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#171717] p-8 rounded-xl border border-[#333333] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Layout className="text-primary" size={20} />
              <h2 className="font-headline text-xl">Placement</h2>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white/60">Where should your ad appear?</Label>
              <Select name="placement" defaultValue="Home Top" required>
                <SelectTrigger className="bg-[#0F0F0F] border-[#333333] text-white">
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border-[#333333] text-white">
                  <SelectItem value="Home Top">Home Top (Main Header)</SelectItem>
                  <SelectItem value="In-Shorts Feed">In-Shorts Feed (Viral Reach)</SelectItem>
                  <SelectItem value="Search Top">Search Top (Intent-based)</SelectItem>
                  <SelectItem value="Video Start">Video Start (Pre-roll)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reach Estimator */}
          <div className="bg-[#171717] p-8 rounded-xl border border-primary/20 gold-glow space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Users size={80} />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Users className="text-primary" size={20} />
              <h2 className="font-headline text-xl">Reach Estimator</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Daily Budget</span>
                <span className="text-primary font-bold">₹{budget}</span>
              </div>
              
              <Slider 
                value={[budget]} 
                min={80} 
                max={10000} 
                step={10} 
                onValueChange={(vals) => setBudget(vals[0])}
                className="py-4"
              />

              <div className="bg-[#0F0F0F] p-4 rounded-lg border border-[#333333] text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-1">Estimated Reach</p>
                <p className="text-2xl font-headline font-bold gold-gradient-text">
                  {estimatedMin.toLocaleString()} - {estimatedMax.toLocaleString()}
                  <span className="text-sm font-normal text-white/40 ml-2">views</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {isInsufficientFunds && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Insufficient Funds</AlertTitle>
            <AlertDescription className="flex items-center justify-between mt-2">
              <span>Your balance (₹{walletBalance?.toLocaleString()}) is lower than your daily budget.</span>
              <Link href="/deposit">
                <Button size="sm" variant="destructive" className="bg-destructive text-white hover:bg-destructive/80 font-bold">
                  Deposit Now
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="border-[#333333] text-white/60 hover:bg-white/5"
          >
            Discard Changes
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading || isInsufficientFunds}
            className={`
              font-bold px-12 py-6 rounded-lg text-lg flex items-center gap-3 shadow-lg 
              ${isInsufficientFunds ? 'bg-white/5 text-white/20 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 text-black shadow-primary/20'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Launching...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Launch Campaign
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#171717] border-[#333333] text-white max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-primary/20 p-4 rounded-full">
              <PartyPopper className="text-primary" size={48} />
            </div>
            <DialogTitle className="text-2xl font-headline gold-gradient-text">Campaign Sent for Founder's Approval!</DialogTitle>
            <DialogDescription className="text-white/60 text-base">
              Your campaign has been successfully submitted and is currently in <span className="text-primary font-bold">Pending</span> review. You'll be notified once it goes live.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <Button 
              className="bg-primary hover:bg-primary/90 text-black font-bold px-8" 
              onClick={() => router.push("/")}
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
