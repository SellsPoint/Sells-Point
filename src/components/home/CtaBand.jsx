"use client";

import { ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSiteChrome } from "@/context/SiteChromeContext";

export default function CtaBand() {
  const { currentUser } = useApp();
  const { openAuth, openPostAd } = useSiteChrome();
  return <section className="bg-ink-50 px-4 py-0 sm:px-6"><div className="cta-gradient home-container grid overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-5 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center lg:gap-7"><div className="order-2 mx-auto hidden w-28 self-end sm:block lg:order-1 lg:mx-0 lg:w-full"><img src="/assets/home/cta-armchair.webp" alt="Green armchair and lamp" className="max-h-28 w-full object-contain object-bottom" /></div><div className="order-1 text-white lg:order-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-100">Make room for what matters</p><h2 className="mt-1 font-display text-lg font-extrabold sm:text-xl">Ready to declutter or find something amazing?</h2><p className="mt-1 text-xs text-white/85 sm:text-sm">Join thousands of buyers and sellers on SellsPoint.</p></div><button type="button" onClick={() => currentUser ? openPostAd() : openAuth()} className="btn-pill order-3 mt-4 shrink-0 justify-self-start bg-white px-5 py-3 text-xs text-brand-700 shadow-lg hover:bg-brand-50 lg:mt-0 lg:justify-self-end">Post Your Ad Now <ArrowRight size={15} /></button></div></section>;
}
