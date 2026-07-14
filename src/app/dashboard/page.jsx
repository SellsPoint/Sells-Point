"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Heart, CheckCircle2, Sparkles, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { currentUser, listings, favoriteListings, markAsSold, deleteListing, requestFeatured } =
    useApp();
  const router = useRouter();
  const [tab, setTab] = useState("active");

  useEffect(() => {
    if (!currentUser) router.push("/");
  }, [currentUser, router]);

  if (!currentUser) return null;

  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const active = myListings.filter((l) => l.status === "active");
  const sold = myListings.filter((l) => l.status === "sold");

  const TABS = [
    { id: "active", label: `Active (${active.length})`, icon: Package },
    { id: "sold", label: `Sold (${sold.length})`, icon: CheckCircle2 },
    { id: "wishlist", label: `Wishlist (${favoriteListings.length})`, icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink-900">My Dashboard</h1>
      <p className="mb-6 text-sm text-ink-500">Manage your listings, sales, and saved items.</p>

      <div className="mb-6 flex gap-2 border-b border-ink-100">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-700"
              }`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "wishlist" ? (
        favoriteListings.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-400">
            You haven't saved any listings yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {favoriteListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {(tab === "active" ? active : sold).length === 0 && (
            <p className="py-16 text-center text-sm text-ink-400">Nothing here yet.</p>
          )}
          {(tab === "active" ? active : sold).map((l) => (
            <div key={l.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img
                src={l.images?.[0]}
                alt=""
                className="h-20 w-full rounded-xl object-cover sm:w-28"
              />
              <div className="flex-1">
                <p className="font-semibold text-ink-900">{l.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                  <span className="font-display font-bold text-ink-900">{formatPrice(l.price)}</span>
                  <span className="badge-ink">{l.views} views</span>
                  {l.featured && (
                    <span className="badge-gold capitalize">{l.featuredStatus}</span>
                  )}
                </div>
              </div>
              {tab === "active" && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  {l.featuredStatus === "none" && (
                    <button
                      onClick={() => requestFeatured(l.id)}
                      className="btn-secondary px-3 py-1.5 text-sm"
                    >
                      <Sparkles size={14} /> Boost
                    </button>
                  )}
                  <button
                    onClick={() => markAsSold(l.id)}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    <CheckCircle2 size={14} /> Mark Sold
                  </button>
                  <button
                    onClick={() => deleteListing(l.id)}
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
