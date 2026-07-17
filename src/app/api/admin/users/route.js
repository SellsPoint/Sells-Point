import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminActor } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const { actorId, targetUserId, action, note = "" } = await request.json();

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!["ban", "unban", "suspend", "unsuspend", "warn"].includes(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (action === "warn") {
    const { error } = await supabaseAdmin.from("notifications").insert({
      recipient_id: targetUserId,
      actor_id: actorId,
      type: "admin",
      entity_id: targetUserId,
      entity_type: "warning",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabaseAdmin.from("moderation_logs").insert({
      actor_id: actorId,
      target_type: "user",
      target_id: targetUserId,
      action,
      note,
    });
    return NextResponse.json({ success: true });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_banned: action === "ban" || action === "suspend" })
    .eq("id", targetUserId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from("moderation_logs").insert({
    actor_id: actorId,
    target_type: "user",
    target_id: targetUserId,
    action,
    note,
  });
  return NextResponse.json({ success: true });
}
