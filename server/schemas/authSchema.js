import z from "zod";
import { IANAZone } from "luxon";

const loginAuthSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long.")
    .max(64, "Password cannot exceed 64 characters."),
});

const signUpAuthSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name must include at least one character.")
      .max(100, "Full name cannot exceed 100 characters."),
    email: z.string().trim().pipe(z.email()),
    timeZone: z.string().trim().refine(IANAZone.isValidZone, "Invalid timezone.").default("Europe/Istanbul"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(64, "Password cannot exceed 64 characters."),
    passwordConfirm: z.string(),
  })
  .refine((schema) => schema.password === schema.passwordConfirm, {
    error: "Passwords don't match.",
    path: ["passwordConfirm"],
  });

const updateUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name must include at least one character.")
      .max(100, "Full name cannot exceed 100 characters.")
      .optional(),
    timeZone: z.string().trim().refine(IANAZone.isValidZone, "Invalid timezone.").optional(),
    budget: z.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (Object.keys(data).length === 0) return false;
      else return true;
    },
    { error: "At least one field value must be provided." },
  );
const emailSchema = z.string().trim().pipe(z.email());
const tokenSchema = z
  .string({ error: "No token provided." })
  .trim()
  .min(1, "No token provided.")
  .max(255, "Token is invalid.");
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(64, "Password cannot exceed 64 characters."),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    error: "Passwords don't match.",
    path: ["passwordConfirm"],
  });
export { loginAuthSchema, signUpAuthSchema, updateUserSchema, emailSchema, resetPasswordSchema, tokenSchema };
