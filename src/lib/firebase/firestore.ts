
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from './config';
import type { BillData } from '@/lib/types';

const db = getFirestore(app);

interface BillToSave extends BillData {
  userId: string;
  imageUrl: string;
}

// Helper function to remove undefined values from an object
const removeUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => removeUndefined(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const value = removeUndefined(obj[key]);
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as {[key: string]: any});
    }
    return obj;
};


export const saveBillToFirestore = async (billData: BillToSave): Promise<string> => {
  try {
    const cleanBillData = removeUndefined(billData);
    
    const docData = {
      ...cleanBillData,
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
