import { BudgetEnvelope, BurnRateStatus, CurrencyCode, TransactionCategory } from "@/types/models";

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

/** One budget envelope with its burn figures; shared by the overview API and optimistic client updates. */
export function toEnvelope(e: {
  id: string;
  category: TransactionCategory;
  label: string;
  allocated: number;
  spent: number;
  cycle: string;
  icon?: string | null;
  currency?: CurrencyCode;
}): BudgetEnvelope {
  const burnPercentage = e.allocated > 0 ? Math.round((e.spent / e.allocated) * 100) : 0;
  const burnRateStatus: BurnRateStatus =
    burnPercentage > 100 ? "exceeded" : burnPercentage > 80 ? "alert" : burnPercentage > 50 ? "contained" : "normal";
  return {
    id: e.id,
    category: e.category,
    label: e.label,
    allocatedAmount: e.allocated,
    spentAmount: e.spent,
    currency: e.currency ?? "PKR",
    burnRateStatus,
    burnPercentage,
    bufferRemaining: Math.max(0, e.allocated - e.spent),
    cycle: e.cycle,
    icon: e.icon || "SavingsOutlined",
  };
}
