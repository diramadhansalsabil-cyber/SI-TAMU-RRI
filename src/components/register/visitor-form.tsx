"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { visitorRegistrationSchema, type VisitorRegistrationData } from "@/lib/validations/visitor";
import { compressImage, ImageValidationError } from "@/lib/image-compress";
import {
  OTHER_VALUE,
  PEKERJAAN_OPTIONS,
  TUJUAN_OPTIONS,
  PROGRAMA_OPTIONS,
} from "@/lib/constants/visitor-options";

const selectClass =
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function VisitorForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const [pekerjaanChoice, setPekerjaanChoice] = useState("");
  const [pekerjaanOther, setPekerjaanOther] = useState("");
  const [tujuanChoice, setTujuanChoice] = useState("");
  const [tujuanOther, setTujuanOther] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<VisitorRegistrationData>({
    resolver: zodResolver(visitorRegistrationSchema),
    defaultValues: {
      instansi: "",
      pekerjaan: "",
      tujuan_kunjungan: "",
      orang_yang_dituju: "",
      foto_url: "",
    },
  });

  const handlePekerjaanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPekerjaanChoice(value);
    clearErrors("pekerjaan");
    if (value === OTHER_VALUE) {
      setValue("pekerjaan", pekerjaanOther);
    } else {
      setValue("pekerjaan", value);
    }
  };

  const handleTujuanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTujuanChoice(value);
    clearErrors("tujuan_kunjungan");
    if (value === OTHER_VALUE) {
      setValue("tujuan_kunjungan", tujuanOther);
    } else {
      setValue("tujuan_kunjungan", value);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsProcessingPhoto(true);
    try {
      const compressed = await compressImage(file);
      setPhotoFile(compressed);
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(compressed);
      });
    } catch (err) {
      const message =
        err instanceof ImageValidationError
          ? err.message
          : "Gagal memproses foto. Coba foto lain.";
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError(message);
      toast.error(message);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const onSubmit = async (data: VisitorRegistrationData) => {
    if (pekerjaanChoice === OTHER_VALUE && !pekerjaanOther.trim()) {
      setError("pekerjaan", { message: "Mohon tuliskan pekerjaan Anda" });
      return;
    }
    if (tujuanChoice === OTHER_VALUE && !tujuanOther.trim()) {
      setError("tujuan_kunjungan", { message: "Mohon tuliskan tujuan kunjungan" });
      return;
    }
    if (!photoFile) {
      setPhotoError("Foto Selfie wajib diupload.");
      toast.error("Foto Selfie wajib diupload.");
      document.getElementById("photo-upload")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Gagal upload foto");
      }

      const uploadData = await uploadRes.json();
      const fotoUrl = uploadData.url;

      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, foto_url: fotoUrl || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan data");
      }

      toast.success("Registrasi berhasil!");
      router.push("/success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-primary">Formulir Registrasi Tamu</CardTitle>
        <CardDescription>
          Silakan lengkapi data diri Anda untuk mencatat kunjungan ke LPP RRI Kendari
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
            <Input
              id="nama_lengkap"
              placeholder="Masukkan nama lengkap"
              {...register("nama_lengkap")}
            />
            {errors.nama_lengkap && (
              <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomor_telepon">Nomor Telepon / WhatsApp *</Label>
            <Input
              id="nomor_telepon"
              inputMode="numeric"
              placeholder="081234567xxx"
              {...register("nomor_telepon")}
            />
            <p className="text-xs text-muted-foreground">Format: 081234567xxx</p>
            {errors.nomor_telepon && (
              <p className="text-sm text-destructive">{errors.nomor_telepon.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pekerjaan-select">Pekerjaan *</Label>
            <select
              id="pekerjaan-select"
              className={selectClass}
              value={pekerjaanChoice}
              onChange={handlePekerjaanChange}
            >
              <option value="" disabled>
                Pilih pekerjaan
              </option>
              {PEKERJAAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {pekerjaanChoice === OTHER_VALUE && (
              <Input
                placeholder="Tuliskan pekerjaan Anda"
                value={pekerjaanOther}
                onChange={(e) => {
                  setPekerjaanOther(e.target.value);
                  setValue("pekerjaan", e.target.value);
                  clearErrors("pekerjaan");
                }}
              />
            )}
            {errors.pekerjaan && (
              <p className="text-sm text-destructive">{errors.pekerjaan.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instansi">Asal Instansi / Perusahaan / Organisasi</Label>
            <Input
              id="instansi"
              placeholder="Opsional"
              {...register("instansi")}
            />
            {errors.instansi && (
              <p className="text-sm text-destructive">{errors.instansi.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat Lengkap *</Label>
            <Textarea
              id="alamat"
              placeholder="Alamat lengkap"
              rows={3}
              {...register("alamat")}
            />
            {errors.alamat && (
              <p className="text-sm text-destructive">{errors.alamat.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tujuan-select">Tujuan Kunjungan *</Label>
            <select
              id="tujuan-select"
              className={selectClass}
              value={tujuanChoice}
              onChange={handleTujuanChange}
            >
              <option value="" disabled>
                Pilih tujuan kunjungan
              </option>
              {TUJUAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {tujuanChoice === OTHER_VALUE && (
              <Input
                placeholder="Tuliskan tujuan kunjungan"
                value={tujuanOther}
                onChange={(e) => {
                  setTujuanOther(e.target.value);
                  setValue("tujuan_kunjungan", e.target.value);
                  clearErrors("tujuan_kunjungan");
                }}
              />
            )}
            {errors.tujuan_kunjungan && (
              <p className="text-sm text-destructive">{errors.tujuan_kunjungan.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="programa-select">Pilihan Programa (Ditujukan ke Bagian Mana) *</Label>
            <select
              id="programa-select"
              className={selectClass}
              defaultValue=""
              {...register("orang_yang_dituju")}
            >
              <option value="" disabled>
                Pilih programa / bagian
              </option>
              {PROGRAMA_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.orang_yang_dituju && (
              <p className="text-sm text-destructive">{errors.orang_yang_dituju.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Foto Selfie / Bukti Kunjungan *</Label>
            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-6">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-muted">
                  <Camera className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <label htmlFor="photo-upload" className="cursor-pointer">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isProcessingPhoto}
                />
                <span className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                  {isProcessingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {photoFile ? "Ganti Foto" : "Upload Foto"}
                    </>
                  )}
                </span>
              </label>
              <p className="text-xs text-muted-foreground">
                Maks. 5MB (JPG, PNG, WebP) &mdash; otomatis dikompres ke maks. 200KB
              </p>
            </div>
            {photoError && (
              <p className="text-sm text-destructive">{photoError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isProcessingPhoto}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Kirim Data"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
