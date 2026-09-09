import z from "zod";

const currencyEnum = [`try`, `eur`, `usd`];
const paymentMethodEnum = [`cash`, `creditCard`, `qr`, `debitCard`];

const createSpendingsSchema = z.object({
  spendingName: z
    .string()
    .trim()
    .min(1, `The name must be at least one char long`),
  spendingCategory: z
    .string()
    .trim()
    .min(1, `The category must be at least one char long`)
    .optional(),
  amount: z.number().positive(`Amount must be a positive number`),
  currency: z.enum(currencyEnum).optional(),
  paymentMethod: z.enum(paymentMethodEnum).optional(),
});

const updateSpendingSchema = createSpendingsSchema
  .partial()
  .refine(
    (schema) => Object.values(schema).some((value) => value !== undefined),
    {
      error: `At least one field must have a value`,
    },
  );

const getSpendingsQuerySchema = z.object({
  spending_category: z
    .string()
    .trim()
    .min(1, "The category must be at least one char long")
    .optional(),
  currency: z.enum(currencyEnum).optional(),
  payment_method: z.enum(paymentMethodEnum).optional(),
  ////
  amount_gte: z.coerce.number().optional(),
  amount_lte: z.coerce.number().optional(),
  ////
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .transform((val) => `${val} 23:59:59`) // it should include this or the last day basically gets omitted
    .optional(),
  sort: z
    .enum(["amount", "created_at", "spending_category"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export { createSpendingsSchema, updateSpendingSchema, getSpendingsQuerySchema };
