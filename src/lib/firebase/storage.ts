import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from './config';

const storage = getStorage(app);

export const uploadImageAndGetUrl = async (dataUrl: string, userId: string): Promise<string> => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const imagePath = `summaries/${userId}/${datePart}/${timePart}-${Math.random().toString(36).substring(2, 8)}.png`;

    const storageRef = ref(storage, imagePath);

    try {
        await uploadString(storageRef, dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
         if (error instanceof Error) {
            throw new Error(`Image upload failed: ${error.message}`);
        }
        throw new Error('An unknown error occurred during image upload.');
    }
}
