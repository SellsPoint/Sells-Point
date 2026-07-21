"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSiteChrome } from "@/context/SiteChromeContext";

const promotions = [
  {
    title: "Sell anything, free",
    sub: "Post your ad in under a minute — photos, video, and your price.",
    cta: "Post Your Ad",
    image: "/assets/home/slides/slide 1.jpeg",
    action: "post",
  },
  {
    title: "Deals near you",
    sub: "Find great second-hand finds from people in your own city.",
    cta: "Browse Listings",
    image: "/assets/home/slides/slide 2.jpeg",
    action: "browse",
  },
  {
    title: "Your number stays private",
    sub: "Chat with buyers and sellers inside the app. Nothing shared.",
    cta: "See How It Works",
    image: "/assets/home/slides/slide 3.jpeg",
    action: "how-it-works",
  },
  {
    title: "Get seen faster",
    sub: "Boost your listing to the top of search for a full month.",
    cta: "Promote an Ad",
    image: "/assets/home/slides/slide 4.jpeg",
    action: "post",
  },
];

export default function Hero() {
  const router = useRouter();
  const { currentUser } = useApp();
  const { openAuth, openPostAd } = useSiteChrome();
  const carouselRef = useRef(null);
  const touchStartX = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [missingImages, setMissingImages] = useState(() => new Set());

  const goToSlide = (index) => setActiveSlide((index + promotions.length) % promotions.length);
  const postAd = () => (currentUser ? openPostAd() : openAuth());

  const handleAction = (action) => {
    if (action === "post") {
      postAd();
      return;
    }
    if (action === "browse") {
      router.push("/search");
      return;
    }
    router.push("#how-it-works");
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);
    const updateVisibility = () => setIsTabHidden(document.hidden);

    updateReducedMotion();
    updateVisibility();
    mediaQuery.addEventListener("change", updateReducedMotion);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateReducedMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || isTabHidden || reducedMotion) return undefined;
    const interval = window.setInterval(() => goToSlide(activeSlide + 1), 6000);
    return () => window.clearInterval(interval);
  }, [activeSlide, isTabHidden, paused, reducedMotion]);

  const handleBlur = (event) => {
    if (!carouselRef.current?.contains(event.relatedTarget)) setPaused(false);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 40) goToSlide(activeSlide + (distance < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <section className="hero-wash py-8 sm:py-10 md:py-12">
      <div className="home-container">
        <div
          ref={carouselRef}
          aria-roledescription="carousel"
          aria-label="SellsPoint promotions"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={handleBlur}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goToSlide(activeSlide - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goToSlide(activeSlide + 1);
            }
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={handleTouchEnd}
          className="relative mt-6 overflow-hidden rounded-2xl bg-brand-600 shadow-neutral sm:mt-8"
        >
          <div className="relative aspect-[2.12/1]" aria-live="polite">
            {promotions.map((promotion, index) => {
              const isActive = index === activeSlide;
              const imageMissing = missingImages.has(index);
              const Heading = index === 0 ? "h1" : "p";

              return (
                <div
                  key={promotion.title}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-[400ms] ${
                    isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {imageMissing ? (
                    <div className="absolute inset-0 bg-brand-600" aria-hidden="true" />
                  ) : (
                    <Image
                      src={promotion.image}
                      alt=""
                      fill
                      sizes="(max-width: 1280px) 100vw, 1200px"
                      priority={index === 0}
                      onError={() => setMissingImages((previous) => new Set(previous).add(index))}
                      className="object-cover object-center"
                    />
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="home-container relative z-10 flex h-full items-center py-5 sm:py-0">
                    <div className="max-w-[58%] text-white sm:max-w-xl">
                      <Heading className="font-display text-xl font-extrabold leading-[1.05] sm:text-3xl md:text-5xl">
                        {promotion.title}
                      </Heading>
                      <p className="mt-1 max-w-md text-[10px] leading-snug text-white/85 sm:mt-2 sm:text-sm md:mt-4 md:text-lg">
                        {promotion.sub}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 sm:mt-4 md:mt-6 md:gap-3">
                        <button
                          type="button"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => handleAction(promotion.action)}
                          className="btn-pill bg-white px-3 py-1.5 text-[10px] text-brand-700 hover:bg-brand-50 sm:px-4 sm:py-2 sm:text-xs md:px-5 md:py-2.5 md:text-sm"
                        >
                          {promotion.cta} <ArrowRight size={16} />
                        </button>
                        {index === 0 && (
                          <button
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => router.push("/search")}
                            className="btn-pill hidden border border-white/70 bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/20 sm:inline-flex md:px-5 md:py-2.5 md:text-sm"
                          >
                            Browse Listings
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToSlide(activeSlide - 1)}
            className="absolute bottom-2 left-auto right-11 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-offset-2 sm:left-3 sm:right-auto sm:top-1/2 sm:h-10 sm:w-10 sm:-translate-y-1/2"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => goToSlide(activeSlide + 1)}
            className="absolute bottom-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-offset-2 sm:top-1/2 sm:h-10 sm:w-10 sm:-translate-y-1/2"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {promotions.map((promotion, index) => (
            <button
              key={promotion.title}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2.5 w-2.5 rounded-full bg-brand-600 transition-opacity focus-visible:outline-offset-2 ${
                activeSlide === index ? "opacity-100" : "opacity-30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
