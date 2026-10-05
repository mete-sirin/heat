import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginSchema } from "../../../schemas/authSchemas";
import { login, resendVerificationEmail } from "../../../services/authService";
import { useAuth } from "../../../hooks/useAuth";
import AuthShell from "../../../ui/AuthShell";
import FormField, { inputBaseClasses } from "../../../ui/FormField";
import Button from "../../../ui/Button";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [resendMessage, setResendMessage] = useState("");
  const notice = location.state?.notice;

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/home", { replace: true });
    },
    onError: (err) => {
      if (Array.isArray(err.errors)) {
        err.errors.forEach((item) => {
          if (item.field) {
            setError(item.field, { message: item.message });
          }
        });
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (res) => {
      setResendMessage(res?.message || "Verification email has been sent. Check your inbox.");
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const onSubmit = (data) => {
    setResendMessage("");
    loginMutation.mutate(data);
  };

  const isUnverifiedError = loginMutation.error?.message?.toLowerCase().includes("not verified");

  return (
    <AuthShell title="Log In" subtitle="Enter your credentials to access your HEAT ledger.">
      {notice && (
        <div
          role="status"
          className="mb-4 p-3 rounded-md bg-success-bg border border-success text-success text-xs font-medium"
        >
          {notice}
        </div>
      )}

      {loginMutation.error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-md bg-error-bg border border-error text-error text-xs flex flex-col gap-2"
        >
          <span className="font-medium">{loginMutation.error.message}</span>
          {isUnverifiedError && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-error/30">
              <span className="text-fg-secondary">Need a new link?</span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                isLoading={resendMutation.isPending}
                onClick={() => {
                  const emailVal = getValues("email");
                  if (emailVal) resendMutation.mutate(emailVal);
                }}
              >
                Resend Verification
              </Button>
            </div>
          )}
        </div>
      )}

      {resendMessage && (
        <div
          role="status"
          className="mb-4 p-3 rounded-md bg-success-bg border border-success text-success text-xs font-medium"
        >
          {resendMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="login-email" required error={errors.email?.message}>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputBaseClasses}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="login-password"
          required
          error={errors.password?.message}
        >
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputBaseClasses}
            {...register("password")}
          />
        </FormField>

        <div className="flex items-center justify-between text-xs pt-1">
          <Link
            to="/forgot-password"
            className="text-fg-secondary hover:text-fg underline font-medium"
          >
            Forgot Password?
          </Link>
          <Link to="/verify-email" className="text-fg-muted hover:text-fg-secondary underline">
            Have a verification token?
          </Link>
        </div>

        <Button type="submit" size="lg" isLoading={loginMutation.isPending} className="w-full mt-1">
          Enter
        </Button>

        <div className="pt-3 border-t border-border text-center text-xs text-fg-secondary">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary font-semibold underline hover:opacity-90">
            Sign Up
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export default Login;
