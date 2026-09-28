import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationEmail } from "../../../services/authService";
import AuthShell from "../../../ui/AuthShell";
import Button from "../../../ui/Button";
import { inputBaseClasses } from "../../../ui/FormField";

function SignUpSuccess() {
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  const warning = location.state?.warning || null;

  const [email, setEmail] = useState(initialEmail);
  const [feedback, setFeedback] = useState("");

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (res) => {
      setFeedback(
        res?.message ||
          "If an account with this email exists and is not yet verified, a verification email has been sent.",
      );
    },
  });

  return (
    <AuthShell
      title="Check Your Email"
      subtitle="Verify your email address to activate your account."
    >
      <div className="flex flex-col gap-4">
        <div className="p-3.5 rounded-md bg-surface-alt border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-info-bg border border-primary flex items-center justify-center text-primary shrink-0 font-display font-bold">
            @
          </div>
          <div className="text-xs text-fg-secondary leading-relaxed">
            A confirmation email has been dispatched
            {email ? (
              <>
                {" "}
                to <span className="font-semibold text-fg">{email}</span>
              </>
            ) : (
              " to your address"
            )}
            .
          </div>
        </div>

        {warning && (
          <div
            role="alert"
            className="p-3 rounded-md bg-warning-bg border border-warning text-warning text-xs"
          >
            {warning}
          </div>
        )}

        <ul className="list-disc pl-5 text-xs text-fg-secondary space-y-2 leading-relaxed">
          <li>Click the verification link in the email to activate your account.</li>
          <li>If you do not see it within a few minutes, check your spam folder.</li>
          <li>
            Already have the token string?{" "}
            <Link to="/verify-email" className="text-primary underline font-semibold">
              Verify manually here
            </Link>
            .
          </li>
        </ul>

        {/* Resend Verification Section */}
        <div className="pt-3 border-t border-border flex flex-col gap-2.5">
          <label htmlFor="resend-email-input" className="text-xs font-medium text-fg-secondary">
            Didn&apos;t receive the email?
          </label>
          <div className="flex gap-2">
            <input
              id="resend-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={inputBaseClasses}
            />
            <Button
              type="button"
              variant="secondary"
              isLoading={resendMutation.isPending}
              disabled={!email.trim()}
              onClick={() => {
                setFeedback("");
                resendMutation.mutate(email.trim());
              }}
              className="shrink-0"
            >
              Resend
            </Button>
          </div>
          {feedback && <p className="text-xs text-success font-medium">{feedback}</p>}
          {resendMutation.error && (
            <p className="text-xs text-error font-medium">{resendMutation.error.message}</p>
          )}
        </div>

        <div className="pt-2">
          <Link to="/login" className="block w-full">
            <Button variant="primary" size="lg" className="w-full">
              Back To Login
            </Button>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default SignUpSuccess;
