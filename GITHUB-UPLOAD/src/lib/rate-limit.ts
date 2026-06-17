import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceEnv } from "@/lib/supabase/env";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function getServiceClient() {
  const { url, serviceKey } = getSupabaseServiceEnv();
  return createClient(url, serviceKey);
}

export async function checkRateLimit(
  ip: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = getServiceClient();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count, error } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("endpoint", endpoint)
      .gte("created_at", windowStart);

    if (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true, remaining: MAX_REQUESTS };
    }

    const currentCount = count ?? 0;
    if (currentCount >= MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }

    await supabase.from("rate_limits").insert({
      ip_address: ip,
      endpoint,
    });

    return { allowed: true, remaining: MAX_REQUESTS - currentCount - 1 };
  } catch {
    return { allowed: true, remaining: MAX_REQUESTS };
  }
}
