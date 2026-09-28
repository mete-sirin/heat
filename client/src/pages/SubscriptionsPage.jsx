import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubscriptions, deleteSubscription } from "../services/subscriptionsService";
import { SUBSCRIPTION_CATEGORIES } from "../schemas/subscriptionSchemas";
import { formatLogDate, formatMoney } from "../utils/formatters";
import Button from "../ui/Button";
import RowActionButtons from "../ui/RowActionButtons";
import { CurrencyInput } from "../components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import SubscriptionFormModal from "../features/Subscriptions/SubscriptionFormModal";

const INITIAL_FILTERS = {
  subscription_category: "",
  amount_gte: "",
  amount_lte: "",
  sort: "amount",
  sort_order: "desc",
  page: 1,
  limit: 15,
};

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, setModalState] = useState({ open: false, item: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subscriptions", filters],
    queryFn: () => getSubscriptions(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: async () => {
      setConfirmDeleteId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["breakdown"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
    },
  });

  const subscriptions = data?.data?.subscriptions || [];
  const pagination = data?.pagination || {
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const pageTotal = subscriptions.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <section className="bg-surface border border-border rounded-md p-4 flex flex-col gap-2">
        <h1 className="text-lg font-bold text-fg truncate">Subscriptions</h1>

        <div className="flex items-center justify-between gap-2">
          <span className="num-meta">
            {pagination.totalCount} active
            {subscriptions.length > 0 ? ` · ${formatMoney(pageTotal)} cycle total` : ""}
          </span>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="text-xs font-medium text-fg-secondary hover:text-fg underline cursor-pointer shrink-0"
          >
            {showFilters ? "Hide filters" : "Filter & sort"}
          </button>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={() => setModalState({ open: true, item: null })}
          >
            + Add subscription
          </Button>
        </div>
      </section>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <section className="bg-surface border border-border rounded-md p-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-fg-secondary mb-1">Category</label>
              <Select
                value={filters.subscription_category || "__all__"}
                onValueChange={(val) =>
                  updateFilter("subscription_category", val === "__all__" ? "" : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All categories</SelectItem>
                  {SUBSCRIPTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-secondary mb-1">
                Min amount (₺)
              </label>
              <CurrencyInput
                value={filters.amount_gte}
                onValueChange={(val) => updateFilter("amount_gte", val)}
                placeholder="₺0.00"
                className="h-10 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-secondary mb-1">
                Max amount (₺)
              </label>
              <CurrencyInput
                value={filters.amount_lte}
                onValueChange={(val) => updateFilter("amount_lte", val)}
                placeholder="Any"
                className="h-10 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-secondary mb-1">Sort by</label>
              <Select value={filters.sort} onValueChange={(val) => updateFilter("sort", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="start_date">Start date</SelectItem>
                  <SelectItem value="subscription_category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-secondary mb-1">Order</label>
              <Select
                value={filters.sort_order}
                onValueChange={(val) => updateFilter("sort_order", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setFilters(INITIAL_FILTERS)}
            >
              Reset filters
            </Button>
          </div>
        </section>
      )}

      {/* Subscriptions List */}
      <section className="bg-surface border border-border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center num-meta">Loading subscriptions...</div>
        ) : isError ? (
          <div className="p-4 text-xs text-error bg-error-bg">
            {error?.message || "Failed to load subscriptions."}
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="p-8 text-center num-meta">
            No recurring subscriptions match your current view.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-surface-alt/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-fg overflow-hidden text-ellipsis whitespace-nowrap">
                      {sub.subscription_name}
                    </span>
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
                    onEdit={() => setModalState({ open: true, item: sub })}
                    isConfirming={confirmDeleteId === sub.id}
                    onRequestConfirm={() => setConfirmDeleteId(sub.id)}
                    onCancelConfirm={() => setConfirmDeleteId(null)}
                    onDelete={() => deleteMutation.mutate(sub.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 bg-surface-alt border-t border-border flex items-center justify-between text-xs">
            <span className="num-meta">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination.hasPrevPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <SubscriptionFormModal
        isOpen={modalState.open}
        editingSubscription={modalState.item}
        onClose={() => setModalState({ open: false, item: null })}
      />
    </div>
  );
}
