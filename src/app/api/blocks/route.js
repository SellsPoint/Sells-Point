import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getActor(actorId) {
  if (!actorId) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, is_banned")
    .eq("id", actorId)
    .single();
  return data || null;
}

export async function GET(request) {
  const actorId = request.nextUrl.searchParams.get("actorId");
  const actor = await getActor(actorId);
  if (!actor || actor.is_banned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("user_blocks")
    .select("blocked_id, blocker_id, created_at")
    .or(`blocker_id.eq.${actor.id},blocked_id.eq.${actor.id}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocks: data || [] });
}

export async function POST(request) {
  const { actorId, blockedId } = await request.json();
  const actor = await getActor(actorId);
  if (!actor || actor.is_banned || !blockedId || actor.id === blockedId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("user_blocks")
    .upsert({ blocker_id: actor.id, blocked_id: blockedId }, { onConflict: "blocker_id,blocked_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { actorId, blockedId } = await request.json();
  const actor = await getActor(actorId);
  if (!actor || actor.is_banned || !blockedId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("user_blocks")
    .delete()
    .eq("blocker_id", actor.id)
    .eq("blocked_id", blockedId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
