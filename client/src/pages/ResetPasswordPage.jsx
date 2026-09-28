import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPasswordSchema } from "../schemas/authSchemas";
import { resetPasswordWithToken } from "../services/authService";
import AuthShell from "../ui/AuthShell";
import FormField, { inputBaseClasses } from "../ui/FormField";
import Button from "../ui/Button";

export default function ResetPasswordPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get("token") || "";
  const [manualToken, setManualToken] = useState(queryToken);
  const [tokenError, setTokenError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetPasswordWithToken,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
    },
  });

  const onSubmit = (data) => {
    const activeToken = (queryToken || manualToken).trim();
    if (!activeToken) {
      setTokenError("Reset token is required. Paste it from your reset email link.");
      return;
    }
    setTokenError("");
    resetMutation.mutate({
      token: activeToken,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
  };

  if (resetMutation.isSuccess) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your account password has been successfully changed."
      >
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-md bg-success-bg border border-success text-success text-xs font-medium">
            {resetMutation.data?.message || "Account password has been successfully changed."}
          </div>
          <Link to="/login" className="w-full">
            <Button size="lg" className="w-full">
              Proceed to log in
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your HEAT account.">
      {resetMutation.error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
        >
          {resetMutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {!queryToken && (
          <FormField
            label="Reset token"
            htmlFor="reset-token-input"
            hint="Paste the ?token=... value from the password reset email."
            required
            error={tokenError}
          >
            <input
              id="reset-token-input"
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste reset token"
              className={inputBaseClasses}
            />
          </FormField>
        )}

        <FormField
          label="New password"
          htmlFor="reset-new-password"
          hint="8 to 64 characters."
          required
          error={errors.password?.message}
        >
          <input
            id="reset-new-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputBaseClasses}
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="reset-confirm-password"
          required
          error={errors.passwordConfirm?.message}
        >
          <input
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputBaseClasses}
            {...register("passwordConfirm")}
          />
        </FormField>

        <Button type="submit" size="lg" isLoading={resetMutation.isPending} className="w-full mt-1">
          Update password
        </Button>

        <div className="pt-3 border-t border-border text-center text-xs text-fg-secondary">
          <Link to="/login" className="underline hover:text-fg">
            Back to log in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
