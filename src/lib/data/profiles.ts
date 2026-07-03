import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function listActiveProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("active", true)
    .order("full_name");
  return data ?? [];
}
