export interface Person {
  id: string;
  name: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[]; // array of person IDs
}

export interface BillState {
  items: BillItem[];
  people: Person[];
  tax: number;
  discount: number;
  tip: number;
  originalBillTotal: number | null;
  receiptImage: string | null;
  currency: string;
}
