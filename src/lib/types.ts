

export type SplitMode = 'item' | 'evenly';

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface BillItem {
  name: string;
  price: number;
  translatedName: string | null;
  shares: number[];
  receiptIndex?: number; // Which receipt this item came from (for multi-receipt bills)
}

export interface Fee {
    id: string;
    name:string;
    translatedName: string | null;
    amount: number;
    isEnabled: boolean;
}

export interface Discount {
    id: string;
    name: string;
    amount: number;
    shares: number[]; // Person IDs sharing the discount
}

export interface Payment {
    id: string;
    amount: number;
    paidBy: string | null; // Person ID
}

export interface Receipt {
  id: string;
  imageUrl?: string | null; // Storage URL
  restaurantName: string;
  total: number;
  date: string;
}

export interface BillData {
  items: BillItem[];
  people: Person[];
  fees: Fee[];
  discounts: Discount[];
  tip: number;
  tipSplitMode: 'proportionally' | 'equally';
  payments: Payment[];
  deposits: Payment[];
  billTotal: number;
  baseCurrency: string;
  restaurantName: string;
  billDate: string;
  qrCodeImageUrl?: string | null;  // Storage URL, not base64
  uploadedReceiptUrl?: string | null;  // Storage URL, not base64 (legacy, kept for backward compatibility)
  receipts?: Receipt[]; // Multiple receipts support
  notes?: string;
}
