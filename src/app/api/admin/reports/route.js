import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminActor } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const actorId = request.nextUrl.searchParams.get("actorId");

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data });
}

export async function POST(request) {
  const { actorId, reportId, action, note = "" } = await request.json();

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action !== "resolve") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reports")
    .update({
      status: "resolved",
      resolution_note: note,
      resolved_by: actorId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.from("moderation_logs").insert({
    actor_id: actorId,
    target_type: "report",
    target_id: reportId,
    action,
    note,
  });
  return NextResponse.json({ success: true });
}
