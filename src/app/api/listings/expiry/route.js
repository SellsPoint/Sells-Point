import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const { error } = await supabaseAdmin
    .from("listings")
    .update({ status: "expired" })
    .eq("status", "active")
    .lte("expires_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
