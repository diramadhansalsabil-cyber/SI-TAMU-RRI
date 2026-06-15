# UPLOAD SEKARANG — 3 Langkah (5 menit)

## Masalah
Production masih pakai **kode lama** dari GitHub. File di komputer Anda sudah benar, tapi **belum ter-upload**.

Bukti: GitHub masih ada teks `Popup diblokir` di `qr-generator.tsx`.

---

## LANGKAH 1 — Edit file di GitHub (paling penting)

### File 1: qr-generator.tsx
1. Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI/edit/main/src/components/qrcode/qr-generator.tsx
2. Tekan **Ctrl+A** → **Delete** (hapus semua isi lama)
3. Buka file di komputer: `c:\xampp\htdocs\SI-TAMU RRI\src\components\qrcode\qr-generator.tsx`
4. **Ctrl+A** → **Ctrl+C** → paste ke GitHub
5. Klik **Commit changes**

### File 2: globals.css
1. Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI/edit/main/src/app/globals.css
2. Hapus semua → paste dari `c:\xampp\htdocs\SI-TAMU RRI\src\app\globals.css`
3. **Commit changes**

### File 3: utils.ts
1. Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI/edit/main/src/lib/utils.ts
2. Hapus semua → paste dari `c:\xampp\htdocs\SI-TAMU RRI\src\lib\utils.ts`
3. **Commit changes**

### File 4: env.ts (file baru)
1. Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI/new/main/src/lib/supabase
2. Nama file: `env.ts`
3. Paste isi dari `c:\xampp\htdocs\SI-TAMU RRI\src\lib\supabase\env.ts`
4. **Commit changes**

---

## ATAU — Upload ZIP (lebih mudah)

1. Buka folder: `c:\xampp\htdocs\SI-TAMU RRI\`
2. Ada file **`UPLOAD-KE-GITHUB.zip`**
3. Extract ZIP
4. Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI
5. **Add file** → **Upload files**
6. Drag semua folder/file hasil extract
7. Commit message: `Fix cetak QR tanpa popup`
8. **Commit changes**

---

## LANGKAH 2 — Tunggu Vercel deploy otomatis

1. Buka: https://vercel.com/diramadhansalsabil-cybers-projects/si-tamu-rri-kdi/deployments
2. Tunggu deployment baru status **Ready** (hijau)
3. Pastikan commit terbaru (bukan `c61d24e`)

---

## LANGKAH 3 — Hard refresh browser

1. Buka: https://si-tamu-rri-kdi.vercel.app/dashboard/qrcode
2. Tekan **Ctrl + Shift + R** (hard refresh, hapus cache)
3. Klik **Cetak** → harus muncul dialog print Windows (bukan "Popup diblokir")

---

## Cara tahu sudah berhasil

| Sebelum (salah) | Sesudah (benar) |
|-----------------|-----------------|
| Toast: "Popup diblokir..." | Dialog print Windows langsung muncul |
| Kode pakai `window.open` | Kode pakai `window.print()` |

---

## Jika masih gagal setelah upload

Kirim screenshot halaman:
https://vercel.com/diramadhansalsabil-cybers-projects/si-tamu-rri-kdi/deployments

(deployment paling atas — status Ready atau Error)
