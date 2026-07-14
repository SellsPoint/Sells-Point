import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminActor } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const { actorId, listingId, action } = await request.json();

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "delete") {
    const { error } = await supabaseAdmin.from("listings").delete().eq("id", listingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
