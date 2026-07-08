const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const TARGET_MAX_BYTES = 200 * 1024;
const MAX_DIMENSION = 1920;
const MIN_DIMENSION = 800;
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

function drawScaled(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, width, height);
  }
  return canvas;
}

/**
 * Validasi + kompres foto di sisi klien sebelum upload.
 *
 * - Validasi tipe (JPG/JPEG/PNG/WEBP) & ukuran maksimal 5MB (file asli).
 * - Target hasil maksimal 200KB, kualitas visual tetap tajam (HD).
 * - Kompresi adaptif: turunkan kualitas dulu, baru kurangi dimensi bila perlu.
 * - Aspect ratio dipertahankan, tanpa crop.
 * - Orientasi tidak diubah (browser menerapkan orientasi EXIF saat menggambar,
 *   hasil re-encode canvas tampil benar tanpa metadata EXIF).
 * - Metadata EXIF terhapus otomatis lewat re-encode canvas.
 * - Jika file asli sudah < 200KB, dikembalikan apa adanya (tanpa kompres ulang).
 */
export async function compressImage(file: File): Promise<File> {
  const type = file.type.toLowerCase();
  if (!ACCEPTED_TYPES.includes(type)) {
    throw new ImageValidationError("Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ImageValidationError("Ukuran file maksimal 5MB");
  }

  if (file.size <= TARGET_MAX_BYTES) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    let width = originalWidth;
    let height = originalHeight;
    const longest = Math.max(width, height);
    if (longest > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const outputType = supportsWebp() ? "image/webp" : "image/jpeg";
    const minQuality = outputType === "image/webp" ? 0.6 : 0.7;

    let canvas = drawScaled(img, width, height);
    if (!canvas.getContext("2d")) return file;

    let best: Blob | null = null;

    while (true) {
      let quality = outputType === "image/webp" ? 0.9 : 0.88;
      let blob = await canvasToBlob(canvas, outputType, quality);

      while (blob.size > TARGET_MAX_BYTES && quality > minQuality) {
        quality = Math.round((quality - 0.05) * 100) / 100;
        blob = await canvasToBlob(canvas, outputType, quality);
      }

      if (!best || blob.size < best.size) best = blob;

      if (blob.size <= TARGET_MAX_BYTES) {
        best = blob;
        break;
      }

      const longestSide = Math.max(canvas.width, canvas.height);
      if (longestSide <= MIN_DIMENSION) break;

      const nextWidth = Math.round(canvas.width * 0.85);
      const nextHeight = Math.round(canvas.height * 0.85);
      canvas = drawScaled(canvas, nextWidth, nextHeight);
    }

    if (!best || best.size >= file.size) {
      return file;
    }

    const ext = outputType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([best], `${baseName}.${ext}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
