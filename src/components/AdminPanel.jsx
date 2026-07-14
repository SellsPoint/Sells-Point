"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const TABS = [
  { id: "listings", label: "Listings", icon: LayoutList },
  { id: "users", label: "Users", icon: Users },
  { id: "reports", label: "Reports", icon: Flag },
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
    getUserById,
    getListingById,
    setFeaturedStatus,
    deleteListing,
    banUser,
    unbanUser,
    resolveReport,
  } = useApp();
  const [tab, setTab] = useState("listings");

  const pendingFeatured = listings.filter((l) => l.featuredStatus === "pending");
  const otherListings = listings.filter((l) => l.featuredStatus !== "pending");
  const openReports = reports.filter((r) => r.status === "open");
  const closedReports = reports.filter((r) => r.status !== "open");

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
    </div>
  );
}
