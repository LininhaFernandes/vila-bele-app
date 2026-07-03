import { createClient } from "@/lib/supabase/server";

const SIGNED_URL_TTL_SECONDS = 3600;

export async function getSignedReceiptUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function getSignedReceiptUrls(
  paths: string[],
): Promise<Record<string, string>> {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (uniquePaths.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("receipts")
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);

  const map: Record<string, string> = {};
  data?.forEach((item) => {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  });
  return map;
}
