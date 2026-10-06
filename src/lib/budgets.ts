import { TransactionCategory } from "@/types/models";

/** Spending categories a budget can be set for (matches the budget_envelopes check constraint). */
export const BUDGET_CATEGORIES: { category: TransactionCategory; label: string; icon: string }[] = [
  { category: "food_dining", label: "Food & Dining", icon: "RestaurantOutlined" },
  { category: "housing_utilities", label: "Housing & Utilities", icon: "HomeOutlined" },
  { category: "transport_transit", label: "Transport & Transit", icon: "DirectionsCarOutlined" },
  { category: "shopping_gear", label: "Shopping & Gear", icon: "ShoppingBagOutlined" },
  { category: "health_wellness", label: "Health & Wellness", icon: "FavoriteBorderOutlined" },
  { category: "knowledge_subs", label: "Knowledge & Subscriptions", icon: "MenuBookOutlined" },
  { category: "other", label: "Other", icon: "SavingsOutlined" },
];

/** Budget cycle key for the current month, e.g. "2026-10" (local time). */
export function currentCycle(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
