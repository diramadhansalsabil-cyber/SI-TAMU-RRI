"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

  const onSubmit = async (data: VisitorFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/visitors/${visitor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
          {visitor.foto_url && (
            <div className="space-y-2">
              <Label>Foto</Label>
              <img
                src={visitor.foto_url}
                alt={visitor.nama_lengkap}
                className="h-32 w-32 rounded-lg object-cover ring-1 ring-border"
              />
            </div>
          )}
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
            <Label htmlFor="edit-dituju">Programe</Label>
            <Input id="edit-dituju" {...register("orang_yang_dituju")} />
            {errors.orang_yang_dituju && (
              <p className="text-sm text-destructive">{errors.orang_yang_dituju.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
