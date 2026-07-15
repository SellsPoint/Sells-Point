"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  MessageCircle,
  Bell,
  PlusCircle,
  ChevronDown,
  User,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import AuthModal from "@/components/AuthModal";
import PostAdModal from "@/components/PostAdModal";
import NotificationPanel from "@/components/NotificationPanel";

const LOCATIONS = ["All India", "Mumbai, IN", "Pune, IN", "Delhi, IN", "Bengaluru, IN"];

export default function Navbar() {
  const { currentUser, logout, userChats, notifications, unreadMessageCount } = useApp();
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const badgeLabel = unreadCount > 99 ? "99+" : unreadCount;
  const chatBadgeLabel = unreadMessageCount > 99 ? "99+" : unreadMessageCount;
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All India");
  const [locOpen, setLocOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  const handleSell = () => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setPostOpen(true);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? "border-ink-100 shadow-soft" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <Sparkles size={18} />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
              Sells<span className="text-brand-600">Point</span>
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center gap-2 md:flex"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for mobiles, laptops, cars..."
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLocOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
              >
                <MapPin size={15} /> {location} <ChevronDown size={14} />
              </button>
              {locOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-soft">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocation(loc);
                        setLocOpen(false);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleSell}
              className="btn-primary hidden sm:inline-flex"
            >
              <PlusCircle size={16} /> Sell Product
            </button>

            {currentUser && (
              <Link
                href="/chat"
                className="relative rounded-xl p-2.5 text-ink-500 hover:bg-ink-100"
                aria-label="Messages"
              >
                <MessageCircle size={20} />
                {unreadMessageCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-0.5 text-[10px] font-bold text-white">
                    {chatBadgeLabel}
                  </span>
                )}
              </Link>
            )}

            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative rounded-xl p-2.5 text-ink-500 hover:bg-ink-100"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-0.5 text-[10px] font-bold text-white">
                      {badgeLabel}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 z-10 mt-2">
                    <NotificationPanel />
                  </div>
                )}
              </div>
            )}

            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-ink-200 py-1 pl-1 pr-2 hover:bg-ink-50"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <ChevronDown size={14} className="text-ink-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white py-1.5 shadow-soft animate-fade-in">
                    <div className="px-4 py-2 border-b border-ink-100">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {currentUser.name}
                      </p>
                      <p className="truncate text-xs text-ink-500">{currentUser.phone}</p>
                    </div>
                    <Link
                      href={`/profile/${currentUser.id}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {currentUser.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                      >
                        <ShieldCheck size={15} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="btn-secondary">
                Login
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 px-4 pb-3 md:hidden">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </div>
          <button onClick={handleSell} type="button" className="btn-primary px-3">
            <PlusCircle size={18} />
          </button>
        </form>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <PostAdModal isOpen={postOpen} onClose={() => setPostOpen(false)} />
    </>
  );
}
