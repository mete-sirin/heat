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

export { createSubscriptionSchema, updateSubscriptionSchema };
