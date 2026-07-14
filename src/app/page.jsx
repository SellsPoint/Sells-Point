"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as Icons from "lucide-react";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  SearchX,
  UserPlus,
  Camera,
  Search,
  CheckCircle2,
  Flag,
  Star,
  Quote,
  ArrowRight,
} from "lucide-react";
import { useApp, CATEGORIES } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import AuthModal from "@/components/AuthModal";
import PostAdModal from "@/components/PostAdModal";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import Marquee from "@/components/Marquee";
import CountUp from "@/components/CountUp";

const STATS = [
  { label: "Verified sellers", value: 12, suffix: "K+" },
  { label: "Listings live", value: 48, suffix: "K+" },
  { label: "Cities covered", value: 120, suffix: "+" },
  { label: "Avg. seller rating", value: 4.7, suffix: "★", decimals: 1 },
];

const MARQUEE_ITEMS = CATEGORIES.map((c) => c.label);

const STEPS = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Join in seconds with just your mobile number, verified by OTP.",
  },
  {
    icon: Camera,
    title: "Post an Ad",
    description: "Add photos, a short video, price, and description in minutes.",
  },
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Search, filter, and explore listings near you.",
  },
  {
    icon: MessageCircle,
    title: "Chat & Connect",
    description: "Message the seller directly — no numbers shared.",
  },
  {
    icon: CheckCircle2,
    title: "Close the Deal",
    description: "Finalize safely, confidently, and mark it sold.",
  },
];

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    color: "bg-gradient-to-br from-brand-400 to-brand-600 text-white",
    title: "Phone-verified sellers",
    description: "Every account is OTP-verified — no fake profiles, no spam.",
  },
  {
    icon: MessageCircle,
    color: "bg-gradient-to-br from-sky-400 to-sky-600 text-white",
    title: "Built-in secure chat",
    description: "Talk and share photos without ever exposing your number.",
  },
  {
    icon: Flag,
    color: "bg-gradient-to-br from-red-400 to-red-600 text-white",
    title: "Report & block controls",
    description: "Full control over who you interact with, every conversation.",
  },
  {
    icon: Camera,
    color: "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
    title: "Photo + video listings",
    description: "See the real condition before you even reach out.",
  },
  {
    icon: Sparkles,
    color: "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
    title: "Featured & boosted ads",
    description: "Promote your listing for 5x the visibility.",
  },
  {
    icon: Star,
    color: "bg-gradient-to-br from-ink-700 to-ink-900 text-white",
    title: "Ratings & reviews",
    description: "Every seller's reputation is public and earned over time.",
  },
];

const TESTIMONIALS = [
  {
    name: "Meera Nair",
    location: "Bengaluru, IN",
    avatar: "https://i.pravatar.cc/150?img=47",
    quote:
      "Sold my old laptop in two days flat. The chat kept everything in one place and I never had to share my number.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    location: "Delhi, IN",
    avatar: "https://i.pravatar.cc/150?img=51",
    quote:
      "The video upload feature is genuinely useful — buyers trusted the listing more and I got fewer time-wasting queries.",
    rating: 5,
  },
  {
    name: "Ananya Iyer",
    location: "Pune, IN",
    avatar: "https://i.pravatar.cc/150?img=44",
    quote:
      "Felt safer than other marketplaces I've used. Phone verification and the report option actually matter.",
    rating: 4,
  },
];

