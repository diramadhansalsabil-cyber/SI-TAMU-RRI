import { z } from "zod";

export const visitorSchema = z.object({
  nama_lengkap: z
    .string()
    .min(3, "Nama Lengkap wajib diisi (minimal 3 karakter)")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka")
    .optional()
    .or(z.literal("")),
  nomor_telepon: z
    .string()
    .min(10, "Nomor Telepon wajib diisi (minimal 10 digit)")
    .max(20, "Nomor telepon maksimal 20 digit")
    .regex(/^[0-9+\-\s]+$/, "Format nomor telepon tidak valid"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(150, "Email maksimal 150 karakter"),
  pekerjaan: z
    .string()
    .min(1, "Pekerjaan wajib diisi")
    .max(100, "Pekerjaan maksimal 100 karakter"),
  instansi: z.string().max(200, "Instansi maksimal 200 karakter").optional().or(z.literal("")),
  alamat: z
    .string()
    .min(5, "Alamat wajib diisi (minimal 5 karakter)")
    .max(500, "Alamat maksimal 500 karakter"),
  tujuan_kunjungan: z
    .string()
    .min(3, "Tujuan Kunjungan wajib diisi")
    .max(300, "Tujuan kunjungan maksimal 300 karakter"),
  orang_yang_dituju: z
    .string()
    .min(1, "Programa wajib dipilih")
    .max(255, "Maksimal 255 karakter"),
  foto_url: z.string().url().optional().or(z.literal("")),
});

export const visitorRegistrationSchema = visitorSchema.omit({ nik: true });

export const visitorUpdateSchema = visitorSchema.partial();

export type VisitorFormData = z.infer<typeof visitorSchema>;
export type VisitorRegistrationData = z.infer<typeof visitorRegistrationSchema>;
