export type UnitOfMeasure = 'lb' | 'oz' | 'pieces' | 'pack';

export interface StoreInfo {
  id: string;
  name: string;
  address?: string;
  distance?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitOfMeasure;
  price: number;
  originalPrice?: number;
  isChecked: boolean;
  category?: string;
  storeId?: string;
  store?: StoreInfo;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: Date;
  budget: number;
  totalSpent: number;
  storeId?: string;
  store?: StoreInfo;
  items: ShoppingListItem[];
}
