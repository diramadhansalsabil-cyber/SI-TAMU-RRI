import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="pt-10 pb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-primary">Registrasi Berhasil!</h1>
          <p className="mb-2 text-muted-foreground">
            Terima kasih telah mengisi formulir registrasi tamu.
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            Data Anda telah tercatat dalam sistem. Silakan menunggu petugas untuk
            memandu kunjungan Anda.
          </p>
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
