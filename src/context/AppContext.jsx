"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const AppContext = createContext(null);
const CURRENT_USER_KEY = "sellspoint_current_user_id";

export const CATEGORIES = [
  { id: "mobiles", label: "Mobiles", icon: "Smartphone" },
  { id: "laptops", label: "Laptops", icon: "Laptop" },
  { id: "vehicles", label: "Vehicles", icon: "Car" },
  { id: "furniture", label: "Furniture", icon: "Sofa" },
  { id: "fashion", label: "Fashion", icon: "Shirt" },
  { id: "gaming", label: "Gaming", icon: "Gamepad2" },
  { id: "appliances", label: "Appliances", icon: "WashingMachine" },
  { id: "cameras", label: "Cameras", icon: "Camera" },
  { id: "books", label: "Books", icon: "BookOpen" },
  { id: "realestate", label: "Real Estate", icon: "Building2" },
];

// ----- DB row <-> app object mapping -----

function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    avatar: row.avatar_url,
    verified: row.verified,
    isAdmin: row.is_admin,
    isBanned: row.is_banned,
    location: row.location || "",
    bio: row.bio || "",
    joinedAt: row.joined_at ? new Date(row.joined_at).getTime() : Date.now(),
    rating: Number(row.rating) || 0,
    ratingCount: row.rating_count || 0,
  };
}

function mapListing(row) {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description || "",
    price: Number(row.price) || 0,
    originalPrice: Number(row.original_price) || 0,
    category: row.category,
    condition: row.condition,
    images: row.images || [],
    video: row.video_url,
    location: row.location || "",
    featured: row.featured,
    featuredStatus: row.featured_status,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    views: row.views || 0,
  };
}

