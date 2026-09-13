import z from "zod";

const paymentMethodEnum = [`cash`, `creditCard`, `qr`, `debitCard`];

const createSpendingSchema = z.object({
  spendingName: z
    .string()
    .trim()
    .min(1, "Spending name must be at least 1 character long"),
  spendingCategory: z
    .string()
    .trim()
    .min(1, "Spending category must be at least 1 character long")
    .optional(),
  amount: z.number().positive("Amount must be a positive number"),
  paymentMethod: z.enum(paymentMethodEnum).optional(),
});

const updateSpendingSchema = z
  .object({
    spendingName: z
      .string()
      .trim()
      .min(1, "Spending name must be at least 1 character long")
      .optional(),
    spendingCategory: z
      .string()
      .trim()
      .min(1, "Spending category must be at least 1 character long")
      .optional(),
    amount: z.number().positive("Amount must be a positive number").optional(),
    currentAmount: z
      .number()
      .positive("Current amount must be a positive number")
      .optional(),
    paymentMethod: z.enum(paymentMethodEnum).optional(),
  })
  .refine(
    (data) => {
      const hasAmount = data.amount !== undefined;
      const hasCurrentAmount = data.currentAmount !== undefined;
      return hasAmount === hasCurrentAmount;
    },
    {
      message:
        "Both 'amount' and 'currentAmount' must be provided at the same time",
      path: ["currentAmount"],
    },
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

const getSpendingsQuerySchema = z.object({
  spending_category: z
    .string()
    .trim()
    .min(1, "Spending category must be at least 1 character long")
    .optional(),
  payment_method: z.enum(paymentMethodEnum).optional(),
  ////
  amount_gte: z.coerce.number().optional(),
  amount_lte: z.coerce.number().optional(),
  ////
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
    .optional(),
  sort: z
    .enum(["amount", "created_at", "spending_category"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const checkSpendingIDSchema = z
  .string()
  .regex(/^[1-9]\d*$/, {
    message: "Spending ID must be a positive integer",
  })
  .transform(Number);

export {
  createSpendingSchema,
  updateSpendingSchema,
  getSpendingsQuerySchema,
  checkSpendingIDSchema,
};
