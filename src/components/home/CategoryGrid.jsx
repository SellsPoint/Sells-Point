"use client";

import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CategoryGrid() {
  const router = useRouter();
  const { categories } = useApp();
  return <section className="home-container py-14 sm:py-16"><h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Browse Categories</h2><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">{categories.slice(0, 10).map((category) => { const Icon = Icons[category.icon] || Icons.Tag; return <button key={category.id} type="button" onClick={() => router.push(`/search?category=${encodeURIComponent(category.id)}`)} className="group flex min-w-0 flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-sm hover:border-brand-200 hover:shadow-neutral"><span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 transition-transform group-hover:-translate-y-0.5">{category.imageUrl ? <img src={category.imageUrl} alt="" className="h-10 w-10 object-contain" /> : <Icon size={26} className="text-brand-600" />}</span><span className="w-full truncate text-xs font-semibold text-ink-700">{category.label}</span></button>; })}</div></section>;
}
