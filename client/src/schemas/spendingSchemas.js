import { z } from "zod";
import { positiveCurrencyAmount } from "./authSchemas";

export const SPENDING_CATEGORIES = [
  "Food",
  "Groceries",
  "Restaurants",
  "Transport",
  "Rent & bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Generic",
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "creditCard", label: "Credit card" },
  { value: "debitCard", label: "Debit card" },
  { value: "qr", label: "QR payment" },
];

export const spendingFormSchema = z.object({
  spendingName: z
    .string()
    .trim()
    .min(1, "Spending description is required.")
    .max(120, "Spending description is too long."),
  amount: positiveCurrencyAmount("Enter an amount greater than ₺0."),
  spendingCategory: z.string().trim().min(1, "Category is required."),
  paymentMethod: z.enum(["cash", "creditCard", "qr", "debitCard"], {
    error: "Select a valid payment method.",
  }),
});
