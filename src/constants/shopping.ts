import { ShoppingList, StoreInfo } from "../types/shopping";

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

export const mockShoppingLists: ShoppingList[] = [
  {
    id: "1",
    name: "Weekly Groceries",
    createdAt: new Date("2024-01-15"),
    budget: 150,
    totalSpent: 15.35,
    storeId: "1",
    store: AVAILABLE_STORES[0],
    items: [
      {
        id: "1",
        name: "Organic Bananas",
        quantity: 2,
        unit: "lb",
        price: 2.49,
        originalPrice: 2.99,
        isChecked: false,
        category: "Produce",
        storeId: "1",
      },
      {
        id: "2",
        name: "Whole Milk",
        quantity: 1,
        unit: "pack",
        price: 3.89,
        isChecked: true,
        category: "Dairy",
        storeId: "1",
      },
      {
        id: "3",
        name: "Chicken Breast",
        quantity: 3,
        unit: "lb",
        price: 8.97,
        originalPrice: 11.97,
        isChecked: false,
        category: "Meat",
        storeId: "1",
      },
    ],
  },
  {
    id: "2",
    name: "Party Supplies",
    createdAt: new Date("2024-01-10"),
    budget: 75,
    totalSpent: 13.45,
    storeId: "2",
    store: AVAILABLE_STORES[1],
    items: [
      {
        id: "4",
        name: "Paper Plates",
        quantity: 2,
        unit: "pack",
        price: 5.49,
        isChecked: true,
        category: "Party",
        storeId: "2",
      },
      {
        id: "5",
        name: "Chips",
        quantity: 4,
        unit: "pack",
        price: 7.96,
        isChecked: false,
        category: "Snacks",
        storeId: "2",
      },
    ],
  },
  {
    id: "3",
    name: "Healthy Snacks",
    createdAt: new Date("2024-01-08"),
    budget: 50,
    totalSpent: 0,
    storeId: "4",
    store: AVAILABLE_STORES[3],
    items: [],
  },
];
