function toTrimmed(value: string | undefined) {
  return value?.trim() || "";
}

function isHttpUrl(value: string) {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const supabaseUrl = toTrimmed(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = toTrimmed(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const hasSupabaseEnv = isHttpUrl(supabaseUrl) && Boolean(supabaseAnonKey);

const rawSiteUrl = toTrimmed(process.env.NEXT_PUBLIC_SITE_URL);
export const metadataBase =
  rawSiteUrl && isHttpUrl(rawSiteUrl) ? new URL(rawSiteUrl) : undefined;
