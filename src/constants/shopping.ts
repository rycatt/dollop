export type UnitOfMeasure = "lb" | "oz" | "pieces" | "pack";
export const UNIT_OPTIONS: readonly UnitOfMeasure[] = [
  "lb",
  "oz",
  "pieces",
  "pack",
];

export const CATEGORY_OPTIONS = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Pantry",
  "Snacks",
  "Frozen",
  "Beverages",
  "Household",
  "Party",
  "Other",
] as const;

export type CategoryName = (typeof CATEGORY_OPTIONS)[number];
export const DEFAULT_CATEGORY: CategoryName = "Other";

const CATEGORY_COLOR_MAP: Record<CategoryName, string> = {
  Produce: "bg-primary-500",
  Dairy: "bg-secondary-400",
  Meat: "bg-danger",
  Bakery: "bg-accent-400",
  Pantry: "bg-secondary-600",
  Snacks: "bg-warning",
  Frozen: "bg-info",
  Beverages: "bg-primary-400",
  Household: "bg-neutral-500",
  Party: "bg-accent-500",
  Other: "bg-neutral-400",
};

export function sanitizeCategory(category?: string | null): CategoryName {
  if (!category) {
    return DEFAULT_CATEGORY;
  }
  const trimmed = category.trim();
  if (!trimmed) {
    return DEFAULT_CATEGORY;
  }

  const match = CATEGORY_OPTIONS.find(
    (option) => option.toLowerCase() === trimmed.toLowerCase(),
  );

  return (match ?? DEFAULT_CATEGORY) as CategoryName;
}

export function getCategoryColorClass(category?: string | null): string {
  return CATEGORY_COLOR_MAP[sanitizeCategory(category)];
}

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
  category?: CategoryName;
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

export const AVAILABLE_STORES: StoreInfo[] = [
  {
    id: "1",
    name: "Walmart",
    address: "123 Main St",
  },
  {
    id: "2",
    name: "Target",
    address: "456 Oak Ave",
  },
  {
    id: "3",
    name: "Kroger",
    address: "789 Pine St",
  },
  {
    id: "4",
    name: "Whole Foods",
    address: "321 Elm St",
  },
  {
    id: "5",
    name: "Not listed",
  },
];

export const STORAGE_KEY = "shopping_lists";
