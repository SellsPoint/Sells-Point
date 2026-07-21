import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/adminSession";

export async function POST(request) {
  const { listingId, action, note = "", price, listing = {} } = await request.json();
  const session = await requireAdminSession(request);
  if (!session.ok) return session.response;
  const actorId = session.profileId;

  if (action === "create") {
    const title = listing.title?.trim();
    const description = listing.description?.trim();
    const category = listing.category;
    const sellingPrice = Number(listing.price);

    if (!title || !description || !category || !Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      return NextResponse.json({ error: "Title, description, category, and a positive price are required" }, { status: 400 });
    }

    let subcategoryId = listing.subcategoryId || null;
    if (subcategoryId) {
      const { data: subcategory } = await supabaseAdmin
        .from("subcategories")
        .select("category_id")
        .eq("id", subcategoryId)
        .maybeSingle();
      if (!subcategory || subcategory.category_id !== category) subcategoryId = null;
    }

    const { data, error } = await supabaseAdmin
      .from("listings")
      .insert({
        seller_id: actorId,
        title,
        description,
        price: sellingPrice,
        original_price: Number(listing.originalPrice) || sellingPrice,
        category,
        subcategory_id: subcategoryId,
        condition: listing.condition || "Good",
        images: Array.isArray(listing.images) ? listing.images : [],
        video_url: listing.video || null,
        location: listing.location || session.profile.location || "India",
        latitude: typeof listing.latitude === "number" ? listing.latitude : null,
        longitude: typeof listing.longitude === "number" ? listing.longitude : null,
        featured: false,
        featured_status: "none",
        status: "active",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listing: data }, { status: 201 });
  }

  if (action === "delete") {
    const { error } = await supabaseAdmin.from("listings").delete().eq("id", listingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const moderationStatusMap = {
    flag: "flagged",
    remove: "removed",
    restore: "active",
  };
  if (moderationStatusMap[action]) {
    const { error } = await supabaseAdmin
      .from("listings")
      .update({ status: moderationStatusMap[action], moderation_note: note })
      .eq("id", listingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("moderation_logs").insert({
      actor_id: actorId,
      target_type: "listing",
      target_id: listingId,
      action,
      note,
    });
    return NextResponse.json({ success: true });
  }

  if (action === "quote-featured") {
    const amount = Number(price);
    if (!Number.isInteger(amount) || amount <= 0) return NextResponse.json({ error: "Enter a positive whole-rupee quote" }, { status: 400 });
    const { data: listing } = await supabaseAdmin.from("listings").select("seller_id, featured_status").eq("id", listingId).single();
    if (!listing || listing.featured_status !== "pending") return NextResponse.json({ error: "Request is not pending" }, { status: 409 });
    const { error } = await supabaseAdmin.from("listings").update({ featured: false, featured_status: "awaiting_payment", promotion_price_inr: amount, promotion_quoted_at: new Date().toISOString() }).eq("id", listingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabaseAdmin.from("notifications").insert({ recipient_id: listing.seller_id, actor_id: actorId, type: "featured_quote_ready", entity_id: listingId, entity_type: "listing" });
    return NextResponse.json({ success: true });
  }

  const statusMap = { "reject-featured": "rejected" };
  const featuredStatus = statusMap[action];
  if (!featuredStatus) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("listings")
    .update({ featured_status: featuredStatus, featured: false, promotion_price_inr: null, promotion_quoted_at: null, promotion_paid_at: null, promotion_payment_reference: null })
    .eq("id", listingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
