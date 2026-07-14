"use client";

import Link from "next/link";
import { ShieldCheck, Star, MapPin, CalendarDays, Package } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

export default function ProfilePage({ params }) {
  const { id } = params;
  const { hydrated, getUserById, listings } = useApp();
  const user = getUserById(id);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="card mb-8 flex items-center gap-4 p-8">
          <div className="skeleton h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-1/3 rounded-md" />
            <div className="skeleton h-4 w-2/3 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-ink-500">
        User not found.
      </div>
    );
  }

  const userListings = listings.filter((l) => l.sellerId === id && l.status === "active");
  const soldCount = listings.filter((l) => l.sellerId === id && l.status === "sold").length;
  const memberSince = new Date(user.joinedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="card mb-8 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full object-cover shadow-soft" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="font-display text-2xl font-bold text-ink-900">{user.name}</h1>
            {user.verified && (
              <span className="badge-brand">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
            {user.isAdmin && <span className="badge bg-ink-900 text-white">Admin</span>}
          </div>
          <p className="mt-2 max-w-lg text-sm text-ink-500">{user.bio || "No bio yet."}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-ink-500 sm:justify-start">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" /> {user.rating?.toFixed(1)} ({user.ratingCount} ratings)
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {user.location}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={14} /> Member since {memberSince}
            </span>
            <span className="flex items-center gap-1">
              <Package size={14} /> {soldCount} sold
            </span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 font-display text-xl font-bold text-ink-900">
        Active Listings ({userListings.length})
      </h2>
      {userListings.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-400">No active listings right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {userListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
