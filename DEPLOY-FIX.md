# Cara Memperbaiki Deploy Vercel

## Penyebab Error

```
Couldn't find any `pages` or `app` directory.
```

Folder **`src/`** belum ada di GitHub. Upload sebelumnya hanya file root (package.json, dll), tanpa kode aplikasi.

## Solusi Cepat — Upload folder `src` ke GitHub

### Langkah 1
Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI

### Langkah 2
Klik **Add file** → **Upload files**

### Langkah 3
Di Windows Explorer, buka:
```
c:\xampp\htdocs\SI-TAMU RRI\src
```

**Drag & drop** seluruh folder `src` ke halaman upload GitHub.

Pastikan struktur di GitHub menjadi:
```
src/
  app/
  components/
  lib/
  middleware.ts
  types/
```

### Langkah 4
Commit message: `Add src folder for Next.js app`
Klik **Commit changes**

### Langkah 5
Upload juga folder `supabase` jika belum ada (drag & drop).

### Langkah 6
Hapus `.env.local` dari GitHub jika masih ada (gunakan link delete).

### Langkah 7
Di Vercel → **Redeploy**

---

## Environment Variables di Vercel (wajib)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://kyfgmupvvgyxjlvabmwl.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT panjang dari Supabase Settings → API → **anon public** (bukan teks "anon key dari Supabase") |
| `SUPABASE_SERVICE_ROLE_KEY` | (dari Supabase Settings → API) |
| `NEXT_PUBLIC_APP_URL` | `https://si-tamu-rri-kdi.vercel.app` (URL production, untuk QR Code) |

---

## File yang TIDAK boleh di GitHub

- `.env.local`
- `node_modules/`
- `.next/`

---

## Setelah deploy berhasil

1. Supabase → Authentication → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`
2. Login: `https://your-app.vercel.app/login`
3. QR Code: `https://your-app.vercel.app/dashboard/qrcode`
