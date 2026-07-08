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

export function VisitorForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorRegistrationData>({
    resolver: zodResolver(visitorRegistrationSchema),
    defaultValues: {
      instansi: "",
      foto_url: "",
    },
  });

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
    if (!photoFile) {
      setPhotoError("Foto Selfie wajib diupload.");
      toast.error("Foto Selfie wajib diupload.");
      document.getElementById("photo-upload")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      let fotoUrl = "";

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
      fotoUrl = uploadData.url;

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
            <Label htmlFor="nomor_telepon">Nomor Telepon *</Label>
            <Input
              id="nomor_telepon"
              placeholder="08xxxxxxxxxx"
              {...register("nomor_telepon")}
            />
            {errors.nomor_telepon && (
              <p className="text-sm text-destructive">{errors.nomor_telepon.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instansi">Instansi / Organisasi *</Label>
            <Input
              id="instansi"
              placeholder="Nama instansi / organisasi"
              {...register("instansi")}
            />
            {errors.instansi && (
              <p className="text-sm text-destructive">{errors.instansi.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat *</Label>
            <Textarea
              id="alamat"
              placeholder="Alamat lengkap"
              rows={2}
              {...register("alamat")}
            />
            {errors.alamat && (
              <p className="text-sm text-destructive">{errors.alamat.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tujuan_kunjungan">Tujuan Kunjungan *</Label>
            <Textarea
              id="tujuan_kunjungan"
              placeholder="Keperluan kunjungan"
              rows={2}
              {...register("tujuan_kunjungan")}
            />
            {errors.tujuan_kunjungan && (
              <p className="text-sm text-destructive">{errors.tujuan_kunjungan.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orang_yang_dituju">Programa</Label>
            <Input
              id="orang_yang_dituju"
              placeholder="Opsional"
              {...register("orang_yang_dituju")}
            />
            {errors.orang_yang_dituju && (
              <p className="text-sm text-destructive">{errors.orang_yang_dituju.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Foto Selfie *</Label>
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

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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
