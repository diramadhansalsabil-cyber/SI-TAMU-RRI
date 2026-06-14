import type { NextConfig } from "next";

function assertSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const placeholderPatterns = [
    /your-project/i,
    /your-anon-key/i,
    /anon key dari supabase/i,
    /isi-anon-key/i,
  ];

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi di Vercel Environment Variables."
    );
  }

  if (!url.includes(".supabase.co") || url.includes("/rest/v1")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL harus seperti https://xxxxx.supabase.co (tanpa /rest/v1/)."
    );
  }

  if (!anonKey.startsWith("eyJ") || placeholderPatterns.some((p) => p.test(anonKey))) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY harus JWT asli dari Supabase Settings → API (bukan teks placeholder)."
    );
  }
}

assertSupabaseEnv();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
