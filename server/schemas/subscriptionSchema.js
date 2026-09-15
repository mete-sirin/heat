import z from "zod";

const createSubscriptionSchema = z.object({
  subscriptionName: z.string().trim().min(1, `Subscription name is required.`),
  amount: z.number().positive("Amount must be positive"),
  length: z.number().int().positive("Length must be a positive integer value"),
  subscriptionCategory: z.string().trim().optional(),
  startDate: z.iso.date(),
});

const updateSubscriptionSchema = z
  .object({
    subscriptionName: z.string().trim().min(1, `Subscription name is required.`),
    amount: z.number().positive("Amount must be positive"),
    currentAmount: z.number().positive("Amount must be positive"),
    length: z.number().int().positive("Length must be a positive integer value"),
    subscriptionCategory: z.string().trim().optional(),
  })
  .partial()
  .refine(
    (data) =>
      (data.amount === undefined && data.currentAmount === undefined) || (data.amount !== undefined && data.currentAmount !== undefined),
  )
  .refine((data) => Object.keys(data).length !== 0);

const getSubscriptionQuerySchema = z.object({
  subscription_category: z.string().trim().min(1, "Subscription category must be at least 1 character long").optional(),
  amount_gte: z.coerce.number().optional(),
  amount_lte: z.coerce.number().optional(),
  sort: z.enum(["subscription_category", "amount", "start_date"]).default("amount"),

  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const checkSubscriptionIDSchema = z
  .string()
  .regex(/^[1-9]\d*$/, {
    message: "Subscription ID must be a positive integer",
  })
  .transform(Number);

export { createSubscriptionSchema, updateSubscriptionSchema, getSubscriptionQuerySchema, checkSubscriptionIDSchema };
