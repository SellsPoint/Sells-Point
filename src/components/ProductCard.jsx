"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Sparkles, PlayCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({ listing }) {
  const { toggleFavorite, isFavorite, currentUser } = useApp();
  const fav = isFavorite(listing.id);
  const discount =
    listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : 0;

  return (
    <div
      className={`group card hover-card relative overflow-hidden ${
        listing.featured && listing.featuredStatus === "approved" ? "ring-1 ring-amber-200" : ""
      }`}
    >
      <Link href={`/product/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              No image
            </div>
          )}

          {listing.video && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1 text-xs font-medium text-white">
              <PlayCircle size={13} /> Video
            </div>
          )}

          {listing.status === "sold" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/50">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-ink-900">
                Sold Out
              </span>
            </div>
          )}

          {listing.featured && listing.featuredStatus === "approved" && (
            <div className="badge-gold absolute left-2 top-2 shadow-soft">
              <Sparkles size={12} /> Featured
            </div>
          )}

          {discount > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-1 text-xs font-bold text-white shadow-soft">
              {discount}% OFF
            </div>
          )}
        </div>
      </Link>

      {currentUser && (
        <button
          onClick={() => toggleFavorite(listing.id)}
          className={`absolute right-2 z-10 rounded-full p-2 shadow-soft transition-colors ${
            listing.featured || discount > 0 ? "top-11" : "top-2"
          } ${fav ? "bg-red-500 text-white" : "bg-white/90 text-ink-500 hover:text-red-500"}`}
          aria-label="Toggle favorite"
        >
          <Heart size={15} fill={fav ? "currentColor" : "none"} />
        </button>
      )}

      <Link href={`/product/${listing.id}`} className="block p-4">
        <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-900">
          {listing.title}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-ink-900">
            {formatPrice(listing.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-ink-400 line-through">
              {formatPrice(listing.originalPrice)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
          <span className="badge-ink">{listing.condition}</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {listing.location}
          </span>
        </div>
      </Link>
    </div>
  );
}
