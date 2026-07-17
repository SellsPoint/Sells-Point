import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminActor } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const { actorId, listingId, action, note = "" } = await request.json();

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  const statusMap = {
    "approve-featured": "approved",
    "reject-featured": "rejected",
  };
  const featuredStatus = statusMap[action];
  if (!featuredStatus) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("listings")
    .update({ featured_status: featuredStatus, featured: featuredStatus === "approved" })
    .eq("id", listingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
