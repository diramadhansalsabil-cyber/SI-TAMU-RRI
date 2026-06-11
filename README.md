# Sistem Pendataan Tamu Digital LPP RRI Kendari

Aplikasi web profesional untuk menggantikan buku tamu manual menjadi sistem digital berbasis QR Code.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn UI**
- **Supabase** (PostgreSQL, Auth, Storage)
- **React Hook Form** + **Zod**
- **TanStack Table**
- **Recharts**
- **QR Code**, **xlsx**, **jspdf**

---

## Setup Lokal

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan seluruh isi file `supabase/schema.sql`
3. Buka **Authentication > Users** dan buat user admin:
   - Email: `admin@rrikendari.go.id` (sesuaikan)
   - Password: minimal 6 karakter
4. User admin otomatis masuk ke tabel `admins` via trigger

### 3. Environment Variables

Salin `.env.example` ke `.env.local` dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Kunci ada di **Project Settings > API**

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Struktur Project

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── register/             # Form registrasi tamu
│   ├── success/              # Halaman sukses
│   ├── login/                # Login admin
│   ├── dashboard/            # Panel admin
│   │   ├── page.tsx          # Overview
│   │   ├── visitors/         # Data pengunjung
│   │   ├── reports/          # Laporan & statistik
│   │   ├── qrcode/           # Generate QR Code
│   │   └── settings/         # Pengaturan admin
│   └── api/
│       ├── visitors/         # CRUD visitors
│       └── upload/           # Upload foto ke Storage
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── dashboard/            # Dashboard components
│   ├── visitors/             # Table & dialogs
│   ├── register/             # Form tamu
│   ├── qrcode/               # QR generator
│   └── layout/               # Header, sidebar
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── validations/          # Zod schemas
│   ├── export/               # Excel & PDF export
│   └── rate-limit.ts         # Rate limiting
└── middleware.ts             # Auth protection
```

---

## Fitur

### Tamu (Guest)
- Scan QR Code → halaman `/register`
- Isi formulir dengan validasi Zod
- Upload foto selfie/KTP
- Submit tanpa login

### Admin
- Login dengan email & password
- Dashboard statistik (hari ini, minggu, bulan)
- Grafik kunjungan (Recharts)
- Data table dengan search, sort, pagination, filter tanggal
- Edit & hapus data tamu
- Export Excel & PDF
- Generate, download, dan cetak QR Code

### Keamanan
- Row Level Security (RLS) di Supabase
- Middleware proteksi route `/dashboard/*`
- Rate limiting pada registrasi & upload
- Sanitasi input

---

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: SI-TAMU RRI"
git remote add origin https://github.com/username/si-tamu-rri.git
git push -u origin main
```

### 2. Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repository GitHub
3. Framework: **Next.js** (otomatis terdeteksi)

### 3. Environment Variables di Vercel

Tambahkan di **Settings > Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |

### 4. Deploy

Klik **Deploy**. Vercel akan otomatis build dan deploy.

### 5. Setelah Deploy

1. Update URL production di halaman QR Code (otomatis dari `window.location.origin`)
2. Cetak QR Code dari `/dashboard/qrcode`
3. Tempel QR Code di meja resepsionis

---

## Supabase Auth Redirect (Opsional)

Di Supabase Dashboard → **Authentication > URL Configuration**:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Login gagal | Pastikan user admin sudah dibuat di Supabase Auth |
| Upload foto gagal | Cek bucket `visitor-photos` sudah dibuat via schema.sql |
| Data tidak muncul di dashboard | Pastikan admin sudah login dan RLS policies aktif |
| Build error | Jalankan `npm install` dan pastikan env variables terisi |

---

## Lisensi

Dikembangkan untuk LPP RRI Kendari.
