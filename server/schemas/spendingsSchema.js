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

export { createSpendingsSchema, updateSpendingSchema };
