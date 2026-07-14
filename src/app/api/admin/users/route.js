import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminActor } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const { actorId, targetUserId, action } = await request.json();

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!["ban", "unban"].includes(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_banned: action === "ban" })
    .eq("id", targetUserId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
