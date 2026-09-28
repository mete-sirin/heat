import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { verifyEmail, resendVerificationEmail } from "../services/authService";
import AuthShell from "../ui/AuthShell";
import FormField, { inputBaseClasses } from "../ui/FormField";
import Button from "../ui/Button";

export default function VerifyEmailPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [resendEmailInput, setResendEmailInput] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  const verifyQuery = useQuery({
    queryKey: ["auth", "verify-email", tokenFromUrl],
    queryFn: () => verifyEmail(tokenFromUrl),
    enabled: Boolean(tokenFromUrl),
    retry: false,
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (res) => {
      setResendSuccess(res?.message || "Verification email sent. Check your inbox.");
    },
  });

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setSearchParams({ token: tokenInput.trim() });
  };

  return (
    <AuthShell
      title="Email verification"
      subtitle="Confirm your email address to unlock your account."
    >
      <div className="flex flex-col gap-4">
        {tokenFromUrl && verifyQuery.isLoading && (
          <div className="p-4 rounded-md bg-surface-alt border border-border text-xs text-fg-secondary flex items-center gap-3">
            <span className="font-semibold text-fg">Verifying your token...</span>
          </div>
        )}

        {tokenFromUrl && verifyQuery.isSuccess && (
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-md bg-success-bg border border-success text-success text-xs font-medium">
              {verifyQuery.data?.message || "Email has been successfully verified."}
            </div>
            <Link to="/login" className="w-full">
              <Button size="lg" className="w-full">
                Proceed to log in
              </Button>
            </Link>
          </div>
        )}

        {tokenFromUrl && verifyQuery.isError && (
          <div
            role="alert"
            className="p-3.5 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
          >
            {verifyQuery.error?.message || "Invalid or already used verification link."}
          </div>
        )}

        {(!tokenFromUrl || verifyQuery.isError) && (
          <form onSubmit={handleManualVerify} className="flex flex-col gap-3">
            <FormField
              label="Verification token"
              htmlFor="verify-token-input"
              hint="Paste the 64-character hex token from your verification email link."
            >
              <input
                id="verify-token-input"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste verification token"
                className={inputBaseClasses}
              />
            </FormField>
            <Button type="submit" disabled={!tokenInput.trim()}>
              Verify token
            </Button>
          </form>
        )}

        {/* Resend Verification Link helper */}
        <div className="pt-3 border-t border-border flex flex-col gap-2.5">
          <label htmlFor="verify-resend-email" className="text-xs font-medium text-fg-secondary">
            Request a fresh verification link
          </label>
          <div className="flex gap-2">
            <input
              id="verify-resend-email"
              type="email"
              value={resendEmailInput}
              onChange={(e) => setResendEmailInput(e.target.value)}
              placeholder="you@example.com"
              className={inputBaseClasses}
            />
            <Button
              type="button"
              variant="secondary"
              isLoading={resendMutation.isPending}
              disabled={!resendEmailInput.trim()}
              onClick={() => {
                setResendSuccess("");
                resendMutation.mutate(resendEmailInput.trim());
              }}
            >
              Resend
            </Button>
          </div>
          {resendSuccess && <p className="text-xs text-success font-medium">{resendSuccess}</p>}
          {resendMutation.error && (
            <p className="text-xs text-error font-medium">{resendMutation.error.message}</p>
          )}
        </div>

        <div className="pt-2 border-t border-border text-center text-xs text-fg-secondary">
          <Link to="/login" className="underline hover:text-fg">
            Back to log in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
