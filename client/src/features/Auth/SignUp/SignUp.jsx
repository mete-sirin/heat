import { Link, Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signUpSchema } from "../../../schemas/authSchemas";
import { signup } from "../../../services/authService";
import { useAuth } from "../../../hooks/useAuth";
import AuthShell from "../../../ui/AuthShell";
import FormField, { inputBaseClasses } from "../../../ui/FormField";
import Button from "../../../ui/Button";

function getDefaultTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul";
  } catch {
    return "Europe/Istanbul";
  }
}

function SignUp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      timeZone: getDefaultTimeZone(),
      password: "",
      passwordConfirm: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signup,
    onSuccess: (res, variables) => {
      navigate("/signup/success", {
        state: {
          email: variables.email,
          fullName: variables.fullName,
          warning: res?.warning || null,
        },
      });
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

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const onSubmit = (data) => {
    signUpMutation.mutate(data);
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Set up your HEAT account to track monthly spendings and subscriptions."
    >
      {signUpMutation.error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
        >
          {signUpMutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
        <FormField
          label="Full Name"
          htmlFor="signup-fullname"
          required
          error={errors.fullName?.message}
        >
          <input
            id="signup-fullname"
            type="text"
            autoComplete="name"
            placeholder="Your Name"
            className={inputBaseClasses}
            {...register("fullName")}
          />
        </FormField>

        <FormField label="Email" htmlFor="signup-email" required error={errors.email?.message}>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputBaseClasses}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Timezone (IANA)"
          htmlFor="signup-timezone"
          hint="Used to calculate monthly budget boundaries and billing dates."
          required
          error={errors.timeZone?.message}
        >
          <input
            id="signup-timezone"
            type="text"
            placeholder="Europe/Istanbul"
            className={inputBaseClasses}
            {...register("timeZone")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="signup-password"
          hint="Between 8 and 64 characters."
          required
          error={errors.password?.message}
        >
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputBaseClasses}
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="signup-password-confirm"
          required
          error={errors.passwordConfirm?.message}
        >
          <input
            id="signup-password-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputBaseClasses}
            {...register("passwordConfirm")}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          isLoading={signUpMutation.isPending}
          className="w-full mt-2"
        >
          Create Account
        </Button>

        <div className="pt-3 border-t border-border text-center text-xs text-fg-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold underline hover:opacity-90">
            Go Back to Login
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export default SignUp;
