import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSchema } from "../schemas/authSchemas";
import { requestPasswordReset } from "../services/authService";
import AuthShell from "../ui/AuthShell";
import FormField, { inputBaseClasses } from "../ui/FormField";
import Button from "../ui/Button";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetRequestMutation = useMutation({
    mutationFn: ({ email }) => requestPasswordReset(email),
    onSuccess: (_res, variables) => {
      setSubmittedEmail(variables.email);
    },
  });

  if (submittedEmail) {
    return (
      <AuthShell title="Check your email" subtitle="Password reset instructions have been sent.">
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-md bg-surface-alt border border-border text-xs text-fg-secondary leading-relaxed">
            If an account exists for <span className="font-semibold text-fg">{submittedEmail}</span>
            , we have sent a password reset link.
          </div>

          <ul className="list-disc pl-5 text-xs text-fg-secondary space-y-2">
            <li>Check your inbox and spam folder for the reset link.</li>
            <li>
              Already copied your reset token?{" "}
              <Link to="/reset-password" className="text-primary underline font-semibold">
                Enter token and new password
              </Link>
              .
            </li>
          </ul>

          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Back to log in
              </Button>
            </Link>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSubmittedEmail("")}>
              Try another email address
            </Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter the email associated with your HEAT account to receive a password reset link."
    >
      {resetRequestMutation.error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
        >
          {resetRequestMutation.error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => resetRequestMutation.mutate(data))}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField
          label="Email address"
          htmlFor="forgot-email"
          required
          error={errors.email?.message}
        >
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputBaseClasses}
            {...register("email")}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          isLoading={resetRequestMutation.isPending}
          className="w-full"
        >
          Send reset email
        </Button>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-fg-secondary">
          <Link to="/login" className="underline hover:text-fg">
            Back to log in
          </Link>
          <Link to="/reset-password" className="underline hover:text-fg">
            Have a reset token?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
