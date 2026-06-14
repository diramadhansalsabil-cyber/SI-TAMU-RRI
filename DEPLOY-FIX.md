# Panduan Deploy Lengkap — SI-TAMU RRI

## Checklist Environment Variables Vercel (WAJIB — 4 variable)

Buka: https://vercel.com/diramadhansalsabil-cybers-projects/si-tamu-rri-kdi/settings/environment-variables

| Key | Value | Catatan |
|-----|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kyfgmupvvgyxjlvabmwl.supabase.co` | Tanpa `/rest/v1/` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT `eyJhbGci...` | Dari Supabase → Settings → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT service_role | Dari Supabase → Settings → API |
| `NEXT_PUBLIC_APP_URL` | `https://si-tamu-rri-kdi.vercel.app` | Untuk QR Code tamu |

**Penting:**
- Centang **Production** untuk semua variable
- Jangan pakai teks placeholder seperti "anon key dari Supabase"
- Jangan ada spasi di awal/akhir value
- Setelah edit env → **Redeploy** deployment hijau (Ready)

---

## Upload ke GitHub (file yang HARUS terbaru)

Buka: https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI

Upload/replace file berikut dari folder lokal `c:\xampp\htdocs\SI-TAMU RRI\`:

```
next.config.ts
src/app/globals.css
src/components/qrcode/qr-generator.tsx
src/lib/utils.ts
src/lib/supabase/env.ts          ← file baru
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/middleware.ts
src/lib/rate-limit.ts
```

Atau drag & drop seluruh folder **`src`** + **`next.config.ts`**.

Commit message: `Fix QR print, URL production, Supabase env`

---

## File yang TIDAK boleh di GitHub

Hapus jika masih ada:
- `.env.local` (berisi API key rahasia)
- `node_modules/`
- `.next/`

---

## Deploy di Vercel

1. Tunggu Vercel auto-deploy setelah commit GitHub, ATAU
2. Deployments → pilih deployment **Ready** (hijau) → **Redeploy**
3. **JANGAN** redeploy deployment **Error** (merah) commit `c61d24e`

Pastikan log build menunjukkan commit terbaru (bukan `c61d24e`).

---

## Supabase — URL Configuration

Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|-------|
| Site URL | `https://si-tamu-rri-kdi.vercel.app` |
| Redirect URLs | `https://si-tamu-rri-kdi.vercel.app/**` |

---

## Setelah deploy berhasil

| Fitur | URL |
|-------|-----|
| Login admin | https://si-tamu-rri-kdi.vercel.app/login |
| Dashboard | https://si-tamu-rri-kdi.vercel.app/dashboard |
| QR Code | https://si-tamu-rri-kdi.vercel.app/dashboard/qrcode |
| Form tamu | https://si-tamu-rri-kdi.vercel.app/register |

**Login admin:** `admin@rrikendari.go.id` + password dari Supabase Auth

---

## Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Couldn't find pages or app directory` | Commit lama tanpa `src/` | Deploy commit terbaru dengan folder `src/` |
| `Invalid API key` | Anon key placeholder/salah di Vercel | Paste JWT asli, redeploy |
| `Popup diblokir` saat cetak | Kode lama di GitHub | Upload `qr-generator.tsx` + `globals.css` terbaru |
| Scan QR → login Vercel | URL preview, bukan production | Set `NEXT_PUBLIC_APP_URL`, buka dashboard via URL production |
| Build gagal next.config | Validasi env di next.config | Pakai `next.config.ts` tanpa validasi (sudah diperbaiki) |

---

## URL yang benar vs salah

```
✅ https://si-tamu-rri-kdi.vercel.app
❌ https://si-tamu-rri-xxxxx-diramadhansalsabil-cybers-projects.vercel.app
```

Selalu pakai URL pendek (production) untuk admin dan QR Code.
