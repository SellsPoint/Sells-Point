"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

export default function FeaturedDeals() {
  const router = useRouter();
  const { listings } = useApp();
  const deals = useMemo(() => { const active = listings.filter((listing) => listing.status === "active"); const featured = active.filter((listing) => listing.featured && listing.featuredStatus === "approved"); return (featured.length ? featured : active).slice(0, 8); }, [listings]);
  return <section className="home-container pb-14 sm:pb-20"><div className="border-t border-ink-100 pt-14 sm:pt-16"><div className="mb-8 flex items-center justify-between gap-4"><h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Featured Deals</h2><button type="button" onClick={() => router.push("/search")} className="text-base font-semibold text-brand-700 hover:text-brand-800">View All Deals <ArrowRight aria-hidden="true" size={18} className="inline" /></button></div><div className="flex snap-x gap-5 overflow-x-auto pb-6">{deals.map((listing) => <div key={listing.id} className="w-[84vw] max-w-[340px] shrink-0 snap-start sm:w-[320px] lg:w-[340px]"><ProductCard listing={listing} /></div>)}{deals.length === 0 && <p className="rounded-2xl border border-dashed border-ink-200 px-6 py-10 text-base text-ink-500">Featured deals will appear here as soon as listings are available.</p>}</div></div></section>;
}
