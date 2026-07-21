"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, PlayCircle, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSiteChrome } from "@/context/SiteChromeContext";

const formatPrice = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value);

const relativeTime = (timestamp) => {
  const elapsed = Math.max(0, Date.now() - Number(timestamp || Date.now()));
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export default function ProductCard({ listing }) {
  const { toggleFavorite, isFavorite, currentUser } = useApp();
  const { openAuth } = useSiteChrome();
  const fav = isFavorite(listing.id);
  const discount = listing.originalPrice > listing.price
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;
  const featured = listing.featured && listing.featuredStatus === "approved";
  const isNew = Date.now() - Number(listing.createdAt || 0) <= 7 * 24 * 60 * 60 * 1000;
  const status = featured
    ? { label: "Featured", className: "bg-amber-100 text-amber-800", icon: true }
    : discount > 0
      ? { label: "Best Price", className: "bg-brand-600 text-white" }
      : isNew
        ? { label: "New", className: "bg-blue-600 text-white" }
        : null;

  return (
    <article className={`group card-neutral relative overflow-hidden ${featured ? "ring-1 ring-amber-200" : ""}`}>
      <Link href={`/product/${listing.id}`} className="block" aria-label={`View ${listing.title}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 84vw, (max-width: 1024px) 50vw, 340px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-400">No image</div>
          )}
          {listing.video && <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1 text-xs text-white"><PlayCircle size={13} /> Video</span>}
          {listing.status === "sold" && <div className="absolute inset-0 flex items-center justify-center bg-ink-950/55"><span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold uppercase">Sold Out</span></div>}
          {status && (
            <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${status.className}`}>
              {status.icon && <Sparkles size={12} />} {status.label}
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="line-clamp-2 min-h-12 font-display text-base font-semibold leading-6 text-ink-900 sm:text-lg">{listing.title}</h3>
          <div className="mt-2 flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 font-display text-lg font-bold text-ink-900 sm:text-xl">{formatPrice(listing.price)}</span>
            {discount > 0 && <span className="min-w-0 truncate text-xs text-ink-400 line-through">{formatPrice(listing.originalPrice)}</span>}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-sm text-ink-500">
            <span className="truncate">{relativeTime(listing.createdAt)}</span>
            <span className="hidden min-w-0 items-center gap-1 min-[390px]:flex"><MapPin size={12} className="shrink-0" /><span className="truncate">{listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km` : listing.location}</span></span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => currentUser ? toggleFavorite(listing.id) : openAuth()}
        className={`absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-colors ${fav ? "bg-red-500 text-white" : "bg-white text-ink-600 hover:text-red-500"}`}
        aria-label={fav ? `Remove ${listing.title} from favourites` : `Save ${listing.title} to favourites`}
        aria-pressed={fav}
      >
        <Heart size={16} fill={fav ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
