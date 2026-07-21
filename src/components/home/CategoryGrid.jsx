"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import * as Icons from "lucide-react";
import { useApp } from "@/context/AppContext";

function CategoryTile({ category, onSelect }) {
  const Icon = Icons[category.icon] || Icons.Tag;
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="group flex min-h-48 min-w-0 flex-col items-center justify-center gap-5 rounded-2xl border border-ink-100 bg-white p-5 text-center shadow-sm hover:border-brand-200 hover:shadow-neutral md:min-h-56 md:p-6"
    >
      <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-50 transition-transform group-hover:-translate-y-0.5 md:h-28 md:w-28">
        {category.imageUrl ? (
          <img src={category.imageUrl} alt="" className="h-20 w-20 object-contain md:h-24 md:w-24" />
        ) : (
          <Icon size={42} className="text-brand-600 md:h-12 md:w-12" />
        )}
      </span>
      <span className="w-full truncate text-base font-bold text-ink-700 md:text-lg">{category.label}</span>
    </button>
  );
}

export default function CategoryGrid() {
  const router = useRouter();
  const { categories } = useApp();
  const [showAll, setShowAll] = useState(false);
  const selectCategory = (id) => router.push(`/search?category=${encodeURIComponent(id)}`);
  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  return (
    <section className="home-container py-12 sm:py-16 md:py-20">
      <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Browse Categories</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
        {visibleCategories.map((category) => (
          <CategoryTile key={category.id} category={category} onSelect={selectCategory} />
        ))}
        {!showAll && categories.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            aria-expanded={showAll}
            className="group flex min-h-48 min-w-0 flex-col items-center justify-center gap-5 rounded-2xl border border-ink-200 bg-white p-5 text-center shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:shadow-neutral md:min-h-56 md:p-6"
          >
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl border border-ink-100 bg-ink-50 text-ink-700 transition-transform group-hover:-translate-y-0.5 md:h-28 md:w-28">
              <LayoutGrid size={42} strokeWidth={1.8} className="md:h-12 md:w-12" />
            </span>
            <span className="text-base font-bold text-ink-700 md:text-lg">More</span>
          </button>
        )}
      </div>
    </section>
  );
}
