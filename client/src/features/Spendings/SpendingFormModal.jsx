import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PAYMENT_METHODS,
  SPENDING_CATEGORIES,
  spendingFormSchema,
} from "../../schemas/spendingSchemas";
import { createSpending, updateSpending } from "../../services/spendingsService";
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
import Button from "../../ui/Button";

export default function SpendingFormModal({ isOpen, onClose, editingSpending = null }) {
  const isEditing = Boolean(editingSpending);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(spendingFormSchema),
    defaultValues: {
      spendingName: "",
      amount: "",
      spendingCategory: "Food",
      paymentMethod: "creditCard",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingSpending) {
      form.reset({
        spendingName: editingSpending.spending_name ?? editingSpending.spendingName ?? "",
        amount: Number(editingSpending.amount ?? ""),
        spendingCategory:
          editingSpending.spending_category ?? editingSpending.spendingCategory ?? "Generic",
        paymentMethod: editingSpending.payment_method ?? editingSpending.paymentMethod ?? "cash",
      });
    } else {
      form.reset({
        spendingName: "",
        amount: "",
        spendingCategory: "Food",
        paymentMethod: "creditCard",
      });
    }
  }, [isOpen, editingSpending, form]);

  const mutation = useMutation({
    mutationFn: (values) => {
      if (isEditing) {
        const currentAmount = Number(editingSpending.amount);
        return updateSpending({
          id: editingSpending.id,
          payload: {
            spendingName: values.spendingName,
            spendingCategory: values.spendingCategory,
            paymentMethod: values.paymentMethod,
            amount: Number(values.amount),
            currentAmount,
          },
        });
      }
      return createSpending({
        spendingName: values.spendingName,
        spendingCategory: values.spendingCategory,
        paymentMethod: values.paymentMethod,
        amount: Number(values.amount),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["spendings"] }),
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
            <DrawerTitle>{isEditing ? "Edit spending" : "Add spending"}</DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Update the transaction details below."
                : "Record a new spending entry in Turkish Lira (₺)."}
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
                  <FormLabel>Amount (₺)</FormLabel>
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
              name="spendingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grocery store, coffee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="spendingCategory"
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
                        {SPENDING_CATEGORIES.map((cat) => (
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.value} value={pm.value}>
                            {pm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={mutation.isPending}>
                {isEditing ? "Save changes" : "Add spending"}
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
