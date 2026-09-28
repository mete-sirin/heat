import { z } from "zod";

function isValidTimeZone(tz) {
  if (!tz || typeof tz !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
    return true;
  } catch {
    return false;
  }
}

export function positiveCurrencyAmount(message = "Enter an amount greater than ₺0.") {
  return z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return NaN;
      if (typeof val === "number") return val;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      return cleaned === "" ? NaN : Number(cleaned);
    },
    z.number({ error: message }).positive(message),
  );
}

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long.")
    .max(64, "Password cannot exceed 64 characters."),
});

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name must include at least one character.")
      .max(100, "Full name cannot exceed 100 characters."),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    timeZone: z
      .string()
      .trim()
      .min(1, "Timezone is required.")
      .refine(isValidTimeZone, "Invalid IANA timezone (e.g. Europe/Istanbul)."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(64, "Password cannot exceed 64 characters."),
    passwordConfirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match.",
    path: ["passwordConfirm"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(64, "Password cannot exceed 64 characters."),
    passwordConfirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match.",
    path: ["passwordConfirm"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long.")
      .max(64, "New password cannot exceed 64 characters."),
    newPasswordConfirm: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords don't match.",
    path: ["newPasswordConfirm"],
  });

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name must include at least one character.")
    .max(100, "Full name cannot exceed 100 characters."),
  timeZone: z
    .string()
    .trim()
    .min(1, "Timezone is required.")
    .refine(isValidTimeZone, "Invalid IANA timezone (e.g. Europe/Istanbul)."),
  budget: positiveCurrencyAmount("Enter a monthly budget greater than ₺0."),
});
