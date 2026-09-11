import z from "zod";
import { IANAZone } from "luxon";

const loginAuthSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z
    .string()
    .trim()
    .min(8, "Your password needs to be at least 8 chars long")
    .max(64, "Entered password too long. Request denied"),
});

const signUpAuthSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Name field must include at least one char")
      .max(100, "Name field cannot be over 100 chars long"),
    email: z.string().trim().pipe(z.email()),
    timeZone: z
      .string()
      .trim()
      .refine(IANAZone.isValidZone, "Invalid timezone")
      .default("Europe/Istanbul"),
    password: z
      .string()
      .min(8, "Your password needs to be at least 8 chars long")
      .max(64, "Password can only be 64 chars long"),
    passwordConfirm: z.string(),
  })
  .refine((schema) => schema.password === schema.passwordConfirm, {
    error: "Passwords don't match",
    path: ["passwordConfirm"],
  });
export { loginAuthSchema, signUpAuthSchema };
