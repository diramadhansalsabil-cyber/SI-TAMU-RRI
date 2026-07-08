const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const TARGET_MAX_BYTES = 500 * 1024;
const SKIP_COMPRESS_BELOW = 300 * 1024;
const MAX_DIMENSION = 1920;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export class ImageValidationError extends Error {}

function supportsWebp(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageValidationError("Gagal membaca gambar"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageValidationError("Gagal memproses gambar"))),
      type,
      quality
    );
  });
}

/**
 * Validasi + kompres foto di sisi klien sebelum upload.
 * - Validasi tipe (JPG/JPEG/PNG/WEBP) dan ukuran maksimal 5MB (file asli).
 * - Re-encode lewat canvas sehingga metadata EXIF otomatis terhapus.
 * - Menjaga resolusi (turun hanya jika sisi terpanjang > 1920px).
 * - Target hasil 100-500KB; file kecil (<300KB) dilewati agar tidak over-compress.
 */
export async function compressImage(file: File): Promise<File> {
  const type = file.type.toLowerCase();
  if (!ACCEPTED_TYPES.includes(type)) {
    throw new ImageValidationError("Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ImageValidationError("Ukuran file maksimal 5MB");
  }

  if (file.size < SKIP_COMPRESS_BELOW) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    const longest = Math.max(width, height);
    if (longest > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const outputType = supportsWebp() ? "image/webp" : "image/jpeg";

    let quality = 0.85;
    let blob = await canvasToBlob(canvas, outputType, quality);
    while (blob.size > TARGET_MAX_BYTES && quality > 0.5) {
      quality = Math.round((quality - 0.1) * 100) / 100;
      blob = await canvasToBlob(canvas, outputType, quality);
    }

    if (blob.size > TARGET_MAX_BYTES) {
      let scaledCanvas = canvas;
      while (blob.size > TARGET_MAX_BYTES && Math.max(scaledCanvas.width, scaledCanvas.height) > 640) {
        const next = document.createElement("canvas");
        next.width = Math.round(scaledCanvas.width * 0.85);
        next.height = Math.round(scaledCanvas.height * 0.85);
        const nctx = next.getContext("2d");
        if (!nctx) break;
        nctx.drawImage(scaledCanvas, 0, 0, next.width, next.height);
        scaledCanvas = next;
        blob = await canvasToBlob(scaledCanvas, outputType, 0.8);
      }
    }

    if (blob.size >= file.size) {
      return file;
    }

    const ext = outputType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.${ext}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
