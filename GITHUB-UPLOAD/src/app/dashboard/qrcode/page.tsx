import { QRGenerator } from "@/components/qrcode/qr-generator";

export default function QRCodePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Generate QR Code</h1>
        <p className="text-muted-foreground">
          Buat dan unduh QR Code untuk registrasi tamu
        </p>
      </div>
      <QRGenerator />
    </div>
  );
}
