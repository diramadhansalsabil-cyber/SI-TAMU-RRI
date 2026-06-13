import Link from "next/link";
import {
  Building2,
  QrCode,
  Shield,
  Smartphone,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "Registrasi via QR Code",
    description: "Tamu cukup scan QR Code untuk mengisi formulir digital tanpa antre.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Formulir responsif dan mudah diisi dari smartphone tamu.",
  },
  {
    icon: Clock,
    title: "Pencatatan Otomatis",
    description: "Waktu kedatangan tercatat otomatis saat tamu submit data.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Admin",
    description: "Statistik kunjungan, laporan, dan manajemen data dalam satu panel.",
  },
  {
    icon: Shield,
    title: "Keamanan Data",
    description: "Proteksi RLS, autentikasi admin, dan validasi data terjamin.",
  },
  {
    icon: Building2,
    title: "Profesional & Modern",
    description: "Tampilan modern sesuai standar instansi pemerintah.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="gradient-hero text-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <Building2 className="h-4 w-4" />
              Lembaga Penyiaran Publik RRI Kendari
            </div>
            <h1 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">
              Sistem Pendataan Tamu Digital
            </h1>
            <p className="mb-8 text-lg text-blue-100 md:text-xl">
              Gantikan buku tamu manual dengan sistem digital berbasis QR Code.
              Cepat, efisien, dan terintegrasi.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Registrasi Tamu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <Link href="/login">Login Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-primary md:text-3xl">
            Cara Kerja Sistem
          </h2>
          <p className="text-muted-foreground">
            Proses registrasi tamu yang mudah dan efisien
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-4">
          {[
            { step: "1", title: "Scan QR", desc: "Tamu scan QR Code di meja resepsionis" },
            { step: "2", title: "Isi Form", desc: "Lengkapi data diri di smartphone" },
            { step: "3", title: "Submit", desc: "Data otomatis tersimpan ke sistem" },
            { step: "4", title: "Selesai", desc: "Admin dapat memantau di dashboard" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mb-1 font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-primary md:text-3xl">Fitur Utama</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LPP RRI Kendari. Sistem Pendataan Tamu Digital.</p>
        </div>
      </footer>
    </div>
  );
}
