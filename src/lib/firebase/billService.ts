import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { BillData } from '../types';

export interface SavedBill {
  id: string;
  userId: string;
  billData: BillData;
  summaryImageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
}

/**
 * Save a new bill or update existing bill
 */
export async function saveBill(
  userId: string,
  billData: BillData,
  summaryImageUrl?: string,
  billId?: string
): Promise<string> {
  try {
    const billsRef = collection(db, 'bills');
    const docId = billId || doc(billsRef).id;
    const billDoc = doc(billsRef, docId);

    // Serialize billData to ensure it's Firestore-compatible
    const serializedBillData = JSON.parse(JSON.stringify(billData));

    // Build the bill data object, only including summaryImageUrl if it's defined
    const savedBill: any = {
      userId,
      billData: serializedBillData,
      createdAt: billId ? (await getDoc(billDoc)).data()?.createdAt || serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: true, // Public by default for sharing
    };

    // Only add summaryImageUrl if it's provided
    if (summaryImageUrl) {
      savedBill.summaryImageUrl = summaryImageUrl;
    }

    await setDoc(billDoc, savedBill);
    return docId;
  } catch (error: any) {
    console.error('Error saving bill:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get a specific bill by ID
 */
export async function getBill(billId: string): Promise<SavedBill | null> {
  try {
    const billDoc = doc(db, 'bills', billId);
    const billSnap = await getDoc(billDoc);

    if (billSnap.exists()) {
      return { id: billSnap.id, ...billSnap.data() } as SavedBill;
    }
    return null;
  } catch (error) {
    console.error('Error getting bill:', error);
    throw new Error('Failed to load bill');
  }
}

/**
 * Get all bills for a specific user
 */
export async function getUserBills(userId: string): Promise<SavedBill[]> {
  try {
    const billsRef = collection(db, 'bills');
    const q = query(
      billsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const bills: SavedBill[] = [];

    querySnapshot.forEach((doc) => {
      bills.push({ id: doc.id, ...doc.data() } as SavedBill);
    });

    // Sort by updatedAt in memory instead of requiring a composite index
    bills.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return bills;
  } catch (error) {
    console.error('Error getting user bills:', error);
    throw new Error('Failed to load bills');
  }
}

/**
 * Delete a bill
 */
export async function deleteBill(billId: string, userId: string): Promise<void> {
  try {
    const billDoc = doc(db, 'bills', billId);
    const billSnap = await getDoc(billDoc);

    if (!billSnap.exists()) {
      throw new Error('Bill not found');
    }

    const billData = billSnap.data();
    if (billData.userId !== userId) {
      throw new Error('Unauthorized to delete this bill');
    }

    await deleteDoc(billDoc);
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
}

/**
 * Update bill summary image URL
 */
export async function updateBillSummaryImage(
  billId: string,
  summaryImageUrl: string
): Promise<void> {
  try {
    const billDoc = doc(db, 'bills', billId);
    await updateDoc(billDoc, {
      summaryImageUrl,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating bill summary image:', error);
    throw new Error('Failed to update summary image');
  }
}
