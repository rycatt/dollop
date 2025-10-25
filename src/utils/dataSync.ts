import AsyncStorage from "@react-native-async-storage/async-storage";
import { isValid } from "date-fns";
import { ShoppingList } from "../constants/shopping";

const SHOPPING_STORAGE_KEY = "shopping_lists";
const PANTRY_STORAGE_KEY = "pantry_items";

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  emoji: string;
  storageLocation: "Fridge" | "Freezer" | "Pantry";
  expirationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpiringItem {
  name: string;
  daysLeft: number;
  status: "success" | "warning" | "danger";
}

export async function calculateMonthlySpending(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(SHOPPING_STORAGE_KEY);
    if (!stored) return 0;

    const lists: ShoppingList[] = JSON.parse(stored);

    const total = lists.reduce((sum, list) => {
      const listTotal = list.items.reduce((itemSum, item) => {
        return itemSum + item.price;
      }, 0);
      return sum + listTotal;
    }, 0);

    return total;
  } catch (error) {
    console.error("Error calculating monthly spending:", error);
    return 0;
  }
}

export async function calculateCategoryBreakdown(): Promise<
  {
    category: string;
    amount: number;
    percentage: number;
  }[]
> {
  try {
    const stored = await AsyncStorage.getItem(SHOPPING_STORAGE_KEY);
    if (!stored) return [];

    const lists: ShoppingList[] = JSON.parse(stored);
    const categoryTotals: { [key: string]: number } = {};
    let grandTotal = 0;

    lists.forEach((list) => {
      list.items.forEach((item) => {
        const category = item.category || "Other";
        categoryTotals[category] = (categoryTotals[category] || 0) + item.price;
        grandTotal += item.price;
      });
    });

    const breakdown = Object.entries(categoryTotals).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      }),
    );

    return breakdown.sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error("Error calculating category breakdown:", error);
    return [];
  }
}

export async function getExpiringItems(): Promise<ExpiringItem[]> {
  try {
    const stored = await AsyncStorage.getItem(PANTRY_STORAGE_KEY);
    if (!stored) return [];

    const items: any[] = JSON.parse(stored);
    const now = new Date();
    const expiringItems: ExpiringItem[] = [];

    items.forEach((item) => {
      if (!item.expirationDate) return;

      const expirationDate = new Date(item.expirationDate);
      if (!isValid(expirationDate)) return;

      const daysUntilExpiry = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry >= -1 && daysUntilExpiry <= 4) {
        let status: "success" | "warning" | "danger";

        if (daysUntilExpiry <= 1) {
          status = "danger";
        } else if (daysUntilExpiry <= 2) {
          status = "warning";
        } else {
          status = "success";
        }

        expiringItems.push({
          name: item.name,
          daysLeft: daysUntilExpiry,
          status,
        });
      }
    });

    return expiringItems.sort((a, b) => a.daysLeft - b.daysLeft);
  } catch (error) {
    console.error("Error getting expiring items:", error);
    return [];
  }
}

export function subscribeToDataChanges(
  callback: () => void,
  intervalMs: number = 1000,
): () => void {
  const interval = setInterval(callback, intervalMs);
  return () => clearInterval(interval);
}
