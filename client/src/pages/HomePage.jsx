import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSummary } from "../services/summaryService";
import { deleteSpending } from "../services/spendingsService";
import { deleteSubscription } from "../services/subscriptionsService";
import { formatLogDate, formatMoney, formatPaymentMethod } from "../utils/formatters";
import Button from "../ui/Button";
import RowActionButtons from "../ui/RowActionButtons";
import SpendingFormModal from "../features/Spendings/SpendingFormModal";
import SubscriptionFormModal from "../features/Subscriptions/SubscriptionFormModal";

function HomePage() {
  const queryClient = useQueryClient();
  const [spendingModal, setSpendingModal] = useState({
    open: false,
    item: null,
  });
  const [subscriptionModal, setSubscriptionModal] = useState({
    open: false,
    item: null,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummary,
  });

  const deleteSpendingMutation = useMutation({
    mutationFn: deleteSpending,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["spendings"] }),
        queryClient.invalidateQueries({ queryKey: ["breakdown"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["breakdown"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-32 bg-surface border border-border rounded-md p-4 animate-pulse" />
        <div className="h-44 bg-surface border border-border rounded-md p-4 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="p-4 rounded-md bg-error-bg border border-error text-error text-sm"
      >
        {error?.message || "Could not load monthly summary."}
      </div>
    );
  }

  const summary = data?.data || {};
  const userSummary = summary.user || {};
  const spendings = summary.spendings || [];
  const subscriptions = summary.subscriptions || [];

  const balance = Number(userSummary.balance ?? 0);
  const budget = Number(userSummary.budget ?? 0);
  const hasBudget = budget > 0;
  const remaining = budget - balance;
  const utilization = hasBudget ? Math.min((balance / budget) * 100, 100) : 0;
  const isOverBudget = hasBudget && remaining < 0;

  const hasSubscriptions = subscriptions.length > 0;
  const recurringTotal = subscriptions.reduce((acc, item) => acc + Number(item.amount ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Monthly Summary Hero Card */}
      <section className="bg-surface border border-border rounded-md p-5 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="num-meta">Current month spent</p>
            <h1 className="num-hero mt-0.5 tabular-nums">{formatMoney(balance)}</h1>
          </div>
          <Link
            to="/settings"
            className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border bg-surface-alt text-fg-secondary hover:text-fg transition-colors shrink-0"
          >
            {hasBudget ? "Adjust budget" : "Set budget"}
          </Link>
        </div>

        {/* Budget Progress */}
        {hasBudget ? (
          <div className="flex flex-col gap-2.5 pt-2.5 border-t border-border">
            <div className="w-full h-2 bg-surface-alt rounded-xs overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverBudget ? "bg-error" : utilization > 80 ? "bg-warning" : "bg-primary"
                }`}
                style={{ width: `${utilization}%` }}
              />
            </div>

            <p className={`num-supporting tabular-nums ${isOverBudget ? "text-error" : ""}`}>
              {isOverBudget
                ? `${formatMoney(Math.abs(remaining))} over ${formatMoney(budget)} budget`
                : `${formatMoney(remaining)} remaining of ${formatMoney(budget)} budget`}
            </p>
          </div>
        ) : (
          <p className="pt-2.5 border-t border-border num-meta">
            No budget set —{" "}
            <Link to="/settings" className="text-fg-secondary underline font-medium">
              tap Set budget
            </Link>
          </p>
        )}

        {hasSubscriptions && (
          <p className="pt-2.5 border-t border-border num-supporting tabular-nums">
            {formatMoney(recurringTotal)} recurring cycle total
          </p>
        )}
      </section>

      {/* Current Month's Spendings */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-2 border-b border-border pb-3.5">
          {/* Line 1: Full-width single-line title */}
          <h2 className="text-base font-bold text-fg truncate">This month&apos;s spendings</h2>

          {/* Line 2: Subtitle/count + View all link */}
          <div className="flex items-center justify-between gap-2">
            <span className="num-meta">
              {spendings.length} {spendings.length === 1 ? "entry" : "entries"}
            </span>
            {spendings.length > 0 && (
              <Link
                to="/spendings"
                className="text-xs font-medium text-fg-secondary hover:text-fg underline shrink-0"
              >
                View all
              </Link>
            )}
          </div>

          {/* Line 3: Dedicated CTA row */}
          <div className="pt-1">
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => setSpendingModal({ open: true, item: null })}
            >
              + Add spending
            </Button>
          </div>
        </div>

        {spendings.length === 0 ? (
          <p className="py-6 text-center num-meta">No spendings recorded for this month yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {spendings.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <p className="text-sm font-medium text-fg overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.spending_name}
                    </p>
                    <span className="num-meta shrink-0">
                      · {item.spending_category || "Generic"}
                    </span>
                  </div>
                  <p className="num-meta mt-0.5 tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
                    {formatPaymentMethod(item.payment_method)} · {formatLogDate(item.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="num-supporting tabular-nums text-fg">
                    {formatMoney(item.amount)}
                  </span>
                  <RowActionButtons
                    itemLabel={item.spending_name}
                    onEdit={() => setSpendingModal({ open: true, item })}
                    onDelete={() => deleteSpendingMutation.mutate(item.id)}
                    isDeleting={deleteSpendingMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Subscriptions */}
      <section className="bg-surface border border-border rounded-md p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-2 border-b border-border pb-3.5">
          {/* Line 1: Full-width single-line title */}
          <h2 className="text-base font-bold text-fg truncate">Active subscriptions</h2>

          {/* Line 2: Subtitle/count + Manage all link */}
          <div className="flex items-center justify-between gap-2">
            <span className="num-meta">
              {subscriptions.length} {subscriptions.length === 1 ? "subscription" : "subscriptions"}
            </span>
            {subscriptions.length > 0 && (
              <Link
                to="/subscriptions"
                className="text-xs font-medium text-fg-secondary hover:text-fg underline shrink-0"
              >
                Manage all
              </Link>
            )}
          </div>

          {/* Line 3: Dedicated CTA row */}
          <div className="pt-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => setSubscriptionModal({ open: true, item: null })}
            >
              + Add subscription
            </Button>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <p className="py-6 text-center num-meta">No recurring subscriptions tracked yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {subscriptions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <p className="text-sm font-medium text-fg overflow-hidden text-ellipsis whitespace-nowrap">
                      {sub.subscription_name}
                    </p>
                    <span className="num-meta shrink-0">
                      ·{" "}
                      {(sub.subscription_category || "Generic").charAt(0).toUpperCase() +
                        (sub.subscription_category || "Generic").slice(1)}
                    </span>
                  </div>
                  <p className="num-meta mt-0.5 tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
                    Started {formatLogDate(sub.start_date || sub.created_at)} · Every{" "}
                    {sub.length || 30} days · Next {formatLogDate(sub.next_billing_date)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="num-supporting tabular-nums text-fg">
                    {formatMoney(sub.amount)}
                  </span>
                  <RowActionButtons
                    itemLabel={sub.subscription_name}
                    onEdit={() => setSubscriptionModal({ open: true, item: sub })}
                    onDelete={() => deleteSubMutation.mutate(sub.id)}
                    isDeleting={deleteSubMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Sheet Drawers */}
      <SpendingFormModal
        isOpen={spendingModal.open}
        editingSpending={spendingModal.item}
        onClose={() => setSpendingModal({ open: false, item: null })}
      />

      <SubscriptionFormModal
        isOpen={subscriptionModal.open}
        editingSubscription={subscriptionModal.item}
        onClose={() => setSubscriptionModal({ open: false, item: null })}
      />
    </div>
  );
}

export default HomePage;
