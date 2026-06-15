"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppUrl, isVercelPreviewUrl } from "@/lib/utils";
import { toast } from "sonner";

export function QRGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [registerUrl, setRegisterUrl] = useState("");
  const [isPreviewUrl, setIsPreviewUrl] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const url = `${getAppUrl()}/register`;
    setRegisterUrl(url);
    setIsPreviewUrl(isVercelPreviewUrl(url));

    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: "#1e40af", light: "#ffffff" },
    })
      .then(() => setIsReady(true))
      .catch(() => toast.error("Gagal membuat QR Code."));
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qr-code-registrasi-tamu.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("QR Code berhasil diunduh");
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle>QR Code Registrasi Tamu</CardTitle>
        <CardDescription>
          Tampilkan QR Code ini di meja resepsionis agar tamu dapat scan dan mengisi formulir.
          Unduh gambar lalu cetak manual jika diperlukan.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {isPreviewUrl && (
          <div className="flex w-full items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              QR memakai URL preview Vercel. Tamu akan diminta login Vercel.
              Set <code>NEXT_PUBLIC_APP_URL</code> di Vercel ke{" "}
              <strong>https://si-tamu-rri-kdi.vercel.app</strong>
            </p>
          </div>
        )}
        <div className="rounded-xl border-4 border-primary/20 bg-white p-4 shadow-lg">
          <canvas ref={canvasRef} />
        </div>
        <p className="break-all text-center text-sm text-muted-foreground">{registerUrl}</p>
        <Button className="w-full" onClick={handleDownload} disabled={!isReady}>
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </Button>
      </CardContent>
    </Card>
  );
}
