import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SUBSCRIPTION_CATEGORIES,
  createSubscriptionFormSchema,
  editSubscriptionFormSchema,
} from "../../schemas/subscriptionSchemas";
import { createSubscription, updateSubscription } from "../../services/subscriptionsService";
import { getTodayIsoDate } from "../../utils/formatters";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "../../components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { CurrencyInput } from "../../components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import Button from "../../ui/Button";

const CYCLE_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "365 days", days: 365 },
];

function normalizeCategoryName(raw) {
  const cleaned = String(raw || "Streaming").trim();
  if (!cleaned) return "Streaming";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function SubscriptionFormModal({ isOpen, onClose, editingSubscription = null }) {
  const isEditing = Boolean(editingSubscription);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(isEditing ? editSubscriptionFormSchema : createSubscriptionFormSchema),
    defaultValues: {
      subscriptionName: "",
      amount: "",
      length: 30,
      startDate: getTodayIsoDate(),
      subscriptionCategory: "Streaming",
      isRecurringActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingSubscription) {
      const rawStart =
        editingSubscription.start_date ?? editingSubscription.startDate ?? getTodayIsoDate();
      const normalizedStart =
        String(rawStart)
          .trim()
          .match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || getTodayIsoDate();

      const rawCategory =
        editingSubscription.subscription_category ??
        editingSubscription.subscriptionCategory ??
        "Streaming";

      form.reset({
        subscriptionName:
          editingSubscription.subscription_name ?? editingSubscription.subscriptionName ?? "",
        amount: Number(editingSubscription.amount ?? ""),
        length: Number(editingSubscription.length ?? 30),
        startDate: normalizedStart,
        subscriptionCategory: normalizeCategoryName(rawCategory),
        isRecurringActive: true,
      });
    } else {
      form.reset({
        subscriptionName: "",
        amount: "",
        length: 30,
        startDate: getTodayIsoDate(),
        subscriptionCategory: "Streaming",
        isRecurringActive: true,
      });
    }
  }, [isOpen, editingSubscription, form]);

  const mutation = useMutation({
    mutationFn: (values) => {
      if (isEditing) {
        const currentAmount = Number(editingSubscription.amount);
        return updateSubscription({
          id: editingSubscription.id,
          payload: {
            subscriptionName: values.subscriptionName,
            subscriptionCategory: values.subscriptionCategory,
            length: Number(values.length),
            startDate: values.startDate,
            amount: Number(values.amount),
            currentAmount,
          },
        });
      }
      return createSubscription({
        subscriptionName: values.subscriptionName,
        subscriptionCategory: values.subscriptionCategory,
        amount: Number(values.amount),
        length: Number(values.length),
        startDate: values.startDate,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["breakdown"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
      onClose();
    },
    onError: (err) => {
      if (Array.isArray(err.errors)) {
        err.errors.forEach((item) => {
          if (item.field) {
            form.setError(item.field, { message: item.message });
          }
        });
      }
    },
  });

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <div>
            <DrawerTitle>{isEditing ? "Edit subscription" : "Add subscription"}</DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Modify the recurring billing cycle or amount."
                : "Track a recurring subscription in Turkish Lira (₺)."}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        {mutation.error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-md bg-error-bg border border-error text-error text-xs font-medium"
          >
            {mutation.error.message}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Primary Number Field: Amount (₺) */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount per cycle (₺)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      placeholder="₺0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscriptionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spotify, Netflix, iCloud" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="subscriptionCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBSCRIPTION_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cycle length (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="30"
                        className="font-display tabular-nums"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(digits === "" ? "" : Number(digits));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cycle Quick Presets */}
            <div className="flex items-center gap-2">
              {CYCLE_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() =>
                    form.setValue("length", preset.days, {
                      shouldValidate: true,
                    })
                  }
                  className="px-2.5 py-1 text-xs font-medium rounded-sm border border-border bg-surface-alt text-fg-secondary hover:text-fg hover:border-primary cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First billing date</FormLabel>
                  <FormDescription>
                    Used as the starting date for recurring billing and category breakdown
                    calculations.
                  </FormDescription>
                  <FormControl>
                    <Input type="date" className="font-display tabular-nums" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Active Switch (shadcn Switch) */}
            <FormField
              control={form.control}
              name="isRecurringActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between pt-2 border-t border-border">
                  <div className="flex flex-col gap-0.5">
                    <FormLabel>Active recurring cycle</FormLabel>
                    <FormDescription>
                      Automatically include in monthly billing projections
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={mutation.isPending}>
                {isEditing ? "Save changes" : "Add subscription"}
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
