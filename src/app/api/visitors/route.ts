import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { visitorRegistrationSchema } from "@/lib/validations/visitor";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .order("waktu_kedatangan", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateCheck = await checkRateLimit(ip, "visitor-register");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = visitorRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!data.foto_url) {
      return NextResponse.json(
        { error: "Foto Selfie wajib diupload." },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const { data: visitor, error } = await supabase
      .from("visitors")
      .insert({
        nama_lengkap: sanitizeInput(data.nama_lengkap),
        nik: "-",
        nomor_telepon: sanitizeInput(data.nomor_telepon),
        instansi: data.instansi ? sanitizeInput(data.instansi) : null,
        alamat: sanitizeInput(data.alamat),
        tujuan_kunjungan: sanitizeInput(data.tujuan_kunjungan),
        orang_yang_dituju: data.orang_yang_dituju ? sanitizeInput(data.orang_yang_dituju) : "",
        foto_url: data.foto_url || null,
        waktu_kedatangan: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(visitor, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
