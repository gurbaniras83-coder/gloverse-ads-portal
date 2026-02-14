"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Megaphone, 
  Link as LinkIcon, 
  Video, 
  Layout, 
  Users, 
  Loader2, 
  CheckCircle2,
  Upload
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
import { useToast } from "@/hooks/use-toast";

export function AdCampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budget, setBudget] = useState(80);
  const [adVideo, setAdVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Estimates: ₹80 = 700-900 views. 
  // Let's use a scale: Base ratio is approx 10x budget
  const estimatedMin = Math.floor(budget * 8.75);
  const estimatedMax = Math.floor(budget * 11.25);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    // Mock Cloudinary upload logic
    // In a real app, you would use:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('upload_preset', 'your_preset');
    // const res = await fetch('https://api.cloudinary.com/v1_1/your_cloud/video/upload', { ... });
    // return res.json().secure_url;
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
    return "https://res.cloudinary.com/demo/video/upload/dog.mp4"; // Mock URL
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const title = formData.get("title") as string;
      const targetLink = formData.get("targetLink") as string;
      const placement = formData.get("placement") as string;

      if (!adVideo) {
        toast({
          variant: "destructive",
          title: "Ad Video Required",
          description: "Please upload a video for your ad campaign.",
        });
        setIsSubmitting(false);
        return;
      }

      // 1. Upload Video to Cloudinary
      const videoUrl = await uploadToCloudinary(adVideo);

      // 2. Save to Firestore
      const docRef = await addDoc(collection(db, "ad_campaigns"), {
        title,
        targetLink,
        videoUrl,
        placement,
        budget,
        reachEstimate: { min: estimatedMin, max: estimatedMax },
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Campaign Launched!",
        description: "Your campaign is now pending review.",
      });

      router.push("/");
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

  return (
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
            <Label htmlFor="targetLink" className="text-white/60">Target Link (URL)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <Input 
                id="targetLink" 
                name="targetLink" 
                placeholder="https://gloverse.com/sale" 
                type="url" 
                required 
                className="pl-10 bg-[#0F0F0F] border-[#333333] text-white focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/60">Ad Video</Label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#333333] rounded-xl p-8 bg-[#0F0F0F] hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group">
            {videoPreview ? (
              <video 
                src={videoPreview} 
                className="max-h-60 w-full object-contain rounded-lg"
                controls
              />
            ) : (
              <>
                <Upload className="text-white/20 mb-4 group-hover:text-primary transition-colors" size={48} />
                <p className="text-white/60 text-sm font-medium">Click to upload video or drag and drop</p>
                <p className="text-white/30 text-xs mt-1">MP4, MOV up to 50MB</p>
              </>
            )}
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleVideoChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
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
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-1">Estimated Reach</p>
              <p className="text-2xl font-headline font-bold text-white">
                {estimatedMin.toLocaleString()} - {estimatedMax.toLocaleString()}
                <span className="text-sm font-normal text-white/40 ml-2">views</span>
              </p>
            </div>
          </div>
        </div>
      </div>

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
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-black font-bold px-12 py-6 rounded-lg text-lg flex items-center gap-3"
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
  );
}