function mapMessage(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    text: row.text || "",
    image: row.image_url,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function mapChat(row, messages = []) {
  return {
    id: row.id,
    listingId: row.listing_id,
    participantIds: row.participant_ids || [],
    messages,
  };
}

function mapReport(row) {
  return {
    id: row.id,
    type: row.type,
    targetId: row.target_id,
    reporterId: row.reporter_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

const LISTING_FIELD_MAP = {
  title: "title",
  description: "description",
  price: "price",
  originalPrice: "original_price",
  category: "category",
  condition: "condition",
  images: "images",
  video: "video_url",
  location: "location",
  featured: "featured",
  featuredStatus: "featured_status",
  status: "status",
  views: "views",
};

function toListingRow(updates) {
  const row = {};
  for (const [key, value] of Object.entries(updates)) {
    const column = LISTING_FIELD_MAP[key];
    if (column) row[column] = value;
  }
  return row;
}

const PROFILE_FIELD_MAP = {
  name: "name",
  email: "email",
  avatar: "avatar_url",
  location: "location",
  bio: "bio",
  verified: "verified",
};

function toProfileRow(updates) {
  const row = {};
  for (const [key, value] of Object.entries(updates)) {
    const column = PROFILE_FIELD_MAP[key];
    if (column) row[column] = value;
  }
  return row;
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [chats, setChats] = useState([]);
  const [reports, setReports] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingOtp, setPendingOtp] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [blockedUsers, setBlockedUsersState] = useState([]);

  // ----- initial public data -----
  useEffect(() => {
    (async () => {
      const [{ data: profileRows }, { data: listingRows }] = await Promise.all([
        supabase.from("profiles").select("*").order("joined_at", { ascending: true }),
        supabase.from("listings").select("*").order("created_at", { ascending: false }),
      ]);
      setUsers((profileRows || []).map(mapProfile));
      setListings((listingRows || []).map(mapListing));
      setHydrated(true);
    })();
  }, []);

  // ----- resolve logged-in user from localStorage -----
  useEffect(() => {
    const storedId = typeof window !== "undefined" ? window.localStorage.getItem(CURRENT_USER_KEY) : null;
    if (!storedId) return;
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", storedId).single();
      if (error || !data || data.is_banned) {
        window.localStorage.removeItem(CURRENT_USER_KEY);
        return;
      }
      setCurrentUser(mapProfile(data));
    })();
  }, []);

  const fetchUserChats = useCallback(async (userId) => {
    const { data: chatRows } = await supabase
      .from("chats")
      .select("*")
      .contains("participant_ids", [userId]);
    if (!chatRows || chatRows.length === 0) {
      setChats([]);
      return;
    }
    const chatIds = chatRows.map((c) => c.id);
    const { data: msgRows } = await supabase
      .from("messages")
      .select("*")
      .in("chat_id", chatIds)
      .order("created_at", { ascending: true });
    setChats(
      chatRows.map((c) =>
        mapChat(c, (msgRows || []).filter((m) => m.chat_id === c.id).map(mapMessage))
      )
    );
  }, []);

  const fetchFavorites = useCallback(async (userId) => {
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
    setFavoriteIds(new Set((data || []).map((r) => r.listing_id)));
  }, []);

  const fetchReports = useCallback(async (actorId) => {
    const res = await fetch(`/api/admin/reports?actorId=${actorId}`);
    if (!res.ok) {
      setReports([]);
      return;
    }
    const json = await res.json();
    setReports((json.reports || []).map(mapReport));
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserChats(currentUser.id);
      fetchFavorites(currentUser.id);
    } else {
      setChats([]);
      setFavoriteIds(new Set());
    }
  }, [currentUser, fetchUserChats, fetchFavorites]);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchReports(currentUser.id);
    } else {
      setReports([]);
    }
  }, [currentUser, fetchReports]);

  useEffect(() => {
    if (currentUser) {
      const raw = window.localStorage.getItem(`sellspoint_blocked_${currentUser.id}`);
      setBlockedUsersState(raw ? JSON.parse(raw) : []);
    } else {
      setBlockedUsersState([]);
    }
  }, [currentUser]);

  const getUserById = useCallback((id) => users.find((u) => u.id === id) || null, [users]);
  const getListingById = useCallback((id) => listings.find((l) => l.id === id) || null, [listings]);

  // ----- Auth (mock OTP, real profile persistence) -----
  const sendOtp = useCallback((phone) => {
    const code = "123456";
    setPendingOtp({ phone, code });
    return code;
  }, []);

  const verifyOtp = useCallback(
    async (phone, code, name) => {
      if (!pendingOtp || pendingOtp.phone !== phone || pendingOtp.code !== code) {
        return { success: false, message: "Invalid OTP. Try 123456." };
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      let profileRow = existing;
      if (!profileRow) {
        const { data: inserted, error } = await supabase
          .from("profiles")
          .insert({
            phone,
            name: name || "New User",
            avatar_url: `https://i.pravatar.cc/150?u=${encodeURIComponent(phone)}`,
            location: "India",
          })
          .select()
          .single();
        if (error) return { success: false, message: error.message };
        profileRow = inserted;
      }

      if (profileRow.is_banned) {
        return { success: false, message: "This account has been banned by admin." };
      }

      const mapped = mapProfile(profileRow);
      setUsers((prev) => (prev.some((u) => u.id === mapped.id) ? prev : [...prev, mapped]));
      setCurrentUser(mapped);
      window.localStorage.setItem(CURRENT_USER_KEY, mapped.id);
      setPendingOtp(null);
      return { success: true, user: mapped };
    },
    [pendingOtp]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!currentUser) return;
      const row = toProfileRow(updates);
      const { data, error } = await supabase
        .from("profiles")
        .update(row)
        .eq("id", currentUser.id)
        .select()
        .single();
      if (error) return;
      const mapped = mapProfile(data);
      setCurrentUser(mapped);
      setUsers((prev) => prev.map((u) => (u.id === mapped.id ? mapped : u)));
    },
    [currentUser]
  );

  // ----- Listings -----
  const addListing = useCallback(
    async (data) => {
      if (!currentUser) return null;
      const { data: inserted, error } = await supabase
        .from("listings")
        .insert({
          seller_id: currentUser.id,
          title: data.title,
          description: data.description,
          price: Number(data.price) || 0,
          original_price: Number(data.originalPrice) || Number(data.price) || 0,
          category: data.category,
          condition: data.condition || "Good",
          images: data.images && data.images.length ? data.images : [],
          video_url: data.video || null,
          location: data.location || currentUser.location || "India",
          featured: !!data.featured,
          featured_status: data.featured ? "pending" : "none",
          status: "active",
          views: 0,
        })
        .select()
        .single();
      if (error) return null;
      const mapped = mapListing(inserted);
      setListings((prev) => [mapped, ...prev]);
      return mapped;
    },
    [currentUser]
  );

  const updateListing = useCallback(async (id, updates) => {
    const row = toListingRow(updates);
    const { data, error } = await supabase.from("listings").update(row).eq("id", id).select().single();
    if (error) return;
    const mapped = mapListing(data);
    setListings((prev) => prev.map((l) => (l.id === id ? mapped : l)));
  }, []);

  const deleteListing = useCallback(async (id) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return;
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const markAsSold = useCallback((id) => updateListing(id, { status: "sold" }), [updateListing]);

  const requestFeatured = useCallback(
    (id) => updateListing(id, { featured: true, featuredStatus: "pending" }),
    [updateListing]
  );

  const incrementViews = useCallback(
    (id) => {
      const listing = listings.find((l) => l.id === id);
      if (!listing) return;
      updateListing(id, { views: (listing.views || 0) + 1 });
    },
    [listings, updateListing]
  );

  // ----- Favorites -----
  const toggleFavorite = useCallback(
    async (listingId) => {
      if (!currentUser) return;
      const exists = favoriteIds.has(listingId);
      if (exists) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("listing_id", listingId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await supabase.from("favorites").insert({ user_id: currentUser.id, listing_id: listingId });
        setFavoriteIds((prev) => new Set(prev).add(listingId));
      }
    },
    [currentUser, favoriteIds]
  );

  const isFavorite = useCallback((listingId) => favoriteIds.has(listingId), [favoriteIds]);

  const favoriteListings = useMemo(
    () => listings.filter((l) => favoriteIds.has(l.id)),
    [listings, favoriteIds]
  );

  // ----- Chat -----
  const getOrCreateChat = useCallback(
    async (listingId, otherUserId) => {
      if (!currentUser) return null;
      const existingLocal = chats.find(
        (c) =>
          c.listingId === listingId &&
          c.participantIds.includes(currentUser.id) &&
          c.participantIds.includes(otherUserId)
      );
      if (existingLocal) return existingLocal;

      const { data: existingRow } = await supabase
        .from("chats")
        .select("*")
        .eq("listing_id", listingId)
        .contains("participant_ids", [currentUser.id, otherUserId])
        .maybeSingle();

      if (existingRow) {
        const mapped = mapChat(existingRow, []);
        setChats((prev) => (prev.some((c) => c.id === mapped.id) ? prev : [...prev, mapped]));
        return mapped;
      }

      const { data: inserted, error } = await supabase
        .from("chats")
        .insert({ listing_id: listingId, participant_ids: [currentUser.id, otherUserId] })
        .select()
        .single();
      if (error) return null;
      const mapped = mapChat(inserted, []);
      setChats((prev) => [...prev, mapped]);
      return mapped;
    },
    [currentUser, chats]
  );

  const sendMessage = useCallback(
    async (chatId, text, image) => {
      if (!currentUser) return;
      const { data, error } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, sender_id: currentUser.id, text: text || "", image_url: image || null })
        .select()
        .single();
      if (error) return;
      const mapped = mapMessage(data);
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: c.messages.some((m) => m.id === mapped.id) ? c.messages : [...c.messages, mapped] }
            : c
        )
      );
      return mapped;
    },
    [currentUser]
  );

  const appendIncomingMessage = useCallback((chatId, row) => {
    const mapped = mapMessage(row);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: c.messages.some((m) => m.id === mapped.id) ? c.messages : [...c.messages, mapped] }
          : c
      )
    );
  }, []);

  const userChats = useMemo(() => {
    if (!currentUser) return [];
    return chats
      .filter((c) => c.participantIds.includes(currentUser.id))
      .sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.createdAt || 0;
        const bLast = b.messages[b.messages.length - 1]?.createdAt || 0;
        return bLast - aLast;
      });
  }, [currentUser, chats]);

  // ----- Reports & moderation -----
  const reportContent = useCallback(
    async (type, targetId, reason) => {
      if (!currentUser) return;
      await supabase
        .from("reports")
        .insert({ type, target_id: targetId, reporter_id: currentUser.id, reason, status: "open" });
    },
    [currentUser]
  );

  const resolveReport = useCallback(
    async (id) => {
      if (!currentUser) return;
      await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser.id, reportId: id, action: "resolve" }),
      });
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
    },
    [currentUser]
  );

  const banUser = useCallback(
    async (id) => {
      if (!currentUser) return;
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser.id, targetUserId: id, action: "ban" }),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isBanned: true } : u)));
    },
    [currentUser]
  );

  const unbanUser = useCallback(
    async (id) => {
      if (!currentUser) return;
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser.id, targetUserId: id, action: "unban" }),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isBanned: false } : u)));
    },
    [currentUser]
  );

  const setFeaturedStatus = useCallback(
    async (id, status) => {
      if (!currentUser) return;
      const action = status === "approved" ? "approve-featured" : "reject-featured";
      await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser.id, listingId: id, action }),
      });
      setListings((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, featuredStatus: status, featured: status === "approved" } : l
        )
      );
    },
    [currentUser]
  );

  const blockUser = useCallback(
    (id) => {
      if (!currentUser) return;
      setBlockedUsersState((prev) => {
        const next = prev.includes(id) ? prev : [...prev, id];
        window.localStorage.setItem(`sellspoint_blocked_${currentUser.id}`, JSON.stringify(next));
        return next;
      });
    },
    [currentUser]
  );

  const isBlocked = useCallback((id) => blockedUsers.includes(id), [blockedUsers]);

  const value = {
    hydrated,
    users,
    listings,
    chats,
    reports,
    currentUser,
    getUserById,
    getListingById,
    sendOtp,
    verifyOtp,
    logout,
    updateProfile,
    addListing,
    updateListing,
    deleteListing,
    markAsSold,
    requestFeatured,
    incrementViews,
    toggleFavorite,
    isFavorite,
    favoriteListings,
    getOrCreateChat,
    sendMessage,
    appendIncomingMessage,
    userChats,
    reportContent,
    resolveReport,
    banUser,
    unbanUser,
    setFeaturedStatus,
    blockUser,
    isBlocked,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
