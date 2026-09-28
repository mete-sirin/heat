import { z } from "zod";
import { positiveCurrencyAmount } from "./authSchemas";

const positiveDaysSchema = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return NaN;
    return Number(val);
  },
  z
    .number({ error: "Enter a cycle length in days." })
    .int("Cycle length must be a whole number of days.")
    .positive("Cycle length must be at least 1 day."),
);

export const SUBSCRIPTION_CATEGORIES = [
  "Streaming",
  "Entertainment",
  "Software",
  "Music",
  "Cloud storage",
  "Fitness",
  "Utilities",
  "Generic",
];

export const createSubscriptionFormSchema = z.object({
  subscriptionName: z
    .string()
    .trim()
    .min(1, "Subscription name is required.")
    .max(120, "Subscription name is too long."),
  amount: positiveCurrencyAmount("Enter an amount greater than ₺0."),
  length: positiveDaysSchema,
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),
  subscriptionCategory: z.string().trim().min(1, "Category is required."),
  isRecurringActive: z.boolean().optional().default(true),
});

export const editSubscriptionFormSchema = z.object({
  subscriptionName: z
    .string()
    .trim()
    .min(1, "Subscription name is required.")
    .max(120, "Subscription name is too long."),
  amount: positiveCurrencyAmount("Enter an amount greater than ₺0."),
  length: positiveDaysSchema,
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),
  subscriptionCategory: z.string().trim().min(1, "Category is required."),
  isRecurringActive: z.boolean().optional().default(true),
});
