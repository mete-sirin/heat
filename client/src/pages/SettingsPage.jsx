import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changePasswordSchema, updateProfileSchema } from "../schemas/authSchemas";
import { changePassword, updateUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { formatMoney, formatMonthYear } from "../utils/formatters";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { CurrencyInput } from "../components/ui/currency-input";
import { Slider } from "../components/ui/slider";
import Button from "../ui/Button";

export default function SettingsPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const initializedUserId = useRef(null);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // 1. Update User Profile & Monthly Budget Form (PATCH /api/v1/auth/updateuser)
  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      timeZone: user?.time_zone || "Europe/Istanbul",
      budget: Number(user?.budget) > 0 ? Number(user.budget) : "",
    },
  });

  useEffect(() => {
    if (user && initializedUserId.current !== user.id) {
      initializedUserId.current = user.id;
      const initialBudget = Number(user.budget);
      profileForm.reset({
        fullName: user.fullName || "",
        timeZone: user.time_zone || "Europe/Istanbul",
        budget: initialBudget > 0 ? initialBudget : "",
      });
    }
  }, [user, profileForm]);

  const updateProfileMutation = useMutation({
    mutationFn: (values) =>
      updateUser({
        fullName: values.fullName,
        timeZone: values.timeZone,
        budget: Number(values.budget),
      }),
    onSuccess: async () => {
      setProfileMessage("Profile and monthly budget saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ]);
    },
    onError: (err) => {
      if (Array.isArray(err.errors)) {
        err.errors.forEach((item) => {
          if (item.field) {
            profileForm.setError(item.field, { message: item.message });
          }
        });
      }
    },
  });

  // 2. Change Password Form (POST /api/v1/auth/changepassword)
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      setPasswordMessage(res?.message || "Password updated successfully.");
      passwordForm.reset();
    },
  });

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Account Summary Header */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-border">
            <h1 className="font-display text-lg font-bold text-fg truncate">
              {user?.fullName || "Account settings"}
            </h1>
            <span
              className={`px-2 py-0.5 text-[11px] font-medium rounded-xs border shrink-0 ${
                user?.isVerified
                  ? "bg-success-bg border-success text-success"
                  : "bg-warning-bg border-warning text-warning"
              }`}
            >
              {user?.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
          <p className="num-meta truncate">
            {user?.email}
            {user?.createdAt ? ` · Joined ${formatMonthYear(user.createdAt)}` : ""}
          </p>
        </div>
      </section>

      {/* Form 1: Profile & Monthly Budget */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h2 className="font-display text-base font-bold text-fg">Profile &amp; monthly budget</h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Set your target monthly spending limit in Turkish Lira (₺) and manage your profile
            details.
          </p>
        </div>

        {updateProfileMutation.error && (
          <div
            role="alert"
            className="p-3 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
          >
            {updateProfileMutation.error.message}
          </div>
        )}

        {profileMessage && (
          <div
            role="status"
            className="p-3 rounded-md bg-success-bg border border-success text-success text-xs font-medium"
          >
            {profileMessage}
          </div>
        )}

        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit((values) => {
              setProfileMessage("");
              updateProfileMutation.mutate(values);
            })}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Monthly Budget Input + Quick-Adjust Slider */}
            <FormField
              control={profileForm.control}
              name="budget"
              render={({ field }) => {
                const numericVal =
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? Math.max(field.value, 0)
                    : 0;

                // Dynamically expand slider ceiling whenever user types above ₺100,000
                const dynamicMax =
                  numericVal > 100000 ? Math.ceil((numericVal * 1.5) / 50000) * 50000 : 100000;
                const dynamicStep = dynamicMax > 100000 ? 2500 : 500;

                return (
                  <FormItem>
                    <FormLabel>Monthly budget (₺)</FormLabel>
                    <FormDescription>
                      Type any amount directly (no upper limit) or use the slider for quick
                      adjustment.
                    </FormDescription>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                        placeholder="₺0.00"
                      />
                    </FormControl>
                    <div className="pt-1">
                      <Slider
                        min={0}
                        max={dynamicMax}
                        step={dynamicStep}
                        value={[numericVal]}
                        onValueChange={([next]) => {
                          if (next !== numericVal) {
                            field.onChange(next > 0 ? next : "");
                          }
                        }}
                        aria-label="Adjust monthly budget"
                      />
                      <div className="flex justify-between num-meta mt-0.5">
                        <span>₺0</span>
                        <span>{formatMoney(dynamicMax / 2)}</span>
                        <span>{formatMoney(dynamicMax)}+</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Mete Şirin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone (IANA)</FormLabel>
                    <FormControl>
                      <Input placeholder="Europe/Istanbul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                Save profile &amp; budget
              </Button>
            </div>
          </form>
        </Form>
      </section>

      {/* Form 2: Change Password */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h2 className="font-display text-base font-bold text-fg">Change password</h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Updates your password and refreshes your active session cookie.
          </p>
        </div>

        {changePasswordMutation.error && (
          <div
            role="alert"
            className="p-3 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
          >
            {changePasswordMutation.error.message}
          </div>
        )}

        {passwordMessage && (
          <div
            role="status"
            className="p-3 rounded-md bg-success-bg border border-success text-success text-xs font-medium"
          >
            {passwordMessage}
          </div>
        )}

        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit((values) => {
              setPasswordMessage("");
              changePasswordMutation.mutate(values);
            })}
            noValidate
            className="flex flex-col gap-3.5"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPasswordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="secondary"
                isLoading={changePasswordMutation.isPending}
              >
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </section>

      {/* Session Control */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-bold text-fg">Session</h2>
          <p className="text-xs text-fg-muted truncate">End your active session on this device.</p>
        </div>
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="h-9 w-9 inline-flex items-center justify-center rounded-sm border border-error bg-error-bg text-error hover:bg-error hover:text-ink-black transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
        </button>
      </section>
    </div>
  );
}
