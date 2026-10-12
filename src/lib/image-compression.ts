import imageCompression from 'browser-image-compression';

// Images are stored in Firestore as base64 data URLs, and a document is limited to ~1 MiB.
const FIRESTORE_BYTE_LIMIT = 1048487;

export class ImageTooLargeError extends Error {}

// Resizes/compresses an image (max 1920 px, ~0.7 MB) and returns it as a data URL.
export async function compressImageToDataUrl(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.7, // Ridotto per sicurezza con la codifica Base64
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
  if (dataUrl.length > FIRESTORE_BYTE_LIMIT) {
    throw new ImageTooLargeError('Image exceeds the Firestore document limit after compression');
  }
  return dataUrl;
}

export async function compressDataUrl(dataUrl: string): Promise<string> {
  return compressImageToDataUrl(await imageCompression.getFilefromDataUrl(dataUrl, 'image'));
}
