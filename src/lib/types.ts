export type SplitMode = 'item' | 'evenly';

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface BillItem {
  name: string;
  price: number;
  isFree: boolean;
  translatedName: string | null;
  shares: number[];
}

export interface Tax {
    id: 'serviceCharge' | 'vat' | 'otherTax';
    name: string;
    amount: number;
    isEnabled: boolean;
}

export interface Discount {
    value: number;
    type: 'percentage' | 'fixed';
    shares: string[]; // Person IDs sharing the discount
}

export interface BillData {
  items: BillItem[];
  people: Person[];
  taxes: {
      serviceCharge: Tax;
      vat: Tax;
      otherTax: Tax;
  };
  discount: Discount;
  tip: number;
  billTotal: number;
  baseCurrency: string;
  restaurantName: string;
  billDate: string;
}

// Type for the raw data returned by the AI service
export interface GeminiResponse {
  items: Array<{
      name: string;
      price: number;
      translatedName: string | null;
  }>;
  serviceCharge?: {
      name: string;
      translatedName: string | null;
      amount: number;
  };
  vat?: {
      name: string;
      translatedName: string | null;
      amount: number;
  };
  otherTax?: {
      name: string;
      translatedName: string | null;
      amount: number;
  };
  discount?: {
      amount: number;
  };
  grandTotal?: number;
  baseCurrency?: string; // e.g., "THB"
  restaurantName?: string;
  restaurantCountry?: string; // e.g., "Thailand"
  date?: string; // e.g., "2024-05-15"
}
