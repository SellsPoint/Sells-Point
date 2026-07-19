"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSiteChrome } from "@/context/SiteChromeContext";

export default function Hero() {
  const router = useRouter();
  const { currentUser } = useApp();
  const { openAuth, openPostAd } = useSiteChrome();
  const sell = () => currentUser ? openPostAd() : openAuth();

  return <section className="hero-wash overflow-hidden py-12 sm:py-16 lg:py-20"><div className="home-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14"><div className="max-w-xl"><span className="badge-brand"><Sparkles size={12} /> Trusted marketplace</span><h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-ink-950 sm:text-5xl lg:text-6xl">Great finds. <span className="block text-brand-600">Better deals.</span></h1><p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600 sm:text-lg">Buy and sell quality products with people you can trust, all in one simple marketplace.</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={sell} className="btn-pill bg-brand-600 text-white hover:bg-brand-700">Post Your Ad <ArrowRight size={16} /></button><button type="button" onClick={() => router.push("/search")} className="btn-pill border border-ink-200 bg-white text-ink-800 hover:bg-ink-50">Browse Listings</button></div></div><div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] shadow-neutral"><img src="/assets/home/hero-products.webp" alt="Phones, laptops, watches, earbuds, and speakers available on SellsPoint" className="aspect-[4/3] h-full w-full object-cover" /></div></div></section>;
}
