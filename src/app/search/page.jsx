import { Suspense } from "react";
import SearchMarketplace from "@/components/search/SearchMarketplace";
import { ProductGridSkeleton } from "@/components/Skeleton";

export const metadata = { title: "Search Marketplace | SellsPoint" };

export default function SearchPage() {
  return <Suspense fallback={<div className="home-container py-12"><ProductGridSkeleton /></div>}><SearchMarketplace /></Suspense>;
}
