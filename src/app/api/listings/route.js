import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const WRITABLE_FIELDS = [
  "title",
  "description",
  "price",
  "original_price",
  "category",
  "condition",
  "images",
  "video_url",
  "location",
  "latitude",
  "longitude",
  "featured",
  "featured_status",
  "status",
];

async function getActor(actorId) {
  if (!actorId) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, verified, is_admin, is_banned, location")
    .eq("id", actorId)
    .single();
  return data || null;
}

async function getListing(listingId) {
  if (!listingId) return null;
  const { data } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();
  return data || null;
}

function cleanUpdates(updates = {}) {
  const row = {};
  for (const field of WRITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      row[field] = updates[field];
    }
  }
  return row;
}

export async function POST(request) {
  const body = await request.json();
  const actor = await getActor(body.actorId);

  if (!actor || actor.is_banned || !actor.verified) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (body.action === "create") {
    const listing = body.listing || {};
    const { data, error } = await supabaseAdmin
      .from("listings")
      .insert({
        seller_id: actor.id,
        title: listing.title,
        description: listing.description || "",
        price: Number(listing.price) || 0,
        original_price: Number(listing.originalPrice) || Number(listing.price) || 0,
        category: listing.category,
        condition: listing.condition || "Good",
        images: listing.images && listing.images.length ? listing.images : [],
        video_url: listing.video || null,
        location: listing.location || actor.location || "India",
        latitude: typeof listing.latitude === "number" ? listing.latitude : null,
        longitude: typeof listing.longitude === "number" ? listing.longitude : null,
        featured: !!listing.featured,
        featured_status: listing.featured ? "pending" : "none",
        status: "active",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listing: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function PATCH(request) {
  const body = await request.json();
  const actor = await getActor(body.actorId);
  const listing = await getListing(body.listingId);

  if (!actor || actor.is_banned || !listing) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const ownsListing = listing.seller_id === actor.id;
  if (!ownsListing && !actor.is_admin && !body.skipOwnershipCheck) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (body.action === "renew") {
    if (!ownsListing && !actor.is_admin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from("listings")
      .update({
        status: "active",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", listing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listing: data });
  }

  const updates = cleanUpdates(body.updates);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates" }, { status: 400 });
  }

  if (!actor.is_admin) {
    delete updates.featured_status;
    delete updates.moderation_note;
    if (updates.status && !["active", "sold"].includes(updates.status)) {
      delete updates.status;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("listings")
    .update(updates)
    .eq("id", listing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}

export async function DELETE(request) {
  const body = await request.json();
  const actor = await getActor(body.actorId);
  const listing = await getListing(body.listingId);

  if (!actor || actor.is_banned || !listing) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  if (listing.seller_id !== actor.id && !actor.is_admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from("listings").delete().eq("id", listing.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
