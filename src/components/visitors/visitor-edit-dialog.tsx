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
import { Visitor } from "@/types";

interface VisitorEditDialogProps {
  visitor: Visitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorUpdateSchema),
    defaultValues: {
      nama_lengkap: visitor.nama_lengkap,
      nomor_telepon: visitor.nomor_telepon,
      instansi: visitor.instansi || "",
      alamat: visitor.alamat,
      tujuan_kunjungan: visitor.tujuan_kunjungan,
      orang_yang_dituju: visitor.orang_yang_dituju,
      foto_url: visitor.foto_url || "",
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

  const onSubmit = async (data: VisitorFormData) => {
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
            <Label htmlFor="edit-instansi">Instansi</Label>
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
            <Textarea id="edit-tujuan" rows={2} {...register("tujuan_kunjungan")} />
            {errors.tujuan_kunjungan && (
              <p className="text-sm text-destructive">{errors.tujuan_kunjungan.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dituju">Programa (opsional)</Label>
            <Input id="edit-dituju" placeholder="Boleh dikosongkan" {...register("orang_yang_dituju")} />
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