function HomeContent() {
  const { listings, currentUser, hydrated } = useApp();
  const params = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();
  const loc = params.get("loc") || "All India";
  const [activeCategory, setActiveCategory] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  const handleStartSelling = () => {
    if (!currentUser) {
      setAuthOpen(true);
    } else {
      setPostOpen(true);
    }
  };

  const activeListings = useMemo(() => listings.filter((l) => l.status === "active"), [listings]);

  const featured = useMemo(
    () => activeListings.filter((l) => l.featured && l.featuredStatus === "approved"),
    [activeListings]
  );

  const filtered = useMemo(() => {
    return activeListings.filter((l) => {
      const matchesQuery = q ? l.title.toLowerCase().includes(q) : true;
      const matchesLoc = loc && loc !== "All India" ? l.location === loc : true;
      const matchesCategory = activeCategory ? l.category === activeCategory : true;
      return matchesQuery && matchesLoc && matchesCategory;
    });
  }, [activeListings, q, loc, activeCategory]);

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-24 text-white lg:px-8 lg:py-32">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-20 top-0 hidden h-96 w-96 rounded-full bg-brand-500/25 blur-3xl lg:block animate-float" />
        <div
          className="pointer-events-none absolute -left-24 bottom-0 hidden h-80 w-80 rounded-full bg-brand-700/25 blur-3xl lg:block animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl animate-slide-up">
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-inset ring-white/15">
              <Sparkles size={12} /> Trusted marketplace
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight lg:text-6xl">
              Buy &amp; sell with people you can{" "}
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
                actually trust.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-200">
              Verified sellers, secure in-app chat, and premium listings — Sells Point makes
              second-hand feel first-class.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={handleStartSelling} className="pulse-ring btn-primary px-6 py-3 text-base">
                Start Selling <ArrowRight size={17} />
              </button>
              <a
                href="#explore"
                className="btn-secondary bg-white/5 px-6 py-3 text-base text-white ring-1 ring-inset ring-white/20 hover:bg-white/10"
              >
                Browse Listings
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold lg:text-3xl">
                    <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
                  </p>
                  <p className="mt-0.5 text-xs text-ink-300">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block lg:pb-10 lg:pt-6">
            <div className="absolute right-6 top-10 w-72 -rotate-6 rounded-3xl bg-white/5 p-4 opacity-70 blur-[1px] ring-1 ring-white/10">
              <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-purple-400/30 to-ink-900/40" />
            </div>

            <TiltCard className="relative ml-auto w-80 cursor-pointer">
              <div className="glass-dark rounded-3xl p-4 shadow-glow">
                <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-brand-400/40 via-brand-600/30 to-ink-900/40" />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-bold text-white">iPhone 14 Pro</p>
                    <span className="badge-gold shrink-0">Featured</span>
                  </div>
                  <p className="font-display text-xl font-extrabold text-brand-300">₹78,999</p>
                  <div className="flex items-center gap-1 text-xs text-ink-300">
                    <Star size={12} className="fill-amber-400 text-amber-400" /> 4.8 · Mumbai, IN
                  </div>
                </div>
              </div>
            </TiltCard>

            <div className="glass-dark animate-float absolute -top-2 left-0 flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm text-white">
              <ShieldCheck size={18} className="text-brand-300" /> Phone-verified sellers
            </div>
            <div
              className="glass-dark animate-float absolute -bottom-2 right-4 flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-sm text-white"
              style={{ animationDelay: "1s" }}
            >
              <MessageCircle size={18} className="text-brand-300" /> Chat before you buy
            </div>
          </div>
        </div>

        <div className="relative mt-16 border-t border-white/10 pt-6">
          <Marquee items={MARQUEE_ITEMS} className="text-ink-300" />
        </div>
      </section>

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 className="section-heading mb-8 justify-center text-center sm:justify-start sm:text-left">
            How Sells Point Works
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  {idx < STEPS.length - 1 && (
                    <div className="pointer-events-none absolute -right-4 top-9 z-10 hidden text-ink-200 lg:block">
                      <ArrowRight size={18} />
                    </div>
                  )}
                  <div className="gradient-border card hover-card relative h-full p-5">
                    <span className="absolute right-4 top-4 font-display text-2xl font-extrabold text-ink-100">
                      {idx + 1}
                    </span>
                    <div className="icon-tile bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                      <Icon size={20} />
                    </div>
                    <p className="mt-3 font-display font-bold text-ink-900">{step.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>

      <section className="mx-auto max-w-7xl px-4 pb-4 lg:px-8" id="explore">
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
              activeCategory === null
                ? "bg-ink-900 text-white shadow-soft"
                : "bg-white text-ink-600 ring-1 ring-inset ring-ink-100 hover:ring-ink-200"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = Icons[cat.icon] || Icons.Tag;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm font-semibold transition-all ${
                  active
                    ? "bg-brand-600 text-white shadow-glow"
                    : "bg-white text-ink-600 ring-1 ring-inset ring-ink-100 hover:ring-ink-200"
                }`}
              >
                <span className={`icon-tile h-7 w-7 ${active ? "bg-white/20" : "bg-ink-100"}`}>
                  <Icon size={14} />
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {!hydrated ? (
        <section className="mx-auto max-w-7xl px-4 pb-8 lg:px-8">
          <ProductGridSkeleton count={4} />
        </section>
      ) : (
        featured.length > 0 && (
          <section className="border-y border-amber-100 bg-gradient-to-b from-amber-50/60 to-transparent">
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-heading">
                  <Sparkles size={18} className="text-amber-500" /> Featured Ads
                </h2>
                <span className="badge-gold">Handpicked &amp; boosted</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.map((listing) => (
                  <ProductCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        )
      )}

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="text-center">
            <h2 className="section-heading justify-center">Why Choose Sells Point</h2>
            <p className="mt-2 text-sm text-ink-500">
              Built for trust — from sign-up to sold, every step is designed to protect you.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            {TRUST_FEATURES.map((f, idx) => {
              const Icon = f.icon;
              const isFeature = idx === 0;
              return (
                <div
                  key={f.title}
                  className={`gradient-border card hover-card relative overflow-hidden p-6 ${
                    isFeature ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                >
                  {isFeature && (
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100 blur-2xl" />
                  )}
                  <div className={`icon-tile shadow-soft ${f.color} ${isFeature ? "h-14 w-14" : ""}`}>
                    <Icon size={isFeature ? 26 : 20} />
                  </div>
                  <p
                    className={`mt-4 font-display font-bold text-ink-900 ${
                      isFeature ? "text-2xl" : ""
                    }`}
                  >
                    {f.title}
                  </p>
                  <p className={`mt-1.5 text-ink-500 ${isFeature ? "max-w-sm text-base" : "text-sm"}`}>
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h2 className="section-heading mb-4">
          <TrendingUp size={18} className="text-brand-600" />
          {q ? `Results for "${q}"` : "Explore Listings"}
        </h2>
        {!hydrated ? (
          <ProductGridSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="icon-tile h-14 w-14 bg-ink-100 text-ink-400">
              <SearchX size={24} />
            </div>
            <p className="text-sm text-ink-500">
              No listings match your search. Try a different keyword or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <Reveal>
        <section className="bg-ink-50 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="section-heading justify-center text-center">What Sellers Are Saying</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="hover-card card relative border-l-4 border-l-brand-400 p-6"
                >
                  <Quote size={32} className="text-brand-100" />
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                      <p className="text-xs text-ink-500">{t.location}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <section className="relative overflow-hidden bg-hero-gradient px-4 py-24 text-center text-white lg:px-8">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

        <Sparkles size={20} className="pointer-events-none absolute left-[15%] top-10 hidden text-brand-300/60 animate-float lg:block" />
        <Sparkles
          size={14}
          className="pointer-events-none absolute right-[18%] top-20 hidden text-brand-300/40 animate-float lg:block"
          style={{ animationDelay: "1s" }}
        />
        <Sparkles
          size={16}
          className="pointer-events-none absolute bottom-16 left-[22%] hidden text-brand-300/40 animate-float lg:block"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="badge bg-white/10 text-brand-200 ring-1 ring-inset ring-white/15">
            <Sparkles size={12} /> Free to post
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight lg:text-5xl">
            Got something to{" "}
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
              sell?
            </span>
          </h2>
          <p className="mt-4 text-lg text-ink-200">
            Post your first ad free and reach thousands of verified buyers today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleStartSelling}
              className="pulse-ring btn-primary px-8 py-3.5 text-base"
            >
              Post Your Ad <ArrowRight size={17} />
            </button>
            <a
              href="#explore"
              className="btn-secondary bg-white/5 px-8 py-3.5 text-base text-white ring-1 ring-inset ring-white/20 hover:bg-white/10"
            >
              Browse Listings
            </a>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <PostAdModal isOpen={postOpen} onClose={() => setPostOpen(false)} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
