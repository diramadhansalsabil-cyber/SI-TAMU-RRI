import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { visitorUpdateSchema } from "@/lib/validations/visitor";
import { sanitizeInput } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = visitorUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | null> = {};
    const data = parsed.data;

    if (data.nama_lengkap) updateData.nama_lengkap = sanitizeInput(data.nama_lengkap);
    if (data.nik) updateData.nik = sanitizeInput(data.nik);
    if (data.nomor_telepon) updateData.nomor_telepon = sanitizeInput(data.nomor_telepon);
    if (data.instansi !== undefined) updateData.instansi = data.instansi ? sanitizeInput(data.instansi) : null;
    if (data.alamat) updateData.alamat = sanitizeInput(data.alamat);
    if (data.tujuan_kunjungan) updateData.tujuan_kunjungan = sanitizeInput(data.tujuan_kunjungan);
    if (data.orang_yang_dituju !== undefined) updateData.orang_yang_dituju = data.orang_yang_dituju ? sanitizeInput(data.orang_yang_dituju) : "";
    if (data.foto_url !== undefined) updateData.foto_url = data.foto_url || null;

    const { data: visitor, error } = await supabase
      .from("visitors")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(visitor);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("visitors").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
