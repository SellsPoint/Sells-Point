"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutList,
  Users,
  Flag,
  Sparkles,
  Check,
  X,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Package,
  Tags,
  Plus,
  Pencil,
  MessageCircle,
  BarChart3,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Eye,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const TABS = [
  { id: "listings", label: "Listings", icon: LayoutList },
  { id: "users", label: "Users", icon: Users },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "chats", label: "Chat Monitor", icon: MessageCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminPanel() {
  const {
    listings,
    users,
    reports,
    categories,
    currentUser,
    getUserById,
    getListingById,
    setFeaturedStatus,
    deleteListing,
    banUser,
    unbanUser,
    resolveReport,
    addCategory,
    updateCategory,
    deleteCategory,
    analytics,
    announcements,
    fetchAnalytics,
    createAnnouncement,
    deactivateAnnouncement,
    deleteAnnouncement,
  } = useApp();
  const [tab, setTab] = useState("listings");
  const [editingCat, setEditingCat] = useState(null);
  const [newCat, setNewCat] = useState({ id: "", label: "", icon: "Tag" });
  const [catError, setCatError] = useState("");

  const [monitoredChats, setMonitoredChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [expandedChat, setExpandedChat] = useState(null);

  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "" });
  const [annError, setAnnError] = useState("");
  const [annSuccess, setAnnSuccess] = useState("");

  const pendingFeatured = listings.filter((l) => l.featuredStatus === "pending");
  const otherListings = listings.filter((l) => l.featuredStatus !== "pending");
  const openReports = reports.filter((r) => r.status === "open");
  const closedReports = reports.filter((r) => r.status !== "open");

  useEffect(() => {
    if (tab === "chats" && currentUser) {
      setChatsLoading(true);
      fetch(`/api/admin/chats?actorId=${currentUser.id}`)
        .then((r) => r.json())
        .then((json) => setMonitoredChats(json.chats || []))
        .catch(() => setMonitoredChats([]))
        .finally(() => setChatsLoading(false));
    }
  }, [tab, currentUser]);

  useEffect(() => {
    if (tab === "analytics" && currentUser) {
      fetchAnalytics(currentUser.id);
    }
  }, [tab, currentUser, fetchAnalytics]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
        <p className="text-sm text-ink-500">Manage listings, users, and community reports.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-4">
          <div className="icon-tile bg-brand-100 text-brand-600">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Active listings</p>
            <p className="font-display text-2xl font-bold text-ink-900">
              {listings.filter((l) => l.status === "active").length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-4">
          <div className="icon-tile bg-ink-100 text-ink-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Registered users</p>
            <p className="font-display text-2xl font-bold text-ink-900">{users.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-4">
          <div className="icon-tile bg-red-100 text-red-600">
            <Flag size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Open reports</p>
            <p className="font-display text-2xl font-bold text-ink-900">{openReports.length}</p>
          </div>
        </div>
      </div>

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

      {tab === "listings" && (
        <div className="space-y-8">
          {pendingFeatured.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display font-bold text-ink-900">
                <Sparkles size={16} className="text-amber-500" /> Pending Featured Approvals
              </h3>
              <div className="space-y-3">
                {pendingFeatured.map((l) => {
                  const seller = getUserById(l.sellerId);
                  return (
                    <div key={l.id} className="card flex items-center gap-4 p-4">
                      <img
                        src={l.images?.[0]}
                        alt=""
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <Link href={`/product/${l.id}`} className="font-semibold text-ink-900 hover:underline">
                          {l.title}
                        </Link>
                        <p className="text-xs text-ink-500">
                          {formatPrice(l.price)} · by {seller?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setFeaturedStatus(l.id, "approved")}
                        className="btn-primary px-3 py-1.5 text-sm"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => setFeaturedStatus(l.id, "rejected")}
                        className="btn-secondary px-3 py-1.5 text-sm"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 font-display font-bold text-ink-900">All Listings</h3>
            <div className="overflow-hidden rounded-2xl border border-ink-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {otherListings.map((l) => {
                    const seller = getUserById(l.sellerId);
                    return (
                      <tr key={l.id}>
                        <td className="max-w-xs truncate px-4 py-3">
                          <Link href={`/product/${l.id}`} className="hover:underline">
                            {l.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-ink-500">{seller?.name}</td>
                        <td className="px-4 py-3">{formatPrice(l.price)}</td>
                        <td className="px-4 py-3 capitalize">{l.status}</td>
                        <td className="px-4 py-3 capitalize">{l.featuredStatus}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteListing(l.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="overflow-hidden rounded-2xl border border-ink-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <Link href={`/profile/${u.id}`} className="flex items-center gap-2 hover:underline">
                      <img src={u.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      {u.name}
                      {u.isAdmin && <span className="badge-brand">Admin</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{u.phone}</td>
                  <td className="px-4 py-3">{u.rating?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="badge bg-red-100 text-red-600">Banned</span>
                    ) : (
                      <span className="badge-brand">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.isAdmin ? (
                      <span className="text-xs text-ink-400">Protected</span>
                    ) : u.isBanned ? (
                      <button
                        onClick={() => unbanUser(u.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        <ShieldCheck size={14} /> Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => banUser(u.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                      >
                        <ShieldOff size={14} /> Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-display font-bold text-ink-900">Open Reports</h3>
            {openReports.length === 0 && (
              <p className="text-sm text-ink-400">No open reports. Nice and quiet.</p>
            )}
            <div className="space-y-3">
              {openReports.map((r) => {
                const reporter = getUserById(r.reporterId);
                const target = r.type === "listing" ? getListingById(r.targetId) : getUserById(r.targetId);
                return (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm">
                          <span className="badge-ink mr-2 capitalize">{r.type}</span>
                          <span className="font-semibold text-ink-900">
                            {r.type === "listing" ? target?.title : target?.name}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-ink-600">{r.reason}</p>
                        <p className="mt-1 text-xs text-ink-400">Reported by {reporter?.name}</p>
                      </div>
                      <button
                        onClick={() => resolveReport(r.id)}
                        className="btn-secondary shrink-0 px-3 py-1.5 text-sm"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {closedReports.length > 0 && (
            <div>
              <h3 className="mb-3 font-display font-bold text-ink-900">Resolved</h3>
              <div className="space-y-2">
                {closedReports.map((r) => (
                  <div key={r.id} className="rounded-xl bg-ink-50 px-4 py-2.5 text-sm text-ink-500">
                    <span className="badge-ink mr-2 capitalize">{r.type}</span>
                    {r.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-display font-bold text-ink-900">Add New Category</h3>
            {catError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {catError}
              </div>
            )}
            <div className="card p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <input
                  value={newCat.id}
                  onChange={(e) => setNewCat((p) => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") }))}
                  placeholder="ID (e.g. electronics)"
                  className="input-field"
                />
                <input
                  value={newCat.label}
                  onChange={(e) => setNewCat((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Label (e.g. Electronics)"
                  className="input-field"
                />
                <input
                  value={newCat.icon}
                  onChange={(e) => setNewCat((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="Icon (e.g. Smartphone)"
                  className="input-field"
                />
                <button
                  onClick={async () => {
                    setCatError("");
                    if (!newCat.id || !newCat.label) {
                      setCatError("ID and label are required.");
                      return;
                    }
                    const result = await addCategory(newCat);
                    if (result.success) {
                      setNewCat({ id: "", label: "", icon: "Tag" });
                    } else {
                      setCatError(result.error || "Failed to add category.");
                    }
                  }}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display font-bold text-ink-900">All Categories</h3>
            <div className="overflow-hidden rounded-2xl border border-ink-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Icon</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      {editingCat === cat.id ? (
                        <>
                          <td className="px-4 py-3 text-ink-400">{cat.id}</td>
                          <td className="px-4 py-3">
                            <input
                              defaultValue={cat.label}
                              id={`edit-label-${cat.id}`}
                              className="input-field py-1 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              defaultValue={cat.icon}
                              id={`edit-icon-${cat.id}`}
                              className="input-field py-1 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              defaultValue={cat.sortOrder ?? 0}
                              id={`edit-order-${cat.id}`}
                              type="number"
                              className="input-field w-20 py-1 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={async () => {
                                  setCatError("");
                                  const label = document.getElementById(`edit-label-${cat.id}`).value;
                                  const icon = document.getElementById(`edit-icon-${cat.id}`).value;
                                  const sort_order = Number(document.getElementById(`edit-order-${cat.id}`).value);
                                  const result = await updateCategory({ id: cat.id, label, icon, sort_order });
                                  if (result.success) {
                                    setEditingCat(null);
                                  } else {
                                    setCatError(result.error || "Failed to update.");
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                              >
                                <Check size={14} /> Save
                              </button>
                              <button
                                onClick={() => setEditingCat(null)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-ink-100"
                              >
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-mono text-xs text-ink-500">{cat.id}</td>
                          <td className="px-4 py-3 font-semibold text-ink-900">{cat.label}</td>
                          <td className="px-4 py-3 text-ink-500">{cat.icon}</td>
                          <td className="px-4 py-3 text-ink-500">{cat.sortOrder ?? 0}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingCat(cat.id)}
                                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Delete category "${cat.label}"? This cannot be undone.`)) return;
                                  setCatError("");
                                  const result = await deleteCategory(cat.id);
                                  if (!result.success) {
                                    setCatError(result.error || "Failed to delete.");
                                  }
                                }}
                                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "chats" && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-ink-900">All Conversations</h3>
          {chatsLoading ? (
            <p className="text-sm text-ink-400">Loading conversations...</p>
          ) : monitoredChats.length === 0 ? (
            <p className="text-sm text-ink-400">No conversations yet.</p>
          ) : (
            <div className="space-y-3">
              {monitoredChats.map((chat) => (
                <div key={chat.id} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)}
                    className="flex w-full items-center gap-4 p-4 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <MessageCircle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">
                        {chat.listingTitle}
                      </p>
                      <p className="text-xs text-ink-500">
                        {chat.participants.map((p) => p.name).join(" & ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-400">
                      <span>{chat.messageCount} msgs</span>
                      {chat.participants.some((p) => p.isBanned) && (
                        <span className="badge bg-red-100 text-red-600">Banned user</span>
                      )}
                      {expandedChat === chat.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  {expandedChat === chat.id && (
                    <div className="border-t border-ink-100 bg-ink-50/50 p-4">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {chat.participants.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs">
                            <img src={p.avatar} alt="" className="h-5 w-5 rounded-full" />
                            <span className="font-medium text-ink-700">{p.name}</span>
                            <span className="text-ink-400">{p.phone}</span>
                            {p.isBanned && <span className="badge bg-red-100 text-red-600">Banned</span>}
                          </div>
                        ))}
                      </div>
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {chat.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${msg.senderId === chat.participants[0]?.id ? "" : "justify-end"}`}
                          >
                            <div className={`max-w-xs rounded-xl px-3 py-2 text-sm ${
                              msg.senderId === chat.participants[0]?.id
                                ? "bg-white text-ink-800"
                                : "bg-brand-100 text-brand-900"
                            }`}>
                              <p className="text-[10px] font-semibold text-ink-400">{msg.senderName}</p>
                              {msg.text && <p>{msg.text}</p>}
                              {msg.image && <img src={msg.image} alt="" className="mt-1 max-w-40 rounded-lg" />}
                              <p className="mt-0.5 text-[10px] text-ink-400">
                                {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-6">
          {analytics ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Total Users", value: analytics.overview.totalUsers, icon: Users, color: "bg-blue-100 text-blue-600" },
                  { label: "Active Listings", value: analytics.overview.activeListings, icon: Package, color: "bg-green-100 text-green-600" },
                  { label: "Sold Items", value: analytics.overview.soldListings, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
                  { label: "Open Reports", value: analytics.overview.openReports, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="card flex items-center gap-3 p-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-ink-500">{stat.label}</p>
                        <p className="font-display text-xl font-bold text-ink-900">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="card p-4">
                  <p className="text-xs font-medium text-ink-500">Total Chats</p>
                  <p className="font-display text-2xl font-bold text-ink-900">{analytics.overview.totalChats}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-medium text-ink-500">Total Messages</p>
                  <p className="font-display text-2xl font-bold text-ink-900">{analytics.overview.totalMessages}</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs font-medium text-ink-500">Resolved Reports</p>
                  <p className="font-display text-2xl font-bold text-ink-900">{analytics.overview.resolvedReports}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-display font-bold text-ink-900">Listings by Category</h3>
                  <div className="card divide-y divide-ink-100">
                    {analytics.categoryStats.length === 0 ? (
                      <p className="p-4 text-sm text-ink-400">No data</p>
                    ) : (
                      analytics.categoryStats.map((cs) => (
                        <div key={cs.category} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm font-medium capitalize text-ink-700">{cs.category}</span>
                          <span className="text-sm font-bold text-ink-900">{cs.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-display font-bold text-ink-900">Listings by Condition</h3>
                  <div className="card divide-y divide-ink-100">
                    {Object.keys(analytics.conditionCounts).length === 0 ? (
                      <p className="p-4 text-sm text-ink-400">No data</p>
                    ) : (
                      Object.entries(analytics.conditionCounts).map(([cond, count]) => (
                        <div key={cond} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm font-medium text-ink-700">{cond}</span>
                          <span className="text-sm font-bold text-ink-900">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {analytics.listingsByDay.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display font-bold text-ink-900">New Listings (Last 30 Days)</h3>
                  <div className="card p-4">
                    <div className="flex items-end gap-1" style={{ height: 120 }}>
                      {analytics.listingsByDay.map((d) => {
                        const max = Math.max(...analytics.listingsByDay.map((x) => x.count), 1);
                        const h = Math.max((d.count / max) * 100, 4);
                        return (
                          <div
                            key={d.date}
                            className="flex-1 rounded-t bg-brand-500 transition-all hover:bg-brand-600"
                            style={{ height: `${h}%` }}
                            title={`${d.date}: ${d.count}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {analytics.recentUsers.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display font-bold text-ink-900">Recent Signups (Last 7 Days)</h3>
                  <div className="overflow-hidden rounded-2xl border border-ink-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-ink-50 text-xs uppercase text-ink-500">
                        <tr>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {analytics.recentUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3">
                              <Link href={`/profile/${u.id}`} className="font-medium text-ink-900 hover:underline">
                                {u.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-ink-500">
                              {new Date(u.joined_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-400">Loading analytics...</p>
          )}
        </div>
      )}

      {tab === "announcements" && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-display font-bold text-ink-900">Create Announcement</h3>
            {annError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {annError}
              </div>
            )}
            {annSuccess && (
              <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
                {annSuccess}
              </div>
            )}
            <div className="card space-y-3 p-4">
              <input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement((p) => ({ ...p, title: e.target.value }))}
                placeholder="Announcement title"
                className="input-field"
              />
              <textarea
                value={newAnnouncement.body}
                onChange={(e) => setNewAnnouncement((p) => ({ ...p, body: e.target.value }))}
                placeholder="Write your announcement message..."
                rows={3}
                className="input-field resize-none"
              />
              <button
                onClick={async () => {
                  setAnnError("");
                  setAnnSuccess("");
                  if (!newAnnouncement.title || !newAnnouncement.body) {
                    setAnnError("Title and body are required.");
                    return;
                  }
                  const result = await createAnnouncement(newAnnouncement);
                  if (result.success) {
                    setNewAnnouncement({ title: "", body: "" });
                    setAnnSuccess("Announcement sent to all users!");
                    setTimeout(() => setAnnSuccess(""), 3000);
                  } else {
                    setAnnError(result.error || "Failed to create announcement.");
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Megaphone size={16} /> Send to All Users
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display font-bold text-ink-900">All Announcements</h3>
            {announcements.length === 0 ? (
              <p className="text-sm text-ink-400">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-ink-900">{ann.title}</h4>
                          {ann.active ? (
                            <span className="badge bg-green-100 text-green-600">Active</span>
                          ) : (
                            <span className="badge bg-ink-100 text-ink-500">Inactive</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-ink-600">{ann.body}</p>
                        <p className="mt-1 text-xs text-ink-400">
                          {new Date(ann.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {ann.active && (
                          <button
                            onClick={() => deactivateAnnouncement(ann.id)}
                            className="btn-secondary px-3 py-1.5 text-xs"
                          >
                            Deactivate
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!window.confirm("Delete this announcement?")) return;
                            await deleteAnnouncement(ann.id);
                          }}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
