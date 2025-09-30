
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from './config';
import type { BillData } from '@/lib/types';

const db = getFirestore(app);

interface BillToSave extends BillData {
  userId: string;
  imageUrl: string;
}

export const saveBillToFirestore = async (billData: BillToSave): Promise<string> => {
  try {
    const docData = {
      ...billData,
      createdAt: new Date(), // Use client-side timestamp
    };
    const docRef = await addDoc(collection(db, 'bills'), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error writing document to Firestore: ', error);
    if (error instanceof Error) {
        throw new Error(`Failed to save to database: ${error.message}`);
    }
    throw new Error('An unknown error occurred while saving to the database.');
  }
};
