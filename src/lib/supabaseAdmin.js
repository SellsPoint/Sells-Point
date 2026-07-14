import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export async function isAdminActor(actorId) {
  if (!actorId) return false;
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", actorId)
    .single();
  if (error || !data) return false;
  return !!data.is_admin;
}
