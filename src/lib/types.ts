

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
}

export interface Tax {
    id: 'serviceCharge' | 'vat' | 'otherTax';
    name: string;
    translatedName?: string | null;
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
  tipSplitMode: 'proportionally' | 'equally';
  billTotal: number;
  baseCurrency: string;
  restaurantName: string;
  billDate: string;
}
