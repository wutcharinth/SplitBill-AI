import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image to Firebase Storage with timeout
 * @param file - The file or blob to upload
 * @param path - Storage path (e.g., 'bills/bill-id.png')
 * @param timeoutMs - Timeout in milliseconds (default 30000ms = 30s)
 * @returns The download URL of the uploaded file
 */
export async function uploadImage(file: Blob, path: string, timeoutMs: number = 30000): Promise<string> {
  try {
    // Create upload promise
    const uploadPromise = (async () => {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    })();

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    // Race between upload and timeout
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Convert canvas/image ref to blob
 * @param canvas - HTML canvas element
 * @returns Promise<Blob>
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}
