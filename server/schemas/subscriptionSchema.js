import z from "zod";

const createSubscriptionSchema = z.object({
  subscriptionName: z.string().trim().min(1, `Subscription name is required.`),
  amount: z.number().positive("Amount must be positive"),
  length: z.number().int().positive("Length must be a positive integer value"),
  subscriptionCategory: z.string().trim().optional(),
  startDate: z.iso.date(),
});

const updateSubscriptionSchema = createSubscriptionSchema
  .partial()
  .refine((schema) => Object.keys(schema).length > 0, {
    error: `At least one field must have a value`,
  });

const getSubscriptionQuerySchema = z.object({
  subscription_category: z
    .string()
    .trim()
    .min(1, "The category must be at least one char long")
    .optional(),
  amount_gte: z.coerce.number().optional(),
  amount_lte: z.coerce.number().optional(),
  sort: z
    .enum(["subscription_category", "amount", "start_date"])
    .default("amount"),

  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  getSubscriptionQuerySchema,
};
