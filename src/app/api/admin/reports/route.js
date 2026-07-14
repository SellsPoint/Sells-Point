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
  const { actorId, reportId, action } = await request.json();

  if (!(await isAdminActor(actorId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action !== "resolve") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
