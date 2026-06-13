"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppUrl } from "@/lib/utils";
import { toast } from "sonner";

export function QRGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [registerUrl, setRegisterUrl] = useState("");

  useEffect(() => {
    const url = `${getAppUrl()}/register`;
    setRegisterUrl(url);

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: "#1e40af", light: "#ffffff" },
      });
    }
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qr-code-registrasi-tamu.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("QR Code berhasil diunduh");
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup diblokir. Izinkan popup untuk mencetak.");
      return;
    }
    const dataUrl = canvasRef.current.toDataURL("image/png");
    printWindow.document.write(`
      <html>
        <head><title>QR Code - Registrasi Tamu</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
          <h1 style="color:#1e40af;margin-bottom:8px;">LPP RRI Kendari</h1>
          <p style="margin-bottom:24px;color:#666;">Scan QR Code untuk Registrasi Tamu</p>
          <img src="${dataUrl}" style="width:300px;height:300px;" />
          <p style="margin-top:16px;font-size:12px;color:#999;">${registerUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle>QR Code Registrasi Tamu</CardTitle>
        <CardDescription>
          Tampilkan QR Code ini di meja resepsionis agar tamu dapat scan dan mengisi formulir
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="rounded-xl border-4 border-primary/20 bg-white p-4 shadow-lg">
          <canvas ref={canvasRef} />
        </div>
        <p className="break-all text-center text-sm text-muted-foreground">{registerUrl}</p>
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
