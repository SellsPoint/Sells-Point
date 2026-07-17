import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function uniqueByValue(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}:${item.value}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const [listingRes, categoryRes, locationRes] = await Promise.all([
    supabaseAdmin
      .from("listings")
      .select("title")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .ilike("title", `%${q}%`)
      .limit(5),
    supabaseAdmin
      .from("categories")
      .select("id, label")
      .ilike("label", `%${q}%`)
      .limit(5),
    supabaseAdmin
      .from("listings")
      .select("location")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .ilike("location", `%${q}%`)
      .limit(5),
  ]);

  const suggestions = uniqueByValue([
    ...((listingRes.data || []).map((row) => ({
      type: "listing",
      label: row.title,
      value: row.title,
    }))),
    ...((categoryRes.data || []).map((row) => ({
      type: "category",
      label: row.label,
      value: row.id,
    }))),
    ...((locationRes.data || [])
      .filter((row) => row.location)
      .map((row) => ({
        type: "location",
        label: row.location,
        value: row.location,
      }))),
  ]).slice(0, 8);

  return NextResponse.json({ suggestions });
}
