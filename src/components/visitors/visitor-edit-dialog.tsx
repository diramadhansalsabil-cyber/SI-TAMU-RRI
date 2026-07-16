"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { visitorUpdateSchema, type VisitorFormData } from "@/lib/validations/visitor";
import { compressImage, ImageValidationError } from "@/lib/image-compress";
import {
  OTHER_VALUE,
  PEKERJAAN_OPTIONS,
  TUJUAN_OPTIONS,
  PROGRAMA_OPTIONS,
} from "@/lib/constants/visitor-options";
import { Visitor } from "@/types";

interface VisitorEditDialogProps {
  visitor: Visitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const selectClass =
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function resolveChoice(value: string | null, options: readonly string[]) {
  if (value && options.includes(value)) return { choice: value, other: "" };
  if (value) return { choice: OTHER_VALUE, other: value };
  return { choice: "", other: "" };
}

export function VisitorEditDialog({
  visitor,
  open,
  onOpenChange,
  onSuccess,
}: VisitorEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const pekerjaanInit = resolveChoice(visitor.pekerjaan, PEKERJAAN_OPTIONS);
  const tujuanInit = resolveChoice(visitor.tujuan_kunjungan, TUJUAN_OPTIONS);

  const [pekerjaanChoice, setPekerjaanChoice] = useState(pekerjaanInit.choice);
  const [pekerjaanOther, setPekerjaanOther] = useState(pekerjaanInit.other);
  const [tujuanChoice, setTujuanChoice] = useState(tujuanInit.choice);
  const [tujuanOther, setTujuanOther] = useState(tujuanInit.other);

  const programaInOptions =
    !!visitor.orang_yang_dituju && PROGRAMA_OPTIONS.includes(visitor.orang_yang_dituju as (typeof PROGRAMA_OPTIONS)[number]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorUpdateSchema),
    defaultValues: {
      nama_lengkap: visitor.nama_lengkap,
      nomor_telepon: visitor.nomor_telepon,
      email: visitor.email || "",
      pekerjaan: visitor.pekerjaan || "",
      instansi: visitor.instansi || "",
      alamat: visitor.alamat,
      tujuan_kunjungan: visitor.tujuan_kunjungan,
      orang_yang_dituju: visitor.orang_yang_dituju,
      foto_url: visitor.foto_url || "",
    },
  });

  const handlePekerjaanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPekerjaanChoice(value);
    clearErrors("pekerjaan");
    setValue("pekerjaan", value === OTHER_VALUE ? pekerjaanOther : value);
  };

  const handleTujuanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTujuanChoice(value);
    clearErrors("tujuan_kunjungan");
    setValue("tujuan_kunjungan", value === OTHER_VALUE ? tujuanOther : value);
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

  const onSubmit = async (data: VisitorFormData) => {
    if (pekerjaanChoice === OTHER_VALUE && !pekerjaanOther.trim()) {
      setError("pekerjaan", { message: "Mohon tuliskan pekerjaan" });
      return;
    }
    if (tujuanChoice === OTHER_VALUE && !tujuanOther.trim()) {
      setError("tujuan_kunjungan", { message: "Mohon tuliskan tujuan kunjungan" });
      return;
    }

    setIsSubmitting(true);
    try {
      let fotoUrl = visitor.foto_url || "";

      if (photoFile) {
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
      }

      const res = await fetch(`/api/visitors/${visitor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, foto_url: fotoUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memperbarui data");
      }

      toast.success("Data berhasil diperbarui");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPhoto = photoPreview || visitor.foto_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Data Tamu</DialogTitle>
          <DialogDescription>Perbarui informasi pengunjung</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nama">Nama Lengkap</Label>
            <Input id="edit-nama" {...register("nama_lengkap")} />
            {errors.nama_lengkap && (
              <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-telepon">Telepon</Label>
            <Input id="edit-telepon" {...register("nomor_telepon")} />
            {errors.nomor_telepon && (
              <p className="text-sm text-destructive">{errors.nomor_telepon.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pekerjaan">Pekerjaan</Label>
            <select
              id="edit-pekerjaan"
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
                placeholder="Tuliskan pekerjaan"
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
            <Label>Foto</Label>
            <div className="flex items-center gap-4">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={visitor.nama_lengkap}
                  className="h-24 w-24 rounded-lg object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  Tidak ada
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="edit-photo-upload" className="cursor-pointer">
                  <input
                    id="edit-photo-upload"
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
                        Ganti Foto
                      </>
                    )}
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Kosongkan untuk pakai foto lama
                </p>
              </div>
            </div>
            {photoError && (
              <p className="text-sm text-destructive">{photoError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-instansi">Instansi (opsional)</Label>
            <Input id="edit-instansi" {...register("instansi")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-alamat">Alamat</Label>
            <Textarea id="edit-alamat" rows={2} {...register("alamat")} />
            {errors.alamat && (
              <p className="text-sm text-destructive">{errors.alamat.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tujuan">Tujuan Kunjungan</Label>
            <select
              id="edit-tujuan"
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
            <Label htmlFor="edit-dituju">Pilihan Programa</Label>
            <select
              id="edit-dituju"
              className={selectClass}
              defaultValue={visitor.orang_yang_dituju || ""}
              {...register("orang_yang_dituju")}
            >
              <option value="" disabled>
                Pilih programa / bagian
              </option>
              {!programaInOptions && visitor.orang_yang_dituju && (
                <option value={visitor.orang_yang_dituju}>{visitor.orang_yang_dituju}</option>
              )}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isProcessingPhoto}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
